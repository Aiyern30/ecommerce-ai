import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Fetch orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    // 2. Fetch order_items
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .select("*");

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // 3. Fetch additional_services
    const { data: additionalServices, error: servicesError } =
      await supabaseAdmin.from("order_additional_services").select("*");

    if (servicesError) {
      return NextResponse.json(
        { error: servicesError.message },
        { status: 500 }
      );
    }

    // 4. Fetch addresses
    const { data: addresses, error: addressesError } = await supabaseAdmin
      .from("addresses")
      .select("*");

    if (addressesError) {
      return NextResponse.json(
        { error: addressesError.message },
        { status: 500 }
      );
    }

    // 5. Merge related data
    const ordersWithRelations = orders.map((order) => ({
      ...order,
      order_items: orderItems.filter((item) => item.order_id === order.id),
      additional_services: additionalServices.filter(
        (service) => service.order_id === order.id
      ),
      addresses: addresses.find((addr) => addr.id === order.address_id) || null,
    }));

    return NextResponse.json({ orders: ordersWithRelations });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
