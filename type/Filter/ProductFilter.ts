export interface ProductFilters {
  search: string;
  productType: string;
  stockStatus: "all" | "in-stock" | "out-of-stock";
  status: "all" | "draft" | "published";
  sortBy:
    | "name-asc"
    | "name-desc"
    | "price-low"
    | "price-high"
    | "stock-low"
    | "stock-high";
  minPrice: string;
  maxPrice: string;
}
