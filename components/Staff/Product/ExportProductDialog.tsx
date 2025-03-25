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
} from "@/components/ui";

interface ExportProductsDialogProps {
  currentPageData: any[];
  allFilteredData: any[];
  isFiltered: boolean;
  selectedProducts: number[];
}

export function ExportProductsDialog({
  currentPageData,
  allFilteredData,
  isFiltered,
  selectedProducts,
}: ExportProductsDialogProps) {
  const [exportOption, setExportOption] = useState<
    "current" | "all" | "selected"
  >("current");
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    let dataToExport;

    switch (exportOption) {
      case "current":
        dataToExport = currentPageData;
        break;
      case "all":
        dataToExport = allFilteredData;
        break;
      case "selected":
        dataToExport = allFilteredData.filter((product) =>
          selectedProducts.includes(product.id)
        );
        break;
      default:
        dataToExport = currentPageData;
    }

    // Define CSV headers
    const headers = [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Product Name" },
      { key: "category", label: "Category" },
      { key: "color", label: "Color" },
      { key: "price", label: "Price" },
      { key: "inventory", label: "Inventory" },
      { key: "rating", label: "Rating" },
    ];

    // Convert data to CSV
    const csv = convertToCSV(dataToExport, headers);

    // Generate filename with current date
    const date = new Date();
    const formattedDate = formatDateForExport(date);
    const filename = `products_export_${formattedDate}.csv`;

    // Download CSV
    downloadCSV(csv, filename);

    // Close dialog
    setOpen(false);
  };

  const hasSelectedProducts = selectedProducts.length > 0;

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
          <DialogTitle>Export Products</DialogTitle>
          <DialogDescription>
            Choose which products you want to export to CSV.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={exportOption}
            onValueChange={(value) =>
              setExportOption(value as "current" | "all" | "selected")
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
                  Export only the {currentPageData.length} products shown on the
                  current page.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="all" id="all" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="all" className="font-medium">
                  All {isFiltered ? "Filtered" : ""} Products
                </Label>
                <p className="text-sm text-muted-foreground">
                  Export all {allFilteredData.length}{" "}
                  {isFiltered ? "filtered" : ""} products.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem
                value="selected"
                id="selected"
                disabled={!hasSelectedProducts}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="selected"
                  className={
                    !hasSelectedProducts ? "text-gray-400" : "font-medium"
                  }
                >
                  Selected Products
                </Label>
                <p className="text-sm text-muted-foreground">
                  Export only the {selectedProducts.length} selected products.
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
