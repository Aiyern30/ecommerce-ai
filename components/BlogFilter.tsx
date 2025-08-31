"use client";

import { useState } from "react";
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
}

export function BlogFilter({
  tags,
  selectedTags,
  onTagsChange,
  searchQuery,
  onSearchChange,
  totalBlogs,
  filteredBlogs,
}: BlogFilterProps) {
  const { isMobile } = useDeviceType();
  const [isOpen, setIsOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");

  // Filter tags based on search query
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    onTagsChange(newSelectedTags);
  };

  const handleClearAll = () => {
    onTagsChange([]);
    onSearchChange("");
    setTagSearchQuery("");
  };

  const handleSelectAll = () => {
    onTagsChange(tags.map((tag) => tag.id));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Blogs</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search blog titles and content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Filter by Tags</label>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-7"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs h-7"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Tag Search */}
        <Input
          placeholder="Search tags..."
          value={tagSearchQuery}
          onChange={(e) => setTagSearchQuery(e.target.value)}
          className="text-sm"
        />

        {/* Tags List */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredTags.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No tags found
              </p>
            ) : (
              filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag.id)}
                  />
                  <label
                    htmlFor={`tag-${tag.id}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {tag.name}
                  </label>
                  {tag.count !== undefined && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {tag.count}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Results Summary */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Showing <span className="font-medium">{filteredBlogs}</span> of{" "}
          <span className="font-medium">{totalBlogs}</span> blogs
        </p>
      </div>
    </div>
  );

  if (isMobile) {
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
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Selected Tags Display */}
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

  // Desktop Layout
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 sticky top-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filter Blogs</h3>
          {selectedTags.length > 0 && (
            <Badge variant="secondary">{selectedTags.length} selected</Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Selected Tags Display for Desktop */}
      {selectedTags.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
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
    </div>
  );
}
