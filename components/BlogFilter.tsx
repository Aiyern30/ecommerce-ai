"use client";

import { useState, useCallback, useMemo } from "react";
import { Filter, X, Search } from "lucide-react";
import {
  Button,
  Checkbox,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Badge,
  ScrollArea,
} from "@/components/ui";
import { useDeviceType } from "@/utils/useDeviceTypes";

interface Tag {
  id: string;
  name: string;
  count?: number;
}

interface BlogFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onTagsChange: (selectedTags: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalBlogs: number;
  filteredBlogs: number;
  forceMobileUI?: boolean;
}

export function BlogFilter({
  tags,
  selectedTags,
  onTagsChange,
  searchQuery,
  onSearchChange,
  totalBlogs,
  filteredBlogs,
  forceMobileUI = false,
}: BlogFilterProps) {
  const { isMobile } = useDeviceType();
  const [isOpen, setIsOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  const filteredTags = useMemo(
    () =>
      tags.filter((tag) =>
        tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
      ),
    [tags, tagSearchQuery]
  );

  const handleTagToggle = useCallback(
    (tagId: string) => {
      const newSelectedTags = selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId];

      onTagsChange(newSelectedTags);
    },
    [selectedTags, onTagsChange]
  );

  const handleClearAll = useCallback(() => {
    onTagsChange([]);
    onSearchChange("");
    setTagSearchQuery("");
  }, [onTagsChange, onSearchChange]);

  const handleSelectAll = useCallback(() => {
    onTagsChange(tags.map((tag) => tag.id));
  }, [onTagsChange, tags]);

  const FilterContent = useMemo(
    () => (
      <div className="space-y-4 lg:space-y-6 px-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Blogs</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search blog titles and content..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Filter by Tags</label>
            <div className="flex gap-1 lg:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-6 lg:h-7 px-2 lg:px-3"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-6 lg:h-7 px-2 lg:px-3"
              >
                Clear All
              </Button>
            </div>
          </div>

          <Input
            placeholder="Search tags..."
            value={tagSearchQuery}
            onChange={(e) => setTagSearchQuery(e.target.value)}
            className="text-sm h-8 lg:h-9"
          />

          <ScrollArea className="h-48 h-[75%]">
            <div className="space-y-1 lg:space-y-2 pr-2">
              {filteredTags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No tags found
                </p>
              ) : (
                filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md lg:rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                      className="h-3.5 w-3.5 lg:h-4 lg:w-4"
                    />
                    <label
                      htmlFor={`tag-${tag.id}`}
                      className="flex-1 text-xs lg:text-sm cursor-pointer leading-tight"
                    >
                      {tag.name}
                    </label>
                    {tag.count !== undefined && (
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full min-w-[1.25rem] lg:min-w-[1.5rem] text-center">
                        {tag.count}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="p-2.5 lg:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs lg:text-sm text-blue-700 dark:text-blue-300">
            Showing <span className="font-medium">{filteredBlogs}</span> of{" "}
            <span className="font-medium">{totalBlogs}</span> blogs
          </p>
        </div>
      </div>
    ),
    [
      searchQuery,
      onSearchChange,
      handleSelectAll,
      handleClearAll,
      tagSearchQuery,
      filteredTags,
      selectedTags,
      handleTagToggle,
      filteredBlogs,
      totalBlogs,
    ]
  );

  const shouldUseMobileUI = isMobile || forceMobileUI;

  if (shouldUseMobileUI) {
    return (
      <>
        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filter Blogs
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Filter Blogs</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{FilterContent}</div>
          </SheetContent>
        </Sheet>

        {selectedTags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selected Tags:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTagsChange([])}
                className="text-xs h-6"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return tag ? (
                  <Badge
                    key={tagId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleTagToggle(tagId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 lg:p-6 sticky top-4 lg:top-6">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-base lg:text-lg font-semibold">Filter Blogs</h3>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length} selected
            </Badge>
          )}
        </div>
        {FilterContent}
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-3 lg:mt-4 bg-white dark:bg-gray-800 rounded-lg border p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <span className="text-xs lg:text-sm font-medium">
              Selected Tags:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTagsChange([])}
              className="text-xs h-5 lg:h-6 px-2"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 lg:gap-2">
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              return tag ? (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs py-0.5 px-2"
                >
                  {tag.name}
                  <X
                    className="h-2.5 w-2.5 lg:h-3 lg:w-3 cursor-pointer"
                    onClick={() => handleTagToggle(tagId)}
                  />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
