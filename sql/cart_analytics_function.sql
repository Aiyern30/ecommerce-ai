CREATE OR REPLACE FUNCTION get_cart_analytics()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
declare
  abandoned_carts int;
  average_cart_value numeric;
  conversion_rate numeric;
  carts_by_hour jsonb;
  top_abandoned_products jsonb;
  cart_age_distribution jsonb;
  total_carts int;
  completed_purchases int;
begin
  -- Get total carts and completed purchases for standard abandonment calculation
  select count(distinct c.id) into total_carts
  from carts c
  join cart_items ci on ci.cart_id = c.id;

  select count(distinct c.id) into completed_purchases
  from carts c
  join cart_items ci on ci.cart_id = c.id
  join orders o on o.user_id = c.user_id
  where o.payment_status = 'paid'
    and o.created_at >= c.created_at; -- Order came after cart

  -- Standard abandoned cart calculation: total_carts - completed_purchases
  abandoned_carts := total_carts - completed_purchases;

  -- Average value of all carts (including non-abandoned ones)
  select avg(cart_total) into average_cart_value
  from (
    select c.id, sum(
      ci.quantity * 
      case ci.variant_type
        when 'pump' then coalesce(p.pump_price, p.normal_price)
        when 'tremie_1' then coalesce(p.tremie_1_price, p.normal_price)
        when 'tremie_2' then coalesce(p.tremie_2_price, p.normal_price)
        when 'tremie_3' then coalesce(p.tremie_3_price, p.normal_price)
        else p.normal_price
      end
    ) as cart_total
    from carts c
    join cart_items ci on ci.cart_id = c.id
    join products p on ci.product_id = p.id
    group by c.id
    having sum(ci.quantity) > 0
  ) t;

  -- Conversion rate: Standard e-commerce formula
  select round(
    case 
      when total_carts > 0 then (completed_purchases::decimal / total_carts * 100)
      else 0 
    end, 1
  ) into conversion_rate;

  -- Carts by time periods (more readable than 24 individual hours)
  select jsonb_agg(
    jsonb_build_object(
      'hour', periods.time_period,
      'carts', coalesce(period_data.carts, 0),
      'abandoned', coalesce(period_data.abandoned, 0)
    ) 
    order by 
      case periods.time_period
        when 'Early Morning (00-06)' then 1
        when 'Morning (06-12)' then 2
        when 'Afternoon (12-18)' then 3
        when 'Evening (18-24)' then 4
      end
  ) into carts_by_hour 
  from (
    select unnest(array[
      'Early Morning (00-06)',
      'Morning (06-12)', 
      'Afternoon (12-18)',
      'Evening (18-24)'
    ]) as time_period
  ) periods
  left join (
    select 
      case 
        when extract(hour from c.updated_at) between 0 and 5 then 'Early Morning (00-06)'
        when extract(hour from c.updated_at) between 6 and 11 then 'Morning (06-12)'
        when extract(hour from c.updated_at) between 12 and 17 then 'Afternoon (12-18)'
        else 'Evening (18-24)'
      end as time_period,
      count(distinct c.id)::int as carts,
      count(distinct c.id)::int - count(distinct case 
        when exists (
          select 1 from orders o 
          where o.user_id = c.user_id 
            and o.created_at >= c.created_at
            and o.payment_status = 'paid'
        ) then c.id 
        else null 
      end)::int as abandoned
    from carts c
    join cart_items ci on ci.cart_id = c.id
    where c.updated_at >= current_date - interval '30 days'
    group by 1  -- Use position reference instead of column name to avoid ambiguity
  ) period_data on periods.time_period = period_data.time_period;

  -- Top abandoned products - count cart_items, not individual quantities
  -- This will show how many times each product appears in abandoned carts
  select jsonb_agg(obj) into top_abandoned_products from (
    select 
      p.name, 
      count(distinct ci.id)::int as abandoned_count, -- Count cart_items entries, not quantities
      sum(
        ci.quantity * 
        case ci.variant_type
          when 'pump' then coalesce(p.pump_price, p.normal_price)
          when 'tremie_1' then coalesce(p.tremie_1_price, p.normal_price)
          when 'tremie_2' then coalesce(p.tremie_2_price, p.normal_price)
          when 'tremie_3' then coalesce(p.tremie_3_price, p.normal_price)
          else p.normal_price
        end
      )::float as value
    from carts c
    join cart_items ci on ci.cart_id = c.id
    join products p on ci.product_id = p.id
    where c.updated_at < now() - interval '24 hours'
      and not exists (
        select 1 from orders o 
        where o.user_id = c.user_id 
          and o.created_at > c.updated_at 
          and o.payment_status = 'paid'
      )
    group by p.id, p.name
    having count(distinct ci.id) > 0
    order by abandoned_count desc
    limit 5
  ) obj;

  -- Cart age distribution - only for truly abandoned carts
  select jsonb_agg(obj) into cart_age_distribution from (
    select 
      age_range as "ageRange",
      count(*)::int as count,
      case
        when age_range = '1-24 hours' then '#f97316'
        when age_range = '1-7 days' then '#eab308'
        when age_range = '1-30 days' then '#6b7280'
        else '#374151'
      end as color
    from (
      select 
        case
          when now() - c.updated_at < interval '24 hours' then '< 24 hours'
          when now() - c.updated_at < interval '7 days' then '1-7 days'
          when now() - c.updated_at < interval '30 days' then '1-30 days'
          else '> 30 days'
        end as age_range
      from carts c
      join cart_items ci on ci.cart_id = c.id
      where c.updated_at < now() - interval '24 hours' -- Only consider after grace period
        and not exists (
          select 1 from orders o 
          where o.user_id = c.user_id 
            and o.created_at > c.updated_at 
            and o.payment_status = 'paid'
        )
    ) t
    group by age_range
    order by 
      case age_range
        when '< 24 hours' then 1
        when '1-7 days' then 2
        when '1-30 days' then 3
        else 4
      end
  ) obj;

  return jsonb_build_object(
    'abandonedCarts', coalesce(abandoned_carts, 0),
    'averageCartValue', coalesce(average_cart_value, 0),
    'conversionRate', coalesce(conversion_rate, 0),
    'cartsByHour', coalesce(carts_by_hour, '[]'::jsonb),
    'topAbandonedProducts', coalesce(top_abandoned_products, '[]'::jsonb),
    'cartAgeDistribution', coalesce(cart_age_distribution, '[]'::jsonb)
  );
end;
$$;
