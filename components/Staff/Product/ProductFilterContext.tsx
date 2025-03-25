"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ProductFilterState = {
  search: string;
  category: string;
  color: string;
  minPrice: string;
  maxPrice: string;
  stockStatus: string;
  minRating: string;
  sortBy: string;
};

const initialFilterState: ProductFilterState = {
  search: "",
  category: "all",
  color: "all",
  minPrice: "",
  maxPrice: "",
  stockStatus: "all",
  minRating: "",
  sortBy: "name-asc",
};

type ProductsFilterContextType = {
  filters: ProductFilterState;
  setFilters: (filters: ProductFilterState) => void;
  updateFilter: <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K]
  ) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  isFiltersApplied: boolean;
  selectedProducts: number[];
  setSelectedProducts: (ids: number[]) => void;
  toggleProductSelection: (id: number) => void;
  selectAllProducts: (ids: number[]) => void;
  clearProductSelection: () => void;
};

const ProductsFilterContext = createContext<
  ProductsFilterContextType | undefined
>(undefined);

export function ProductsFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] =
    useState<ProductFilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] =
    useState<ProductFilterState>(initialFilterState);
  console.log("appliedFilters", appliedFilters);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const updateFilter = <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
    setAppliedFilters(initialFilterState);
    setIsFiltersApplied(false);
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    setIsFiltersApplied(true);
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  const selectAllProducts = (ids: number[]) => {
    setSelectedProducts(ids);
  };

  const clearProductSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <ProductsFilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        applyFilters,
        isFiltersApplied,
        selectedProducts,
        setSelectedProducts,
        toggleProductSelection,
        selectAllProducts,
        clearProductSelection,
      }}
    >
      {children}
    </ProductsFilterContext.Provider>
  );
}

export function useProductsFilter() {
  const context = useContext(ProductsFilterContext);
  if (context === undefined) {
    throw new Error(
      "useProductsFilter must be used within a ProductsFilterProvider"
    );
  }
  return context;
}
