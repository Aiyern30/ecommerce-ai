# YTL Concrete Hub - Database Functions

This document provides comprehensive documentation for all custom database functions implemented in the YTL Concrete Hub platform.

## 🔧 Function Overview

The database functions are organized into several categories:

- **User Management**: Staff promotion/demotion and user handling
- **Business Analytics**: Cart, customer, and product performance analysis
- **Data Maintenance**: Triggers and utility functions
- **Search & Text Processing**: PostgreSQL trigram functions for advanced search

## 📊 Custom Business Functions

### 👥 User Management Functions

#### `promote_user_to_staff(admin_user_id, user_email, user_id)`

Promotes a regular user to staff role with comprehensive metadata tracking.

**Parameters:**

- `admin_user_id` (uuid): ID of the admin performing the promotion
- `user_email` (text, optional): Email of user to promote
- `user_id` (uuid, optional): Direct user ID to promote

**Returns:** JSON object with success/error status

**Usage:**

```sql
-- Promote by email
SELECT promote_user_to_staff(
  'admin-uuid-here'::uuid,
  'user@example.com'
);

-- Promote by user ID
SELECT promote_user_to_staff(
  'admin-uuid-here'::uuid,
  NULL,
  'user-uuid-here'::uuid
);
```

**Business Logic:**

- Updates both `raw_app_meta_data` and `raw_user_meta_data`
- Tracks promotion timestamp and admin who performed the action
- Validates user existence before promotion
- Returns detailed success/error information

#### `demote_user_from_staff(admin_user_id, user_id)`

Demotes a staff user back to customer role.

**Parameters:**

- `admin_user_id` (uuid): ID of the admin performing the demotion
- `user_id` (uuid): ID of staff user to demote

**Returns:** JSON object with success/error status

**Usage:**

```sql
SELECT demote_user_from_staff(
  'admin-uuid-here'::uuid,
  'staff-user-uuid-here'::uuid
);
```

**Business Logic:**

- Reverts user role to 'customer'
- Tracks demotion metadata for audit purposes
- Maintains user access while removing staff privileges

#### `handle_new_user()`

Trigger function that automatically creates user profiles for new registrations.

**Trigger Type:** AFTER INSERT on `auth.users`

**Business Logic:**

- Automatically creates profile records for new users
- Extracts metadata from user registration data
- Ensures data consistency between auth and application tables

### 📈 Analytics Functions

#### `get_cart_analytics()`

Comprehensive shopping cart analytics for business intelligence.

**Returns:** JSONB object with cart performance metrics

**Usage:**

```sql
SELECT get_cart_analytics();
```

**Returned Data Structure:**

```json
{
  "abandonedCarts": 45,
  "averageCartValue": 320.5,
  "conversionRate": 12.5,
  "cartsByHour": [
    {
      "hour": "Morning (06-12)",
      "carts": 25,
      "abandoned": 20
    }
  ],
  "topAbandonedProducts": [
    {
      "name": "C30 Concrete",
      "abandoned_count": 15,
      "value": 4800.0
    }
  ],
  "cartAgeDistribution": [
    {
      "ageRange": "1-24 hours",
      "count": 12,
      "color": "#f97316"
    }
  ]
}
```

**Business Metrics:**

- **Abandoned Carts**: Carts without completed purchases after 24 hours
- **Conversion Rate**: Percentage of carts that convert to paid orders
- **Average Cart Value**: Mean value across all active carts
- **Time-based Analysis**: Cart activity patterns by time periods
- **Product Insights**: Most frequently abandoned products
- **Age Distribution**: How long carts remain inactive

#### `get_customer_insights()`

Customer behavior and segmentation analytics.

**Returns:** JSONB object with customer metrics

**Usage:**

```sql
SELECT get_customer_insights();
```

**Returned Data Structure:**

```json
{
  "totalCustomers": 150,
  "repeatCustomers": 65,
  "averageOrderValue": 285.75,
  "customerLifetimeValue": 420.3,
  "orderFrequency": [
    {
      "frequency": "1 order",
      "customers": 85
    }
  ],
  "topStates": [
    {
      "state": "Selangor",
      "customers": 45,
      "orders": 120
    }
  ],
  "customerSegments": [
    {
      "segment": "High Value",
      "count": 25,
      "value": 1250.0,
      "color": "#10b981"
    }
  ]
}
```

**Customer Segmentation:**

- **High Value**: Customers with orders ≥ RM2,000
- **Regular**: Customers with orders ≥ RM800
- **Occasional**: Customers with orders ≥ RM300
- **New**: Customers with orders < RM300

#### `get_product_performance()`

Product catalog and inventory performance analytics.

**Returns:** JSONB object with product metrics

**Usage:**

```sql
SELECT get_product_performance();
```

**Returned Data Structure:**

```json
{
  "topStockProducts": [
    {
      "name": "C25 Concrete",
      "price": 280.0,
      "stock": 500,
      "product_type": "concrete"
    }
  ],
  "categoryPerformance": [
    {
      "product_type": "concrete",
      "totalProducts": 15,
      "totalStock": 2500,
      "avgPrice": 295.5
    }
  ],
  "lowStockProducts": [
    {
      "name": "Special Mix Mortar",
      "stock": 25,
      "price": 320.0
    }
  ],
  "priceAnalysis": [
    {
      "priceRange": "RM301-320",
      "products": 8
    }
  ],
  "topSellingProducts": [
    {
      "name": "C30 Concrete",
      "totalSold": 150,
      "totalRevenue": 45000.0
    }
  ]
}
```

