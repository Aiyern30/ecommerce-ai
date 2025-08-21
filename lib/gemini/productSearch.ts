// lib/gemini/productSearch.ts
import { Product } from "@/type/product";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Price types for your concrete business
export type PriceType =
  | "normal"
  | "pump"
  | "tremie_1"
  | "tremie_2"
  | "tremie_3";

export interface ProductSearchOptions {
  limit?: number;
  productType?: "concrete" | "mortar";
  grade?: string;
  priceType?: PriceType;
  priceRange?: { min?: number; max?: number };
  inStock?: boolean;
  featured?: boolean;
  keywords?: string[];
}

export class ConcreteProductSearchManager {
  private supabase;

  constructor() {
    this.supabase = createRouteHandlerClient({ cookies });
  }

  async searchProducts(
    query: string,
    options: ProductSearchOptions = {}
  ): Promise<Product[]> {
    try {
      const {
        limit = 10,
        productType,
        grade,
        priceType = "normal",
        priceRange,
        inStock = true,
        featured,
      } = options;

      let queryBuilder = this.supabase
        .from("products")
        .select(
          `
          id, name, description, grade, product_type, product_images, mortar_ratio, category,
          normal_price, pump_price, tremie_1_price, tremie_2_price, tremie_3_price,
          unit, stock_quantity, status, is_featured, is_active, keywords,
          created_at, updated_at
        `
        )
        .eq("status", "published")
        .eq("is_active", true);

      // Add stock filter
      if (inStock) {
        queryBuilder = queryBuilder.gt("stock_quantity", 0);
      }

      // Add product type filter
      if (productType) {
        queryBuilder = queryBuilder.eq("product_type", productType);
      }

      // Add grade filter
      if (grade) {
        queryBuilder = queryBuilder.eq("grade", grade);
      }

      // Add featured filter
      if (featured !== undefined) {
        queryBuilder = queryBuilder.eq("is_featured", featured);
      }

      // Add price range filter based on price type
      const priceColumn = this.getPriceColumn(priceType);
      if (priceRange?.min !== undefined) {
        queryBuilder = queryBuilder.gte(priceColumn, priceRange.min);
      }
      if (priceRange?.max !== undefined) {
        queryBuilder = queryBuilder.lte(priceColumn, priceRange.max);
      }

      // Add text search
      if (query.trim()) {
        // Search in multiple fields
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,description.ilike.%${query}%,grade.ilike.%${query}%,keywords.cs.{${query}}`
        );
      }

      // Apply limit and execute
      const { data, error } = await queryBuilder
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Product search error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Product search error:", error);
      return [];
    }
  }

  async getProductsByType(
    productType: "concrete" | "mortar",
    limit = 10
  ): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(
          `
          id, name, description, grade, product_type, product_images, mortar_ratio, category,
          normal_price, pump_price, tremie_1_price, tremie_2_price, tremie_3_price,
          unit, stock_quantity, status, is_featured, is_active, keywords,
          created_at, updated_at
        `
        )
        .eq("product_type", productType)
        .eq("status", "published")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Product type search error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Product type search error:", error);
      return [];
    }
  }

  async getProductsByGrade(grade: string, limit = 10): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(
          `
          id, name, description, grade, product_type, product_images, mortar_ratio, category,
          normal_price, pump_price, tremie_1_price, tremie_2_price, tremie_3_price,
          unit, stock_quantity, status, is_featured, is_active, keywords,
          created_at, updated_at
        `
        )
        .eq("grade", grade)
        .eq("status", "published")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .order("is_featured", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Grade search error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Grade search error:", error);
      return [];
    }
  }

  async getFeaturedProducts(limit = 5): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select(
          `
          id, name, description, grade, product_type, product_images, mortar_ratio, category,
          normal_price, pump_price, tremie_1_price, tremie_2_price, tremie_3_price,
          unit, stock_quantity, status, is_featured, is_active, keywords,
          created_at, updated_at
        `
        )
        .eq("is_featured", true)
        .eq("status", "published")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Featured products error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Featured products error:", error);
      return [];
    }
  }

  async getRecommendations(
    options: {
      productType?: "concrete" | "mortar";
      excludeIds?: string[];
      limit?: number;
    } = {}
  ): Promise<Product[]> {
    try {
      const { productType, excludeIds = [], limit = 5 } = options;

      let queryBuilder = this.supabase
        .from("products")
        .select(
          `
          id, name, description, grade, product_type, mortar_ratio, category,
          normal_price, pump_price, tremie_1_price, tremie_2_price, tremie_3_price,
          unit, stock_quantity, status, is_featured, is_active, keywords,
          created_at, updated_at,
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
        .eq("is_active", true)
        .gt("stock_quantity", 0);

      if (productType) {
        queryBuilder = queryBuilder.eq("product_type", productType);
      }

      if (excludeIds.length > 0) {
        queryBuilder = queryBuilder.not(
          "id",
          "in",
          `(${excludeIds.join(",")})`
        );
      }

      const { data, error } = await queryBuilder
        .order("is_featured", { ascending: false })
        .order("stock_quantity", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Recommendations error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Recommendations error:", error);
      return [];
    }
  }

  async getAvailableGrades(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("grade")
        .eq("status", "published")
        .eq("is_active", true)
        .gt("stock_quantity", 0);

      if (error) {
        console.error("Grades error:", error);
        return [];
      }

      const grades = [...new Set((data || []).map((item) => item.grade))];
      return grades.sort();
    } catch (error) {
      console.error("Grades error:", error);
      return [];
    }
  }

  async getProductTypes(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("products")
        .select("product_type")
        .eq("status", "published")
        .eq("is_active", true)
        .gt("stock_quantity", 0);

      if (error) {
        console.error("Product types error:", error);
        return [];
      }

      const types = [...new Set((data || []).map((item) => item.product_type))];
      return types.sort();
    } catch (error) {
      console.error("Product types error:", error);
      return [];
    }
  }

  private getPriceColumn(priceType: PriceType): string {
    const priceColumns = {
      normal: "normal_price",
      pump: "pump_price",
      tremie_1: "tremie_1_price",
      tremie_2: "tremie_2_price",
      tremie_3: "tremie_3_price",
    };
    return priceColumns[priceType] || "normal_price";
  }

  // Helper method to get the best price for display
  getDisplayPrice(product: Product, priceType: PriceType = "normal"): number {
    const priceMap = {
      normal: product.normal_price,
      pump: product.pump_price,
      tremie_1: product.tremie_1_price,
      tremie_2: product.tremie_2_price,
      tremie_3: product.tremie_3_price,
    };

    return priceMap[priceType] || product.normal_price || 0;
  }

  // Helper method to get all available prices for a product
  getAllPrices(
    product: Product
  ): { type: string; price: number; label: string }[] {
    const prices = [];

    if (product.normal_price) {
      prices.push({
        type: "normal",
        price: product.normal_price,
        label: "Normal Delivery",
      });
    }
    if (product.pump_price) {
      prices.push({
        type: "pump",
        price: product.pump_price,
        label: "Pump Delivery",
      });
    }
    if (product.tremie_1_price) {
      prices.push({
        type: "tremie_1",
        price: product.tremie_1_price,
        label: "Tremie 1",
      });
    }
    if (product.tremie_2_price) {
      prices.push({
        type: "tremie_2",
        price: product.tremie_2_price,
        label: "Tremie 2",
      });
    }
    if (product.tremie_3_price) {
      prices.push({
        type: "tremie_3",
        price: product.tremie_3_price,
        label: "Tremie 3",
      });
    }

    return prices;
  }
}
