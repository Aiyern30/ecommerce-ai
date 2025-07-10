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
import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  customItems?: BreadcrumbItem[];
}

export function BreadcrumbNav({
  showFilterButton = false,
  onFilterClick,
  customItems,
}: BreadcrumbNavProps) {
  const pathname = usePathname();
  
  // If custom items are provided, use them; otherwise, use dynamic path generation
  const breadcrumbItems = customItems || (() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    return [
      { label: "Home", href: "/" },
      ...pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");
        const isLast = index === pathSegments.length - 1;
        return {
          label: decodeURIComponent(segment.replace(/-/g, " ")),
          href: isLast ? undefined : href,
        };
      }),
    ];
  })();

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-gray-400">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-2">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;
            
            return (
              <React.Fragment key={`crumb-${index}`}>
                {!isFirst && (
                  <BreadcrumbSeparator key={`sep-${index}`}>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem key={`item-${index}`}>
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="capitalize dark:text-gray-300">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="capitalize hover:text-gray-900 dark:hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Filter Button (Only for Mobile) */}
      {showFilterButton && (
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={onFilterClick}
          >
            Filters
          </Button>
        </div>
      )}
    </div>
  );
}
