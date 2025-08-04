import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 1️⃣ Abandoned carts: carts where user has no orders
    const { data: cartsData, error: cartsError } = await supabase
      .from("carts")
      .select("id, user_id, created_at");

    if (cartsError) throw cartsError;

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, created_at");

    if (ordersError) throw ordersError;

    const abandonedCarts = cartsData.filter(
      (cart) => !ordersData.find((o) => o.user_id === cart.user_id)
    ).length;

    // 2️⃣ Average cart value
    const { data: cartItemsData, error: cartItemsError } = await supabase
      .from("cart_items")
      .select("cart_id, quantity, product_id");

    if (cartItemsError) throw cartItemsError;

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, price, name");

    if (productsError) throw productsError;

    const cartTotals = cartsData.map((cart) => {
      const items = cartItemsData.filter((ci) => ci.cart_id === cart.id);
      return items.reduce((sum, item) => {
        const product = productsData.find((p) => p.id === item.product_id);
        return sum + (product?.price || 0) * item.quantity;
      }, 0);
    });

    const averageCartValue =
      cartTotals.reduce((a, b) => a + b, 0) / (cartTotals.length || 1);

    // 3️⃣ Conversion rate
    const uniqueUsersWithOrders = new Set(ordersData.map((o) => o.user_id));
    const conversionRate =
      cartsData.length > 0
        ? (uniqueUsersWithOrders.size / cartsData.length) * 100
        : 0;

    // 4️⃣ Carts by hour
    const cartsByHourMap = new Map<
      string,
      { carts: number; abandoned: number }
    >();

    for (const cart of cartsData) {
      const hour = new Date(cart.created_at)
        .getHours()
        .toString()
        .padStart(2, "0");
      const hasOrder = ordersData.find((o) => o.user_id === cart.user_id);
      const entry = cartsByHourMap.get(hour) || { carts: 0, abandoned: 0 };
      entry.carts += 1;
      if (!hasOrder) entry.abandoned += 1;
      cartsByHourMap.set(hour, entry);
    }

    const cartsByHour = Array.from(cartsByHourMap.entries())
      .map(([hour, val]) => ({
        hour,
        carts: val.carts,
        abandoned: val.abandoned,
      }))
      .sort((a, b) => Number(a.hour) - Number(b.hour));

    // 5️⃣ Top abandoned products
    const abandonedUserIds = cartsData
      .filter((c) => !ordersData.find((o) => o.user_id === c.user_id))
      .map((c) => c.user_id);

    const abandonedCartIds = cartsData
      .filter((c) => abandonedUserIds.includes(c.user_id))
      .map((c) => c.id);

    const topAbandonedProductsMap = new Map<
      string,
      { name: string; abandonedCount: number; value: number }
    >();

    for (const item of cartItemsData) {
      if (!abandonedCartIds.includes(item.cart_id)) continue;
      const product = productsData.find((p) => p.id === item.product_id);
      if (!product) continue;
      const current = topAbandonedProductsMap.get(product.id) || {
        name: product.id,
        abandonedCount: 0,
        value: 0,
      };
      current.name = product.name || "Unknown";
      current.abandonedCount += item.quantity;
      current.value += Number(product.price || 0) * item.quantity;
      topAbandonedProductsMap.set(product.id, current);
    }

    const topAbandonedProducts = Array.from(topAbandonedProductsMap.values())
      .sort((a, b) => b.abandonedCount - a.abandonedCount)
      .slice(0, 3);

    // 6️⃣ Cart age distribution
    const now = new Date();
    const cartAgeDistributionMap = {
      "< 1 hour": 0,
      "1-24 hours": 0,
      "1-7 days": 0,
      "> 7 days": 0,
    };

    cartsData
      .filter((c) => !ordersData.find((o) => o.user_id === c.user_id))
      .forEach((cart) => {
        const ageMs = now.getTime() - new Date(cart.created_at).getTime();
        const ageHours = ageMs / (1000 * 60 * 60);
        if (ageHours < 1) cartAgeDistributionMap["< 1 hour"] += 1;
        else if (ageHours < 24) cartAgeDistributionMap["1-24 hours"] += 1;
        else if (ageHours < 24 * 7) cartAgeDistributionMap["1-7 days"] += 1;
        else cartAgeDistributionMap["> 7 days"] += 1;
      });

    const colors = {
      "< 1 hour": "#ef4444",
      "1-24 hours": "#f97316",
      "1-7 days": "#eab308",
      "> 7 days": "#6b7280",
    };

    const cartAgeDistribution = Object.entries(cartAgeDistributionMap).map(
      ([ageRange, count]) => ({
        ageRange,
        count,
        color: colors[ageRange as keyof typeof colors],
      })
    );

    // ✅ Return
    return NextResponse.json({
      abandonedCarts,
      averageCartValue,
      conversionRate,
      cartsByHour,
      topAbandonedProducts,
      cartAgeDistribution,
    });
  } catch (error) {
    console.error("Error fetching cart analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart analytics" },
      { status: 500 }
    );
  }
}
