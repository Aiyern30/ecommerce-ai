"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/Dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/Products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>New Product</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <div className="flex items-center gap-2">
            <Link href="/staff/Products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-12 border rounded-md bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">New Product Form</h2>
          <p className="text-gray-500 mb-4">
            This is a placeholder for the new product form.
          </p>
          <p className="text-sm text-gray-400">
            You can implement a full product creation form similar to the New
            Order page.
          </p>
        </div>
      </div>
    </div>
  );
}
