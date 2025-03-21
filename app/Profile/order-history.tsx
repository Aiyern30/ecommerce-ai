"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink, Search } from "lucide-react";

import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@/components/ui/";
import { Order } from "@/type/user";

interface OrderHistoryProps {
  orders: Order[];
}

export default function OrderHistory({ orders = [] }: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter orders based on search and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t placed any orders yet.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <h3 className="text-lg font-medium">Order History</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No orders match your search criteria.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer bg-muted/30"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Order #{order.id}</span>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "default"
                          : order.status === "processing"
                          ? "secondary"
                          : order.status === "shipped"
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <span className="font-medium">${order.total.toFixed(2)}</span>
                  {expandedOrderId === order.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="p-4">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={
                              item.image ||
                              "/placeholder.svg?height=80&width=80"
                            }
                            alt={item.name}
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between text-base font-medium">
                            <h3>
                              <Link
                                href={`/products/${item.id}`}
                                className="hover:underline"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <p className="ml-4">${item.price.toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Qty: {item.quantity}{" "}
                            {item.color && `• ${item.color}`}{" "}
                            {item.size && `• Size ${item.size}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.name}
                        <br />
                        {order.shippingAddress.street}
                        <br />
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zip}
                        <br />
                        {order.shippingAddress.country}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Subtotal:
                          </span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Shipping:
                          </span>
                          <span>${order.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax:</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>
                        View Order Details{" "}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        Buy Again
                      </Button>
                    )}
                    {(order.status === "processing" ||
                      order.status === "shipped") && (
                      <Button variant="outline" size="sm">
                        Track Package
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        Write a Review
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
