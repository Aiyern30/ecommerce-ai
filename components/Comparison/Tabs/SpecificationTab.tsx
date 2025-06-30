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

interface SpecificationsTableProps {
  products: Product[];
}

export function SpecificationsTable({ products }: SpecificationsTableProps) {
  if (products.length === 0) return null;

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableHead className="text-left font-semibold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Specifications
                </TableHead>
                {products.map((product) => (
                  <TableHead
                    key={product.id}
                    className="text-center font-medium min-w-[200px] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <div className="truncate" title={product.name}>
                      {product.name}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Category
                </TableCell>
                {products.map((product) => (
                  <TableCell
                    key={product.id}
                    className="text-center text-gray-700 dark:text-gray-300"
                  >
                    <Badge
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600"
                    >
                      {product.category || "N/A"}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Price
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">
                      RM {product.price.toFixed(2)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Unit
                </TableCell>
                {products.map((product) => (
                  <TableCell
                    key={product.id}
                    className="text-center text-gray-700 dark:text-gray-300"
                  >
                    {product.unit || "N/A"}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Stock Quantity
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    <Badge
                      variant={
                        product.stock_quantity && product.stock_quantity > 0
                          ? "default"
                          : "destructive"
                      }
                      className={
                        product.stock_quantity && product.stock_quantity > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : ""
                      }
                    >
                      {product.stock_quantity ?? "Out of Stock"}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Tags
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                      {product.product_tags &&
                      product.product_tags.length > 0 ? (
                        product.product_tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tag.tags.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No tags
                        </span>
                      )}
                      {product.product_tags &&
                        product.product_tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.product_tags.length - 3}
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Certificates
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                      {product.product_certificates &&
                      product.product_certificates.length > 0 ? (
                        product.product_certificates
                          .slice(0, 2)
                          .map((cert, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            >
                              {cert.certificate}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No certificates
                        </span>
                      )}
                      {product.product_certificates &&
                        product.product_certificates.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.product_certificates.length - 2}
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell className="font-medium bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 sticky left-0 z-10">
                  Description
                </TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center max-w-xs">
                    <div className="max-w-[200px] mx-auto">
                      <p
                        className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"
                        title={product.description || ""}
                      >
                        {product.description || "No description available"}
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
  );
}
