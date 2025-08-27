"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browserClient";
import {
  Button,
  Input,
  Select,
  SelectItem,
  SelectContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import { ArrowLeft, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Order } from "@/type/order";
import Link from "next/link";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
];

function OrderEditSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "Orders", href: "/staff/orders" },
          { label: "Edit Order" },
        ]}
      />
      <div className="flex items-center justify-center p-8">
        <p>Loading order data...</p>
      </div>
    </div>
  );
}

export default function StaffOrderEditPage() {
  const params = useParams();
  const router = useRouter();
  const orderId =
    params && params.id
      ? typeof params.id === "string"
        ? params.id
        : Array.isArray(params.id)
        ? params.id[0]
        : ""
      : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchOrderDetails() {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            addresses (*),
            order_items (*),
            order_additional_services (*)
          `
          )
          .eq("id", orderId)
          .single();

        if (error || !data) {
          setOrder(null);
          setError("Order not found");
        } else {
          setOrder({
            ...data,
            additional_services: data.order_additional_services || [],
          });
          setStatus(data.status || "");
        }
      } catch {
        setOrder(null);
        setError("Failed to fetch order");
      }
      setLoading(false);
    }
    if (orderId) fetchOrderDetails();
  }, [orderId]);

  async function handleSave() {
    if (!orderId || !status) return;
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (updateError) {
      setError("Failed to update status");
    } else {
      setError("");
      router.refresh?.();
    }
    setSaving(false);
  }

  // Skeleton loading
  if (loading) return <OrderEditSkeleton />;

  // Not found state
  if (!order && !loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <BreadcrumbNav
          customItems={[
            { label: "Dashboard", href: "/staff/dashboard" },
            { label: "Orders", href: "/staff/orders" },
            { label: "Edit Order" },
          ]}
        />
        <div className="flex items-center justify-between">
          <TypographyH2 className="border-none pb-0">
            Order Not Found
          </TypographyH2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/staff/orders")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
            The order you are looking for does not exist or has been deleted.
          </TypographyP>
          <Link href="/staff/orders">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Main edit form
  return (
    <div className="flex flex-col gap-6 w-full">
      <BreadcrumbNav
        customItems={[
          { label: "Dashboard", href: "/staff/dashboard" },
          { label: "Orders", href: "/staff/orders" },
          { label: "Edit Order" },
        ]}
      />
      <div className="flex items-center justify-between">
        <TypographyH2>
          Edit Order #{order?.id ? order.id.slice(-8) : ""}
        </TypographyH2>
        <Link href="/staff/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <Input value={order?.addresses?.full_name || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={
                  order?.addresses
                    ? [
                        order.addresses.address_line1,
                        order.addresses.address_line2,
                        order.addresses.city,
                        order.addresses.state,
                        order.addresses.postal_code,
                        order.addresses.country,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : ""
                }
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Created At
              </label>
              <Input value={order?.created_at || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Status
              </label>
              <Input value={order?.payment_status || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Order Notes
              </label>
              <Input value={order?.notes || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Intent
              </label>
              <Input value={order?.payment_intent_id || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtotal</label>
              <Input value={formatCurrency(order?.subtotal ?? 0)} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shipping</label>
              <Input
                value={formatCurrency(order?.shipping_cost ?? 0)}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax</label>
              <Input value={formatCurrency(order?.tax ?? 0)} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total</label>
              <Input value={formatCurrency(order?.total ?? 0)} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <TypographyP className="text-red-600">{error}</TypographyP>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/staff/orders")}
            disabled={saving || loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
