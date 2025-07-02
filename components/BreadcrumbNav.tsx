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

interface BreadcrumbNavProps {
  showFilterButton?: boolean;
  onFilterClick?: () => void;
}

export function BreadcrumbNav({
  showFilterButton = false,
  onFilterClick,
}: BreadcrumbNavProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground dark:text-gray-400">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="flex items-center gap-2">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="hover:text-gray-900 dark:hover:text-white"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            const isLast = index === pathSegments.length - 1;
            return (
              <React.Fragment key={`crumb-${index}`}>
                <BreadcrumbSeparator key={`sep-${index}`}>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem key={href}>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize dark:text-gray-300">
                      {decodeURIComponent(segment.replace(/-/g, " "))}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={href}
                        className="capitalize hover:text-gray-900 dark:hover:text-white"
                      >
                        {decodeURIComponent(segment.replace(/-/g, " "))}
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