**Performance Metrics:**

- **Stock Analysis**: High and low stock product identification
- **Category Performance**: Performance by product type (concrete/mortar)
- **Price Distribution**: Product count by price ranges
- **Sales Performance**: Top-selling products by quantity and revenue

### 🔧 Utility Functions

#### `ensure_single_default_address()`

Trigger function ensuring only one default address per user.

**Trigger Type:** BEFORE INSERT/UPDATE on `addresses`

**Business Logic:**

- Automatically unsets other default addresses when setting a new default
- Makes the first address default if it's the only one for the user
- Maintains data integrity for address management

#### `update_updated_at_column()`

Generic trigger function for automatic timestamp updates.

**Trigger Type:** BEFORE UPDATE

**Usage:**

```sql
CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Business Logic:**

- Automatically sets `updated_at` to current timestamp on row updates
- Ensures accurate change tracking across all tables

#### `update_updated_date_column()`

Alternative timestamp update function for legacy compatibility.

**Trigger Type:** BEFORE UPDATE

**Business Logic:**

- Similar to `update_updated_at_column()` but uses `updated_date` column
- Maintains backward compatibility with existing schemas

## 🔍 PostgreSQL Trigram Functions

These functions are part of the `pg_trgm` extension for advanced text search capabilities:

### Core Trigram Functions

#### `similarity(text, text) → real`

Calculates similarity between two text strings using trigrams.

```sql
SELECT similarity('concrete', 'concret');
-- Returns: 0.75
```

#### `word_similarity(text, text) → real`

Calculates word-level similarity between strings.

```sql
SELECT word_similarity('high grade concrete', 'concrete');
-- Returns: 0.85
```

#### `strict_word_similarity(text, text) → real`

Stricter word similarity calculation with exact word boundary matching.

#### `show_trgm(text) → text[]`

Shows the trigrams extracted from a text string.

```sql
SELECT show_trgm('concrete');
-- Returns: {"  c"," co","con","onc","ncr","cre","ret","ete","te "}
```

### Trigram Operators

#### Similarity Operators

- `%` - Similarity operator (equivalent to `similarity_op`)
- `<%` - Word similarity operator
- `<<%` - Strict word similarity operator

#### Distance Operators

- `<->` - Distance operator (1 - similarity)
- `<<->` - Word distance operator
- `<<<->` - Strict word distance operator

### Index Support Functions

#### `gin_extract_value_trgm(text, internal) → internal`

Extracts trigrams for GIN index creation.

#### `gin_extract_query_trgm(text, ...) → internal`

Extracts query trigrams for GIN index searches.

#### `gin_trgm_consistent(internal, ...) → boolean`

Determines if a trigram query matches indexed values.

### Configuration Functions

#### `set_limit(real) → real`

Sets the similarity threshold for trigram matching.

```sql
SELECT set_limit(0.3);  -- Set 30% similarity threshold
```

#### `show_limit() → real`

Shows the current similarity threshold.

```sql
SELECT show_limit();
-- Returns: 0.3
```

## 🚀 Usage Examples

### Business Analytics Dashboard

```sql
-- Get comprehensive business insights
WITH cart_data AS (
  SELECT get_cart_analytics() as analytics
),
customer_data AS (
  SELECT get_customer_insights() as insights
),
product_data AS (
  SELECT get_product_performance() as performance
)
SELECT
  cart_data.analytics,
  customer_data.insights,
  product_data.performance
FROM cart_data, customer_data, product_data;
```

### User Management

```sql
-- Promote multiple users to staff
SELECT promote_user_to_staff(
  'admin-id'::uuid,
  email
) as result
FROM (VALUES
  ('manager@company.com'),
  ('supervisor@company.com')
) AS users(email);
```

### Advanced Product Search

```sql
-- Find products with fuzzy text matching
SELECT
  name,
  similarity(name, 'concete') as sim_score
FROM products
WHERE name % 'concete'  -- Fuzzy match for 'concrete'
ORDER BY sim_score DESC;
```

### Cart Abandonment Analysis

```sql
-- Detailed cart abandonment insights
SELECT
  (analytics->>'abandonedCarts')::int as abandoned_count,
  (analytics->>'conversionRate')::numeric as conversion_rate,
  analytics->'topAbandonedProducts' as top_products
FROM (
  SELECT get_cart_analytics() as analytics
) t;
```

## 🔧 Maintenance & Monitoring

### Performance Considerations

1. **Analytics Functions**: Cache results for dashboard queries
2. **Trigram Functions**: Create appropriate GIN indexes for text search
3. **Trigger Functions**: Monitor for performance impact on high-volume tables

### Recommended Indexes

```sql
-- For product search
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- For blog search
CREATE INDEX idx_blogs_title_trgm ON blogs USING GIN (title gin_trgm_ops);

-- For analytics performance
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_cart_items_updated ON cart_items(updated_at);
```

### Function Monitoring

```sql
-- Monitor function execution times
SELECT
  schemaname,
  funcname,
  calls,
  total_time,
  mean_time
FROM pg_stat_user_functions
WHERE schemaname = 'public'
ORDER BY total_time DESC;
```

## 📞 Support

For function-related questions or performance issues, contact the development team or refer to the [PostgreSQL function documentation](https://www.postgresql.org/docs/current/xfunc.html).

---

**Note**: Some trigram functions are C language extensions provided by PostgreSQL's `pg_trgm` module. These are standard PostgreSQL functions used for advanced text search capabilities.
