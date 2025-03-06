"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/";
import { Button } from "@/components/ui";
import { ChevronRight } from "lucide-react";

interface BreadcrumbNavProps {
  currentPage: string;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
}

export function BreadcrumbNav({
  currentPage,
  showFilterButton = false,
  onFilterClick,
}: BreadcrumbNavProps) {
  const pathname = usePathname();
  const category = pathname.split("/").pop()?.replace(/-/g, " ");

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-2">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize">
              {category || currentPage}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Filter Button (Only for Mobile) */}
      {showFilterButton && (
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onFilterClick}
          >
            Filters
          </Button>
        </div>
      )}
    </div>
  );
}
