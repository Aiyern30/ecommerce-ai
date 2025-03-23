"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Card,
  CardContent,
} from "@/components/ui/";

const transactions = [
  {
    name: "Jagarnath S.",
    date: "24.05.2023",
    amount: "$124.97",
    status: "Paid",
  },
  { name: "Anand G.", date: "23.05.2023", amount: "$55.42", status: "Pending" },
  { name: "Kartik S.", date: "23.05.2023", amount: "$89.90", status: "Paid" },
  {
    name: "Rakesh S.",
    date: "22.05.2023",
    amount: "$144.94",
    status: "Pending",
  },
  { name: "Anup S.", date: "22.05.2023", amount: "$70.52", status: "Paid" },
  {
    name: "Jagarnath S.",
    date: "24.05.2023",
    amount: "$124.97",
    status: "Paid",
  },
  { name: "Anand G.", date: "23.05.2023", amount: "$55.42", status: "Pending" },
  { name: "Kartik S.", date: "23.05.2023", amount: "$89.90", status: "Paid" },
  {
    name: "Rakesh S.",
    date: "22.05.2023",
    amount: "$144.94",
    status: "Pending",
  },
  { name: "Anup S.", date: "22.05.2023", amount: "$70.52", status: "Paid" },
].slice(0, 10); // Ensure max 10 rows

export function RecentTransactions() {
  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index} className="h-[60px]">
                  {" "}
                  {/* Fixed row height */}
                  <TableCell className="truncate max-w-[150px] items-center">
                    {transaction.name}
                  </TableCell>
                  <TableCell className="items-center">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="items-center">
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="items-center">
                    <Badge
                      className={
                        transaction.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-50 text-blue-800"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
