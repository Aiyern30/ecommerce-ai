"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/";

const products = [
  { name: "Men Grey Hoodie", price: "$49.90", units: 204 },
  { name: "Women Striped T-Shirt", price: "$34.90", units: 155 },
  { name: "Women White T-Shirt", price: "$40.90", units: 120 },
  { name: "Men White T-Shirt", price: "$49.90", units: 204 },
  { name: "Women Red T-Shirt", price: "$34.90", units: 155 },
];

export function TopProducts() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold">Top Products by Units Sold</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Units Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                      <Image
                        src="/placeholder.svg"
                        alt={product.name}
                        width={40}
                        height={40}
                      />
                    </div>
                    <span>{product.name}</span>
                  </TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.units}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
