import { supabase } from "@/lib/supabase/browserClient";
import { Product } from "@/type/product";
import { Order, OrderItem } from "@/type/order";

export interface HistoryRecommendation {
  product: Product;
  reason: string;
  confidence: number;
  type:
    | "frequently_bought"
    | "upgrade"
    | "similar_customers"
    | "category_popular";
}

export interface RecommendationStrategy {
  getRecommendations(
    userOrders: Order[],
    allProducts: Product[]
  ): Promise<HistoryRecommendation[]>;
}

// Strategy 1: Products frequently bought by user
class FrequentlyBoughtStrategy implements RecommendationStrategy {
  async getRecommendations(
    userOrders: Order[]
  ): Promise<HistoryRecommendation[]> {
    // Count product purchases by product_id
    const productCounts = new Map<string, { count: number; item: OrderItem }>();

    userOrders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const productId = item.product_id;
        if (productId) {
          const current = productCounts.get(productId) || { count: 0, item };
          productCounts.set(productId, {
            count: current.count + item.quantity,
            item,
          });
        }
      });
    });

    // Get frequently bought products that might need reordering
    const frequentProducts = Array.from(productCounts.entries())
      .filter(([, data]) => data.count >= 2)
      .slice(0, 3);

    // Fetch current products to check availability
    const productIds = frequentProducts.map(([productId]) => productId);

    if (productIds.length === 0) return [];

    const { data: currentProducts } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .in("id", productIds)
      .eq("status", "published");

    return (currentProducts || []).map((product) => ({
      product,
      reason: `You've ordered this ${
        productCounts.get(product.id)?.count || 0
      } times before`,
      confidence: 0.9,
      type: "frequently_bought" as const,
    }));
  }
}

// Strategy 2: Upgrade recommendations based on purchase history
class UpgradeStrategy implements RecommendationStrategy {
  async getRecommendations(
    userOrders: Order[],
    allProducts: Product[]
  ): Promise<HistoryRecommendation[]> {
    // Get most recent concrete/mortar purchases
    const recentItems = userOrders
      .flatMap((order) => order.order_items || [])
      .filter((item) => item.grade)
      .slice(0, 5);

    if (recentItems.length === 0) return [];

    const recommendations: HistoryRecommendation[] = [];

    for (const item of recentItems) {
      // Find upgrade options
      const currentGrade = this.extractGradeNumber(item.grade);
      if (!currentGrade) continue;

      const upgrades = allProducts
        .filter((product) => {
          const productGrade = this.extractGradeNumber(product.grade);
          return (
            productGrade &&
            productGrade > currentGrade &&
            productGrade <= currentGrade + 10 &&
            product.product_type ===
              (item.grade?.startsWith("N") || item.grade?.startsWith("S")
                ? "concrete"
                : "mortar")
          );
        })
        .slice(0, 2);

      upgrades.forEach((upgrade) => {
        recommendations.push({
          product: upgrade,
          reason: `Upgrade from ${item.grade} for higher strength applications`,
          confidence: 0.8,
          type: "upgrade",
        });
      });
    }

    return recommendations.slice(0, 3);
  }

  private extractGradeNumber(grade?: string | null): number | null {
    if (!grade) return null;
    const match = grade.match(/[NS](\d+)/i) || grade.match(/M0(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
}

// Strategy 3: Popular products in same categories
class CategoryPopularStrategy implements RecommendationStrategy {
  async getRecommendations(
    userOrders: Order[]
  ): Promise<HistoryRecommendation[]> {
    // Get user's preferred product types
    const userProductTypes = new Set(
      userOrders
        .flatMap((order) => order.order_items || [])
        .map((item) => this.getProductType(item.grade))
        .filter(Boolean)
    );

    if (userProductTypes.size === 0) return [];

    // Fetch popular products in these categories
    const { data: popularProducts } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .eq("status", "published")
      .in("product_type", Array.from(userProductTypes))
      .order("created_at", { ascending: false })
      .limit(5);

    return (popularProducts || []).slice(0, 3).map((product) => ({
      product,
      reason: `Popular choice in ${product.product_type} category`,
      confidence: 0.6,
      type: "category_popular" as const,
    }));
  }

  private getProductType(grade?: string | null): string | null {
    if (!grade) return null;
    if (grade.match(/^[NS]\d+/i)) return "concrete";
    if (grade.match(/^M0/i)) return "mortar";
    return null;
  }
}

// Strategy 4: Similar customers recommendations
class SimilarCustomersStrategy implements RecommendationStrategy {
  async getRecommendations(
    userOrders: Order[]
  ): Promise<HistoryRecommendation[]> {
    const userProductIds = new Set(
      userOrders.flatMap((order) =>
        (order.order_items || []).map((item) => item.product_id).filter(Boolean)
      )
    );

    if (userProductIds.size === 0) return [];

    // Find customers who bought similar products
    const { data: similarOrders } = await supabase
      .from("order_items")
      .select("*, orders!inner(user_id)")
      .in("product_id", Array.from(userProductIds))
      .neq("orders.user_id", userOrders[0]?.user_id)
      .limit(100);

    if (!similarOrders) return [];

    // Count products bought by similar customers
    const productCounts = new Map<string, number>();
    similarOrders.forEach((item) => {
      if (item.product_id && !userProductIds.has(item.product_id)) {
        const count = productCounts.get(item.product_id) || 0;
        productCounts.set(item.product_id, count + 1);
      }
    });

    // Get top products
    const topProductIds = Array.from(productCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    if (topProductIds.length === 0) return [];

    const { data: products } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .in("id", topProductIds)
      .eq("status", "published");

    return (products || []).map((product) => ({
      product,
      reason: "Customers with similar purchases also bought this",
      confidence: 0.7,
      type: "similar_customers" as const,
    }));
  }
}

// Main recommendation engine
export class HistoryBasedRecommendationEngine {
  private strategies: RecommendationStrategy[] = [
    new FrequentlyBoughtStrategy(),
    new UpgradeStrategy(),
    new CategoryPopularStrategy(),
    new SimilarCustomersStrategy(),
  ];

  async getRecommendations(
    userOrders: Order[]
  ): Promise<HistoryRecommendation[]> {
    if (!userOrders.length) return [];

    // Fetch all products for strategies that need them
    const { data: allProducts } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `
      )
      .eq("status", "published");

    if (!allProducts) return [];

    // Run all strategies
    const allRecommendations: HistoryRecommendation[] = [];

    for (const strategy of this.strategies) {
      try {
        const recommendations = await strategy.getRecommendations(
          userOrders,
          allProducts
        );
        allRecommendations.push(...recommendations);
      } catch (error) {
        console.error("Strategy failed:", error);
      }
    }

    // Remove duplicates and sort by confidence
    const uniqueRecommendations = allRecommendations
      .filter(
        (rec, index, self) =>
          index === self.findIndex((r) => r.product.id === rec.product.id)
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);

    return uniqueRecommendations;
  }
}

export const historyBasedRecommendationEngine =
  new HistoryBasedRecommendationEngine();
