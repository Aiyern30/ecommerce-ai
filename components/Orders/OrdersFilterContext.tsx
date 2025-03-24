"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type FilterState = {
  orderId: string;
  customer: string;
  status: string;
  minRevenue: string;
  maxRevenue: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  sortBy: string;
};

const initialFilterState: FilterState = {
  orderId: "",
  customer: "",
  status: "all",
  minRevenue: "",
  maxRevenue: "",
  startDate: undefined,
  endDate: undefined,
  sortBy: "newest",
};

type OrdersFilterContextType = {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  isFiltersApplied: boolean;
};

const OrdersFilterContext = createContext<OrdersFilterContextType | undefined>(
  undefined
);

export function OrdersFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilterState);
  console.log("appliedFilters", appliedFilters);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
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

  return (
    <OrdersFilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        applyFilters,
        isFiltersApplied,
      }}
    >
      {children}
    </OrdersFilterContext.Provider>
  );
}

export function useOrdersFilter() {
  const context = useContext(OrdersFilterContext);
  if (context === undefined) {
    throw new Error(
      "useOrdersFilter must be used within an OrdersFilterProvider"
    );
  }
  return context;
}
