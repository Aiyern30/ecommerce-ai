"use client";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Calendar as CalendarComponent,
} from "@/components/ui";
import { useOrdersFilter } from "./OrdersFilterContext";

export function OrdersTableFilters() {
  const { filters, updateFilter, resetFilters, applyFilters } =
    useOrdersFilter();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="order-id">Order ID</Label>
            <Input
              id="order-id"
              placeholder="Search by order ID"
              value={filters.orderId}
              onChange={(e) => updateFilter("orderId", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customer">Customer</Label>
            <Input
              id="customer"
              placeholder="Search by customer name"
              value={filters.customer}
              onChange={(e) => updateFilter("customer", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Shipping">Shipping</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Revenue Range</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Min"
                type="number"
                className="w-full"
                value={filters.minRevenue}
                onChange={(e) => updateFilter("minRevenue", e.target.value)}
              />
              <span>-</span>
              <Input
                placeholder="Max"
                type="number"
                className="w-full"
                value={filters.maxRevenue}
                onChange={(e) => updateFilter("maxRevenue", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.startDate
                    ? format(filters.startDate, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.endDate
                    ? format(filters.endDate, "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter("endDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="revenue-high">Highest Revenue</SelectItem>
                <SelectItem value="revenue-low">Lowest Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
          <Button className="w-full sm:w-auto" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
