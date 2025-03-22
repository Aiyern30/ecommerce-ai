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

// Sample data for the transactions
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
];

export function RecentTransactions() {
  return (
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
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.name}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    {transaction.status === "Paid" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Paid
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-800 hover:bg-blue-50"
                      >
                        Pending
                      </Badge>
                    )}
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
