"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
} from "@/components/ui/";
import type { Product } from "@/type/product";
import Image from "next/image";

interface SpecificationsTableProps {
  products: Product[];
}

export function SpecificationsTable({ products }: SpecificationsTableProps) {
  if (products.length === 0) return null;

  return (
    <Card className="py-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-gray-50 dark:bg-gray-800">
                <TableHead className="text-left font-semibold text-gray-900 dark:text-gray-100 sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-[180px] p-4 rounded-tl-xl">
                  Specifications
                </TableHead>
                {products.map((product, index) => (
                  <TableHead
                    key={product.id}
                    className={`text-center font-semibold w-[200px] text-gray-900 dark:text-gray-100 p-4 bg-gray-50 dark:bg-gray-800 ${
                      index === products.length - 1 ? "rounded-tr-xl" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Image - Left */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600">
                        <Image
                          src={
                            product.product_images?.[0]?.image_url ||
                            product.image_url ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      {/* Product Info - Right */}
                      <div className="flex-1 text-left min-w-0">
                        <div
                          className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100"
                          title={product.name}
                        >
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {product.category || "No category"}
                        </div>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Price Row */}
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                  Price
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center p-4">
                    <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      RM {product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {product.unit}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              {/* Category Row */}
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                  Category
                </TableCell>
                {products.map((product) => (
                  <TableCell
                    key={product.id}
                    className="text-center text-gray-700 dark:text-gray-300 p-4"
                  >
                    {product.category || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              {/* Unit Row */}
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                  Unit
                </TableCell>
                {products.map((product) => (
                  <TableCell
                    key={product.id}
                    className="text-center text-gray-700 dark:text-gray-300 p-4"
                  >
                    {product.unit || "N/A"}
                  </TableCell>
                ))}
              </TableRow>
              {/* Grade Row */}
              {products.some((p) => p.grade) && (
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                    Grade
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center text-gray-700 dark:text-gray-300 p-4"
                    >
                      {product.grade || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              )}
              {/* Stock Quantity Row */}
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                  Stock Quantity
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center p-4">
                    {product.stock_quantity && product.stock_quantity > 0 ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {product.stock_quantity} units
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.stock_quantity > 50
                            ? "High Stock"
                            : product.stock_quantity > 10
                            ? "Medium Stock"
                            : "Low Stock"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              {/* Tags Row */}
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                  Tags
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center p-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {product.product_tags && product.product_tags.length > 0
                        ? product.product_tags
                            .slice(0, 3)
                            .map((tag) => tag.tags.name)
                            .join(", ")
                        : "No tags"}
                      {product.product_tags &&
                        product.product_tags.length > 3 &&
                        ` (+${product.product_tags.length - 3} more)`}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              {/* Certificates Row */}
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4">
                  Certificates
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center p-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {product.product_certificates &&
                      product.product_certificates.length > 0
                        ? product.product_certificates
                            .slice(0, 2)
                            .map((cert) => cert.certificate)
                            .join(", ")
                        : "No certificates"}
                      {product.product_certificates &&
                        product.product_certificates.length > 2 &&
                        ` (+${product.product_certificates.length - 2} more)`}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              {/* Description Row - Last row with bottom rounded corners */}
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 p-4 rounded-bl-xl">
                  Description
                </TableCell>
                {products.map((product, index) => (
                  <TableCell
                    key={product.id}
                    className={`text-center p-4 ${
                      index === products.length - 1 ? "rounded-br-xl" : ""
                    }`}
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[180px] mx-auto">
                      {product.description || "No description available"}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
