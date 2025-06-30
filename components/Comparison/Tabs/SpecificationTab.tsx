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
  Badge,
} from "@/components/ui/";
import type { Product } from "@/type/product";
import Image from "next/image";

interface SpecificationsTableProps {
  products: Product[];
}

export function SpecificationsTable({ products }: SpecificationsTableProps) {
  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Specifications Table with integrated product images */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                  <TableHead className="text-left font-bold text-gray-900 dark:text-gray-100 sticky left-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-4">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      Specifications
                    </div>
                  </TableHead>
                  {products.map((product, index) => (
                    <TableHead
                      key={product.id}
                      className="text-center font-bold w-[200px] text-gray-900 dark:text-gray-100 relative"
                    >
                      <div className="py-4 flex flex-col items-center space-y-3">
                        {/* Product Image */}
                        <Image
                          src={
                            product.product_images?.[0]?.image_url ||
                            product.image_url ||
                            "/placeholder.svg"
                          }
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-contain bg-white dark:bg-gray-700 p-2 border border-gray-200 dark:border-gray-600"
                        />
                        {/* Product Info */}
                        <div className="text-center">
                          <div
                            className="font-bold text-sm truncate max-w-[160px]"
                            title={product.name}
                          >
                            {product.name}
                          </div>
                          <div className="text-xs font-normal text-gray-500 dark:text-gray-400 mt-1">
                            {product.category}
                          </div>
                        </div>
                      </div>
                      {index < products.length - 1 && (
                        <div className="absolute right-0 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700"></div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Category Row */}
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Category
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center py-4 w-[200px]"
                    >
                      <Badge
                        variant="outline"
                        className="border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                      >
                        {product.category || "N/A"}
                      </Badge>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Price Row */}
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Price
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center py-4 w-[200px]"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xl text-green-600 dark:text-green-400">
                          RM {product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.unit}
                        </div>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Unit Row */}
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Unit
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center text-gray-700 dark:text-gray-300 py-4 w-[200px]"
                    >
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      >
                        {product.unit || "N/A"}
                      </Badge>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Stock Quantity Row */}
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Stock Quantity
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center py-4 w-[200px]"
                    >
                      {product.stock_quantity && product.stock_quantity > 0 ? (
                        <div className="space-y-1">
                          <Badge
                            variant="default"
                            className={`${
                              product.stock_quantity > 50
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700"
                                : product.stock_quantity > 10
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700"
                            }`}
                          >
                            {product.stock_quantity} units
                          </Badge>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.stock_quantity > 50
                              ? "High Stock"
                              : product.stock_quantity > 10
                              ? "Medium Stock"
                              : "Low Stock"}
                          </div>
                        </div>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        >
                          Out of Stock
                        </Badge>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Tags Row */}
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Tags
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center py-4 w-[200px]"
                    >
                      <div className="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto">
                        {product.product_tags &&
                        product.product_tags.length > 0 ? (
                          <>
                            {product.product_tags
                              .slice(0, 3)
                              .map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                >
                                  {tag.tags.name}
                                </Badge>
                              ))}
                            {product.product_tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-indigo-300 dark:border-indigo-600"
                              >
                                +{product.product_tags.length - 3}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm italic">
                            No tags
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Certificates Row */}
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Certificates
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center py-4 w-[200px]"
                    >
                      <div className="flex flex-wrap gap-1 justify-center max-w-[180px] mx-auto">
                        {product.product_certificates &&
                        product.product_certificates.length > 0 ? (
                          <>
                            {product.product_certificates
                              .slice(0, 2)
                              .map((cert, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border-pink-200 dark:border-pink-800"
                                >
                                  {cert.certificate}
                                </Badge>
                              ))}
                            {product.product_certificates.length > 2 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-pink-300 dark:border-pink-600"
                              >
                                +{product.product_certificates.length - 2}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm italic">
                            No certificates
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Description Row */}
                <TableRow className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <TableCell className="font-semibold bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700 w-[200px]">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      Description
                    </div>
                  </TableCell>
                  {products.map((product) => (
                    <TableCell
                      key={product.id}
                      className="text-center py-4 w-[200px]"
                    >
                      <div className="max-w-[180px] mx-auto">
                        <p
                          className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed"
                          title={product.description || ""}
                        >
                          {product.description || (
                            <span className="italic text-gray-500 dark:text-gray-400">
                              No description available
                            </span>
                          )}
                        </p>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
