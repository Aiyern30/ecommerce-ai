"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { OrdersChart } from "@/components/Orders/OrdersChart";
import { OrdersTable } from "@/components/Orders/OrdersTable";
import { OrdersTableFilters } from "@/components/Orders/OrdersTableFilter";

export default function OrdersPage() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium">Orders Update</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <OrdersChart />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Latest Orders</h2>
        <Button variant="ghost" size="sm" className="text-xs">
          More
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipping">Shipping</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="revenue-high">Highest Revenue</SelectItem>
              <SelectItem value="revenue-low">Lowest Revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFilters && <OrdersTableFilters />}

        <OrdersTable />
      </div>
    </div>
  );
}
