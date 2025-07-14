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
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
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
  Badge,
} from "@/components/ui/";
import {
  TypographyH2,
  TypographyH3,
  TypographyP,
} from "@/components/ui/Typography";
import Image from "next/image";
import { Blog } from "@/type/blogs";

interface BlogFilters {
  search: string;
  sortBy: "title-asc" | "title-desc" | "date-new" | "date-old";
  hasImage: "all" | "with-image" | "without-image";
  hasLink: "all" | "with-link" | "without-link";
}

function BlogTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <div className="h-4 w-4 rounded-sm bg-gray-200 animate-pulse" />
            </TableHead>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-4 rounded-sm bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-12 ml-auto rounded bg-gray-200 animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyBlogsState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <BookOpen className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH3 className="mb-2">No blogs found</TypographyH3>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        Get started by creating your first blog post to share insights and
        engage with your audience.
      </TypographyP>
      <Link href="/staff/blogs/new">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Your First Blog
        </Button>
      </Link>
    </div>
  );
}

function NoResultsState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Search className="w-12 h-12 text-gray-400" />
      </div>
      <TypographyH3 className="mb-2">No matching blogs</TypographyH3>
      <TypographyP className="text-muted-foreground text-center mb-6 max-w-sm">
        No blogs match your current search criteria. Try adjusting your filters
        or search terms.
      </TypographyP>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Link href="/staff/blogs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Blog
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BlogFilters>({
    search: "",
    sortBy: "date-new",
    hasImage: "all",
    hasLink: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blogsToDelete, setBlogsToDelete] = useState<Blog[]>([]);

  const itemsPerPage = 10;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select(
        `
        *,
        blog_images(image_url),
        blog_tags(tags(id, name))
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blogs:", error.message);
      toast.error("Failed to fetch blogs");
      setBlogs([]);
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const updateFilter = (key: keyof BlogFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleBlogSelection = (blogId: string) => {
    setSelectedBlogs((prev) =>
      prev.includes(blogId)
        ? prev.filter((id) => id !== blogId)
        : [...prev, blogId]
    );
  };

  const toggleSelectAllBlogs = () => {
    if (
      selectedBlogs.length === currentPageData.length &&
      currentPageData.length > 0
    ) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(currentPageData.map((blog) => blog.id));
    }
  };

  const clearBlogSelection = () => {
    setSelectedBlogs([]);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      sortBy: "date-new",
      hasImage: "all",
      hasLink: "all",
    });
    setCurrentPage(1);
  };

  const openDeleteDialog = () => {
    const blogsToConfirm = blogs.filter((b) => selectedBlogs.includes(b.id));
    setBlogsToDelete(blogsToConfirm);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteBlogs = async () => {
    if (selectedBlogs.length === 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("blogs")
        .delete()
        .in("id", selectedBlogs);

      if (error) {
        console.error("Error deleting blogs:", error.message);
        toast.error(`Error deleting blogs: ${error.message}`);
      } else {
        toast.success(`Successfully deleted ${selectedBlogs.length} blog(s)!`);
        clearBlogSelection();
        fetchBlogs();
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    // Filter by search term
    if (
      filters.search &&
      !blog.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !blog.description?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by image
    if (
      filters.hasImage === "with-image" &&
      (!blog.blog_images || blog.blog_images.length === 0)
    ) {
      return false;
    }
    if (
      filters.hasImage === "without-image" &&
      blog.blog_images &&
      blog.blog_images.length > 0
    ) {
      return false;
    }

    // Filter by link
    if (filters.hasLink === "with-link" && !blog.external_link) {
      return false;
    }
    if (filters.hasLink === "without-link" && blog.external_link) {
      return false;
    }

    return true;
  });

  // Sort blogs
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedBlogs.length / itemsPerPage);
  const currentPageData = sortedBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <TypographyH2>Blogs</TypographyH2>
          <div className="flex items-center gap-2">
            {selectedBlogs.length > 0 && (
              <>
                <span className="text-sm text-gray-500">
                  {selectedBlogs.length} selected
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
                      Delete Selected ({selectedBlogs.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete the following{" "}
                        {blogsToDelete.length} blog(s)? This action cannot be
                        undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {blogsToDelete.map((blog) => (
                        <div
                          key={blog.id}
                          className="flex items-center gap-3 p-2 border rounded-md"
                        >
                          <Image
                            src={
                              blog.blog_images?.[0]?.image_url ||
                              "/placeholder.svg?height=48&width=48"
                            }
                            alt={blog.title}
                            width={48}
                            height={48}
                            className="rounded-md object-cover"
                          />
                          <span className="font-medium">{blog.title}</span>
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
                      <Button variant="destructive" onClick={handleDeleteBlogs}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearBlogSelection}
                >
                  Clear Selection
                </Button>
              </>
            )}
            <Link href="/staff/blogs/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search blogs by title or description..."
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
              updateFilter("hasImage", value as BlogFilters["hasImage"]);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="Image Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blogs</SelectItem>
              <SelectItem value="with-image">With Image</SelectItem>
              <SelectItem value="without-image">Without Image</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => {
              updateFilter("sortBy", value as BlogFilters["sortBy"]);
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

      {showFilters && (
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            <CardDescription>Refine your blog search.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
            <div>
              <TypographyP className="text-sm font-medium mb-2">
                Link Filter
              </TypographyP>
              <Select
                value={filters.hasLink}
                onValueChange={(value) => {
                  updateFilter("hasLink", value as BlogFilters["hasLink"]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Blogs</SelectItem>
                  <SelectItem value="with-link">With Link</SelectItem>
                  <SelectItem value="without-link">Without Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end">
        <div className="text-sm text-gray-500">
          {sortedBlogs.length} Results
        </div>
      </div>

      {loading ? (
        <BlogTableSkeleton />
      ) : blogs.length === 0 ? (
        <EmptyBlogsState />
      ) : sortedBlogs.length === 0 ? (
        <NoResultsState onClearFilters={clearAllFilters} />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedBlogs.length === currentPageData.length &&
                      currentPageData.length > 0
                    }
                    onCheckedChange={toggleSelectAllBlogs}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.map((blog) => (
                <TableRow
                  key={blog.id}
                  onClick={() => router.push(`/staff/blogs/${blog.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedBlogs.includes(blog.id)}
                      onCheckedChange={() => toggleBlogSelection(blog.id)}
                      aria-label={`Select blog ${blog.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-16 h-12">
                      {(blog.blog_images || [])
                        .map((img) => img.image_url)
                        .filter((src, i, arr) => src && arr.indexOf(src) === i)
                        .slice(0, 4)
                        .map((src, index) => (
                          <Image
                            key={index}
                            src={src}
                            alt={`${blog.title} ${index + 1}`}
                            className="absolute top-0 left-0 w-10 h-10 rounded-md object-cover border border-white shadow-sm transition-all"
                            style={{
                              zIndex: 10 - index,
                              transform: `translateX(${index * 12}px)`,
                            }}
                            width={40}
                            height={40}
                          />
                        ))}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={blog.title}>
                      {blog.title}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div
                      className="truncate text-gray-600"
                      title={blog.description || ""}
                    >
                      {blog.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.blog_tags && blog.blog_tags.length > 0 ? (
                        blog.blog_tags
                          .flatMap((bt) => bt.tags)
                          .slice(0, 2)
                          .map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))
                      ) : (
                        <span className="text-gray-400 text-sm">No tags</span>
                      )}

                      {blog.blog_tags &&
                        blog.blog_tags.flatMap((bt) => bt.tags).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +
                            {blog.blog_tags.flatMap((bt) => bt.tags).length - 2}
                          </Badge>
                        )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {blog.external_link ? (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span
                          className="text-sm font-medium truncate max-w-[120px]"
                          title={blog.external_link}
                        >
                          External Link
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No link</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(blog.created_at)}</TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        router.push(`/staff/blogs/${blog.id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
