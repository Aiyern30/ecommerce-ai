/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  convertToCSV,
  downloadCSV,
  formatDateForExport,
} from "@/lib/export-utils";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "../ui";

interface ExportDialogProps {
  currentPageData: any[];
  allFilteredData: any[];
  isFiltered: boolean;
}

export function ExportDialog({
  currentPageData,
  allFilteredData,
  isFiltered,
}: ExportDialogProps) {
  const [exportOption, setExportOption] = useState<"current" | "all">(
    "current"
  );
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const dataToExport =
      exportOption === "current" ? currentPageData : allFilteredData;

    // Define CSV headers
    const headers = [
      { key: "id", label: "Order ID" },
      { key: "date", label: "Date" },
      { key: "customer", label: "Customer" },
      { key: "itemCount", label: "Items" },
      { key: "revenue", label: "Revenue" },
      { key: "netProfit", label: "Net Profit" },
      { key: "status", label: "Status" },
    ];

    // Convert data to CSV
    const csv = convertToCSV(dataToExport, headers);

    // Generate filename with current date
    const date = new Date();
    const formattedDate = formatDateForExport(date);
    const filename = `orders_export_${formattedDate}.csv`;

    // Download CSV
    downloadCSV(csv, filename);

    // Close dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Orders</DialogTitle>
          <DialogDescription>
            Choose which orders you want to export to CSV.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={exportOption}
            onValueChange={(value) =>
              setExportOption(value as "current" | "all")
            }
            className="space-y-4"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="current" id="current" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="current" className="font-medium">
                  Current Page
                </Label>
                <p className="text-sm text-muted-foreground">
                  Export only the {currentPageData.length} orders shown on the
                  current page.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="all" id="all" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="all" className="font-medium">
                  All {isFiltered ? "Filtered" : ""} Orders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Export all {allFilteredData.length}{" "}
                  {isFiltered ? "filtered" : ""} orders.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export to CSV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
