export interface ProductFilters {
  search: string;
  category: string;
  stockStatus: "all" | "in-stock" | "out-of-stock";
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
