"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  LinkIcon,
  FileText,
  Columns,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  Badge,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/";
import { TypographyH2, TypographyP } from "@/components/ui/Typography";
import Image from "next/image";
import { PostFilters } from "@/type/Filter/PostFilters";
import { Post } from "@/type/posts";
import { formatDate, truncateText } from "@/lib/utils/format";
import { useDeviceType } from "@/utils/useDeviceTypes";

function EmptyPostsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No posts found</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        Get started by creating your first post to share updates and engage with
        your community.
      </TypographyP>
      <Link href="/staff/posts/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Your First Post
        </Button>
      </Link>
    </div>
  );
}

function NoPostResultsState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH2 className="mb-2">No matching posts</TypographyH2>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No posts match your current search criteria. Try adjusting your filters
        or search terms.
      </TypographyP>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Link href="/staff/posts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Post
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Enhanced Post Table Skeleton with better structure
function PostTableSkeletonEnhanced() {
  return (
    <div className="w-full border rounded-md bg-white dark:bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[50px] text-center">
                <Skeleton className="h-4 w-4 rounded-sm mx-auto" />
              </TableHead>
              <TableHead className="min-w-[100px] text-center">Image</TableHead>
              <TableHead className="min-w-[400px]">Title</TableHead>
              <TableHead className="min-w-[500px]">Description</TableHead>
              <TableHead className="min-w-[400px]">Mobile Desc</TableHead>
              <TableHead className="min-w-[100px] text-center">
                Status
              </TableHead>
              <TableHead className="min-w-[100px] text-center">Link</TableHead>
              <TableHead className="min-w-[200px]">Created</TableHead>
              <TableHead className="text-center min-w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i} className="max-h-20 h-20">
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-4 rounded-sm mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-12 w-12 rounded-md mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full max-w-[350px] rounded" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1 max-h-16 overflow-hidden">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 max-h-16 overflow-hidden">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-20 rounded-full mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PostFilters>({
    search: "",
    sortBy: "date-new",
    hasImage: "all",
    hasLink: "all",
    status: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState<Post[]>([]);
  const { isMobile } = useDeviceType();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize column visibility from localStorage or defaults
  const [visibleColumns, setVisibleColumns] = useState<ColumnConfig[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("postTableColumns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error("Error parsing saved column config:", error);
        }
      }
    }

    // Default configuration if no saved state - ALL COLUMNS VISIBLE
    return [
      { key: "select", label: "Select", visible: true, required: true },
      { key: "image", label: "Image", visible: true },
      { key: "title", label: "Title", visible: true, required: true },
      { key: "description", label: "Description", visible: true },
      { key: "mobile_desc", label: "Mobile Desc", visible: true },
      { key: "status", label: "Status", visible: true },
      { key: "link", label: "Link", visible: true },
      { key: "created", label: "Created", visible: true },
      { key: "actions", label: "Actions", visible: true, required: true },
    ];
  });

  // Save to localStorage whenever visibleColumns changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("postTableColumns", JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  const itemsPerPage = 10;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error.message);
      toast.error("Failed to fetch posts");
      setPosts([]);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const updateFilter = (key: keyof PostFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      sortBy: "date-new",
      hasImage: "all",
      hasLink: "all",
      status: "all",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleSelectAllPosts = () => {
    if (
      selectedPosts.length === currentPageData.length &&
      currentPageData.length > 0
    ) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPageData.map((post) => post.id));
    }
  };

  const clearPostSelection = () => {
    setSelectedPosts([]);
  };

  const openDeleteDialog = () => {
    const postsToConfirm = posts.filter((p) => selectedPosts.includes(p.id));
    setPostsToDelete(postsToConfirm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePosts = async () => {
    if (selectedPosts.length === 0) return;

    setLoading(true);
    try {
      const deletePromises = selectedPosts.map(async (postId) => {
        const response = await fetch("/api/posts/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: postId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to delete post ${postId}`);
        }

        return response.json();
      });

      await Promise.all(deletePromises);

      toast.success(`Successfully deleted ${selectedPosts.length} post(s)!`);
      clearPostSelection();
      fetchPosts();
    } catch (error) {
      console.error("Error deleting posts:", error);
      toast.error(
        error instanceof Error
          ? `Error deleting posts: ${error.message}`
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    // Filter by search term
    if (
      filters.search &&
      !post.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !post.description?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by image
    if (filters.hasImage === "with-image" && !post.image_url) {
      return false;
    }
    if (filters.hasImage === "without-image" && post.image_url) {
      return false;
    }

    // Filter by link
    if (filters.hasLink === "with-link" && !post.link) {
      return false;
    }
    if (filters.hasLink === "without-link" && post.link) {
      return false;
    }

    // Filter by status
    if (filters.status !== "all") {
      const postStatus = post.status || "draft"; // Default to draft if no status
      if (filters.status !== postStatus) {
        return false;
      }
    }

    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (filters.sortBy) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "date-new":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "date-old":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedPosts.length / itemsPerPage);
  const currentPageData = sortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isExternalLink = (link: string) => {
    return link.startsWith("http://") || link.startsWith("https://");
  };

  const renderLinkDisplay = (link: string | null, linkName: string | null) => {
    if (!link) {
      return <span className="text-gray-400 text-sm">No link</span>;
    }

    const external = isExternalLink(link);

    // Show link_name if available, otherwise show a generic label
    const displayText =
      linkName || (external ? "External Link" : "Internal Link");

    return (
      <div className="flex items-center gap-2">
        {external ? (
          <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0" />
        ) : (
          <LinkIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
        )}
        <span
          className="text-sm font-medium truncate max-w-[120px]"
          title={displayText}
        >
          {displayText}
        </span>
      </div>
    );
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const newColumns = prev.map((col) =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      );
      return newColumns;
    });
  };

  const resetColumns = () => {
    const defaultColumns = [
      { key: "select", label: "Select", visible: true, required: true },
      { key: "image", label: "Image", visible: true },
      { key: "title", label: "Title", visible: true, required: true },
      { key: "description", label: "Description", visible: true },
      { key: "mobile_desc", label: "Mobile Desc", visible: true },
      { key: "status", label: "Status", visible: true },
      { key: "link", label: "Link", visible: true },
      { key: "created", label: "Created", visible: true },
      { key: "actions", label: "Actions", visible: true, required: true },
    ];

    setVisibleColumns(defaultColumns);
  };

  const clearSavedColumnPreferences = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("postTableColumns");
    }
    resetColumns();
  };

  const isColumnVisible = (columnKey: string) => {
    return visibleColumns.find((col) => col.key === columnKey)?.visible ?? true;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <TypographyH2 className="border-none pb-0">Posts</TypographyH2>
        <div className="flex items-center gap-2">
          <Link href="/staff/posts/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Controls */}
      {isMobile ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 w-full h-9"
            onClick={() => setMobileFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-3 p-4">
                <Input
                  type="search"
                  placeholder="Search posts by title or description..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                <Select
                  value={filters.hasImage}
                  onValueChange={(value) =>
                    updateFilter("hasImage", value as PostFilters["hasImage"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Image Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="with-image">With Image</SelectItem>
                    <SelectItem value="without-image">Without Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilter("status", value as PostFilters["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    updateFilter("sortBy", value as PostFilters["sortBy"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-new">Newest First</SelectItem>
                    <SelectItem value="date-old">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.hasLink}
                  onValueChange={(value) =>
                    updateFilter("hasLink", value as PostFilters["hasLink"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Link Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Posts</SelectItem>
                    <SelectItem value="with-link">With Link</SelectItem>
                    <SelectItem value="without-link">Without Link</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearAllFilters();
                      setMobileFilterOpen(false);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <DrawerClose asChild>
                    <Button size="sm" className="flex-1">
                      Apply
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search posts by title or description..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 w-full sm:w-auto bg-transparent h-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filter
              {showFilters ? (
                <ChevronLeft className="ml-1 h-4 w-4" />
              ) : (
                <ChevronRight className="ml-1 h-4 w-4" />
              )}
            </Button>
            <Select
              value={filters.hasImage}
              onValueChange={(value) => {
                updateFilter("hasImage", value as PostFilters["hasImage"]);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Image Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="with-image">With Image</SelectItem>
                <SelectItem value="without-image">Without Image</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                updateFilter("status", value as PostFilters["status"]);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => {
                updateFilter("sortBy", value as PostFilters["sortBy"]);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-new">Newest First</SelectItem>
                <SelectItem value="date-old">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {showFilters && (
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>Refine your post search.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
            <div>
              <label
                htmlFor="hasLink"
                className="block text-sm font-medium text-gray-700"
              >
                Link Filter
              </label>
              <Select
                value={filters.hasLink}
                onValueChange={(value) => {
                  updateFilter("hasLink", value as PostFilters["hasLink"]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="with-link">With Link</SelectItem>
                  <SelectItem value="without-link">Without Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedPosts.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {selectedPosts.length} selected
              </span>
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={openDeleteDialog}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedPosts.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete the following{" "}
                      {postsToDelete.length} post(s)? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {postsToDelete.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center gap-3 p-2 border rounded-md"
                      >
                        <Image
                          src={
                            post.image_url ||
                            "/placeholder.svg?height=48&width=48"
                          }
                          alt={post.title}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
                        <span className="font-medium">{post.title}</span>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeletePosts}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={clearPostSelection}>
                Clear Selection
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {sortedPosts.length} Results
          </div>

          {/* Column Filter Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Columns className="h-4 w-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Toggle Columns</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetColumns}
                      className="text-xs h-6 px-2"
                      title="Reset to default"
                    >
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSavedColumnPreferences}
                      className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                      title="Clear saved preferences"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {visibleColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`column-${column.key}`}
                        checked={column.visible}
                        onCheckedChange={() =>
                          toggleColumnVisibility(column.key)
                        }
                        disabled={column.required}
                      />
                      <label
                        htmlFor={`column-${column.key}`}
                        className={`text-sm cursor-pointer flex-1 ${
                          column.required
                            ? "text-gray-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {column.label}
                        {column.required && (
                          <span className="text-xs text-gray-400 ml-1">
                            (required)
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500">
                    {visibleColumns.filter((col) => col.visible).length} of{" "}
                    {visibleColumns.length} columns visible
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    💾 Preferences saved automatically
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <PostTableSkeletonEnhanced />
      ) : posts.length === 0 ? (
        <EmptyPostsState />
      ) : sortedPosts.length === 0 ? (
        <NoPostResultsState onClearFilters={clearAllFilters} />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isColumnVisible("select") && (
                  <TableHead className="min-w-[50px] text-center">
                    <Checkbox
                      checked={
                        selectedPosts.length === currentPageData.length &&
                        currentPageData.length > 0
                      }
                      onCheckedChange={toggleSelectAllPosts}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {isColumnVisible("image") && (
                  <TableHead className="min-w-[100px] text-center">
                    Image
                  </TableHead>
                )}
                {isColumnVisible("title") && (
                  <TableHead className="min-w-[400px] ">Title</TableHead>
                )}
                {isColumnVisible("description") && (
                  <TableHead className="min-w-[500px] ">Description</TableHead>
                )}
                {isColumnVisible("mobile_desc") && (
                  <TableHead className="min-w-[400px]">Mobile Desc</TableHead>
                )}
                {isColumnVisible("status") && (
                  <TableHead className="min-w-[100px] text-center">
                    Status
                  </TableHead>
                )}
                {isColumnVisible("link") && (
                  <TableHead className="min-w-[100px] text-center">
                    Link
                  </TableHead>
                )}
                {isColumnVisible("created") && (
                  <TableHead className="min-w-[200px]">Created</TableHead>
                )}
                {isColumnVisible("actions") && (
                  <TableHead className="text-center min-w-[80px]">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No posts found.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((post) => (
                  <TableRow
                    key={post.id}
                    onClick={() => router.push(`/staff/posts/${post.id}`)}
                    className="cursor-pointer max-h-20 h-20"
                  >
                    {isColumnVisible("select") && (
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                        className="text-center"
                      >
                        <Checkbox
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={() => togglePostSelection(post.id)}
                          aria-label={`Select post ${post.title}`}
                        />
                      </TableCell>
                    )}
                    {isColumnVisible("image") && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center h-full">
                          <Image
                            src={
                              post.image_url ||
                              "/placeholder.svg?height=48&width=48"
                            }
                            alt={post.title}
                            className="h-12 w-12 rounded-md object-cover"
                            width={40}
                            height={40}
                          />
                        </div>
                      </TableCell>
                    )}
                    {isColumnVisible("title") && (
                      <TableCell className="font-bold">
                        <div title={post.title}>{post.title}</div>
                      </TableCell>
                    )}
                    {isColumnVisible("description") && (
                      <TableCell className="max-h-20 overflow-hidden">
                        <div
                          className="max-w-[500px] leading-relaxed max-h-16 overflow-hidden"
                          title={post.description || "-"}
                        >
                          {post.description
                            ? truncateText(post.description, 250, 2)
                            : "-"}
                        </div>
                      </TableCell>
                    )}
                    {isColumnVisible("mobile_desc") && (
                      <TableCell className="max-h-20 overflow-hidden">
                        <div
                          className="max-w-[500px] leading-relaxed max-h-16 overflow-hidden"
                          title={post.mobile_description || "-"}
                        >
                          {post.mobile_description
                            ? truncateText(post.mobile_description, 250, 2)
                            : "-"}
                        </div>
                      </TableCell>
                    )}
                    {isColumnVisible("status") && (
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            post.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            post.status === "published"
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : "bg-yellow-500 hover:bg-yellow-600 text-white"
                          }
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                    )}
                    {isColumnVisible("link") && (
                      <TableCell>
                        {renderLinkDisplay(post.link, post.link_name)}
                      </TableCell>
                    )}
                    {isColumnVisible("created") && (
                      <TableCell>{formatDate(post.created_at)}</TableCell>
                    )}
                    {isColumnVisible("actions") && (
                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            router.push(`/staff/posts/${post.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
