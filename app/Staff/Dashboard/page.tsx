"use client";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Home,
  Inbox,
  Layers,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/";
import { Input } from "@/components/ui/";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/";

export default function Dashboard() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr]">
      <div className="hidden border-r bg-[#1a2352] lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-gray-700 px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-white"
            >
              <ShoppingBag className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold">fastcart</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg bg-blue-800 px-3 py-2 text-white transition-all"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                Orders
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  16
                </Badge>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <Layers className="h-4 w-4" />
                Categories
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <Users className="h-4 w-4" />
                Customers
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <Star className="h-4 w-4" />
                Coupons
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
              >
                <Inbox className="h-4 w-4" />
                Inbox
              </Link>

              <div className="mt-6">
                <h3 className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Other Information
                </h3>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <CreditCard className="h-4 w-4" />
                  Knowledge Base
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Tag className="h-4 w-4" />
                  Product Updates
                </Link>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Settings
                </h3>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Users className="h-4 w-4" />
                  Personal Settings
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Global Settings
                </Link>
              </div>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card className="bg-blue-600 text-white border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Grow Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-100">
                  Explore our marketing solutions
                </p>
                <Button
                  size="sm"
                  className="mt-4 w-full bg-white text-blue-600 hover:bg-blue-50"
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-gray-50 px-6">
          <div className="w-full flex-1 flex items-center">
            <div className="relative w-full md:w-2/3 lg:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-white pl-8 shadow-none border-gray-200"
              />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Inbox className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600"></span>
              </Button>
              <Button
                variant="ghost"
                className="rounded-full flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                  R
                </div>
                <span>Randhir kumar</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Button
              variant="outline"
              className="flex items-center gap-1 text-blue-600 border-blue-200"
            >
              <Settings className="h-4 w-4" />
              Manage
            </Button>
          </div>

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
                      <p className="text-sm font-medium text-gray-500">
                        Orders
                      </p>
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
                      <p className="text-sm font-medium text-gray-500">
                        New Users
                      </p>
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

            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Orders Over Time</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">
                        Last 12 Hours
                      </span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-2">
                    <div>
                      <h4 className="text-2xl font-bold">645</h4>
                      <p className="text-sm text-gray-500">Orders on May 22</p>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold">472</h4>
                      <p className="text-sm text-gray-500">Orders on May 21</p>
                    </div>
                  </div>

                  <div className="relative h-[240px] w-full">
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                      <div className="flex flex-col items-center">
                        <div className="h-[40px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">4am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[20px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">5am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[60px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">6am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[40px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">7am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[100px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">8am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[80px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">9am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[120px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">10am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[160px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">11am</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[80px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">12pm</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[60px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">1pm</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[100px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">2pm</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[80px] w-1.5 bg-blue-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">3pm</span>
                      </div>
                    </div>

                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-md text-xs">
                      <p>34 Orders</p>
                      <p>May 22, 8:00AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Last 7 Days Sales</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div>
                      <h4 className="text-2xl font-bold">1,259</h4>
                      <p className="text-sm text-gray-500">Items Sold</p>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold">$12,546</h4>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>

                  <div className="relative h-[180px] w-full">
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                      <div className="flex flex-col items-center">
                        <div className="h-[80px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">12</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[120px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">13</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[60px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">14</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[100px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">15</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[80px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">16</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[140px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">17</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-[160px] w-6 bg-green-500 rounded-t-sm"></div>
                        <span className="mt-2 text-xs text-gray-500">18</span>
                      </div>
                    </div>

                    <div className="absolute top-1/4 right-1/4 bg-gray-800 text-white px-3 py-2 rounded-md text-xs">
                      <p>$2,525</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold">Recent Transactions</h3>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Jagarnath S.</TableCell>
                        <TableCell>24.05.2023</TableCell>
                        <TableCell>$124.97</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Anand G.</TableCell>
                        <TableCell>23.05.2023</TableCell>
                        <TableCell>$55.42</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-800 hover:bg-blue-50"
                          >
                            Pending
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Kartik S.</TableCell>
                        <TableCell>23.05.2023</TableCell>
                        <TableCell>$89.90</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Rakesh S.</TableCell>
                        <TableCell>22.05.2023</TableCell>
                        <TableCell>$144.94</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-800 hover:bg-blue-50"
                          >
                            Pending
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Anup S.</TableCell>
                        <TableCell>22.05.2023</TableCell>
                        <TableCell>$70.52</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold">
                    Top Products by Units Sold
                  </h3>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Units Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            <Image
                              src="/placeholder.svg"
                              alt="Men Grey Hoodie"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span>Men Grey Hoodie</span>
                        </TableCell>
                        <TableCell>$49.90</TableCell>
                        <TableCell>204</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            <Image
                              src="/placeholder.svg"
                              alt="Women Striped T-Shirt"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span>Women Striped T-Shirt</span>
                        </TableCell>
                        <TableCell>$34.90</TableCell>
                        <TableCell>155</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            <Image
                              src="/placeholder.svg"
                              alt="Women White T-Shirt"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span>Women White T-Shirt</span>
                        </TableCell>
                        <TableCell>$40.90</TableCell>
                        <TableCell>120</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            <Image
                              src="/placeholder.svg"
                              alt="Men White T-Shirt"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span>Men White T-Shirt</span>
                        </TableCell>
                        <TableCell>$49.90</TableCell>
                        <TableCell>204</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            <Image
                              src="/placeholder.svg"
                              alt="Women Red T-Shirt"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span>Women Red T-Shirt</span>
                        </TableCell>
                        <TableCell>$34.90</TableCell>
                        <TableCell>155</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
