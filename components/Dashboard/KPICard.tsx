"use client";

import { Card, CardContent } from "@/components/ui/";
import { ShoppingBag, ChevronUp, ChevronDown } from "lucide-react";

export function KpiCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold">$10.54</h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                $
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">22.45%</span>
              <ChevronUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <h3 className="text-2xl font-bold">1,056</h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">15.34%</span>
              <ChevronUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Unique Visits
                </p>
                <h3 className="text-2xl font-bold">5,420</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center">
                <div className="h-10 w-6 bg-yellow-300 rounded-sm mx-0.5"></div>
                <div className="h-6 w-6 bg-yellow-200 rounded-sm mx-0.5"></div>
                <div className="h-8 w-6 bg-yellow-100 rounded-sm mx-0.5"></div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-red-600 font-medium">10.24%</span>
              <ChevronDown className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Users</p>
                <h3 className="text-2xl font-bold">1,650</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center">
                <div className="h-6 w-6 bg-green-100 rounded-sm mx-0.5"></div>
                <div className="h-10 w-6 bg-green-500 rounded-sm mx-0.5"></div>
                <div className="h-8 w-6 bg-green-200 rounded-sm mx-0.5"></div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">15.34%</span>
              <ChevronUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
