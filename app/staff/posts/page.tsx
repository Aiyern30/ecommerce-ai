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
} from "@/components/ui/";
import Image from "next/image";
import { PostFilters } from "@/type/Filter/PostFilters";
import { Post } from "@/type/posts";

function PostTableSkeleton() {
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

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PostFilters>({
    search: "",
    sortBy: "date-new",
    hasImage: "all",
    hasLink: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postsToDelete, setPostsToDelete] = useState<Post[]>([]);

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
      const { error } = await supabase
        .from("posts")
        .delete()
        .in("id", selectedPosts);

      if (error) {
        console.error("Error deleting posts:", error.message);
        toast.error(`Error deleting posts: ${error.message}`);
      } else {
        toast.success(`Successfully deleted ${selectedPosts.length} post(s)!`);
        clearPostSelection();
        fetchPosts();
      }
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
      toast.error("An unexpected error occurred. Please try again.");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <div className="flex items-center gap-2">
          <Link href="/staff/posts/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </Link>
        </div>
      </div>

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
            className="flex items-center gap-1 w-full sm:w-auto bg-transparent"
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Image Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="with-image">With Image</SelectItem>
              <SelectItem value="without-image">Without Image</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => {
              updateFilter("sortBy", value as PostFilters["sortBy"]);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
        <div className="text-sm text-gray-500">
          {sortedPosts.length} Results
        </div>
      </div>

      {loading ? (
        <PostTableSkeleton />
      ) : (
        <div className="w-full overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedPosts.length === currentPageData.length &&
                      currentPageData.length > 0
                    }
                    onCheckedChange={toggleSelectAllPosts}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No posts found.
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((post) => (
                  <TableRow
                    key={post.id}
                    onClick={() => router.push(`/staff/posts/${post.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={() => togglePostSelection(post.id)}
                        aria-label={`Select post ${post.title}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Image
                        src={
                          post.image_url ||
                          "/placeholder.svg?height=48&width=48"
                        }
                        alt={post.title}
                        className="h-12 w-12 rounded-md object-cover"
                        width={48}
                        height={48}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={post.title}>
                        {post.title}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div
                        className="truncate text-gray-600"
                        title={post.description || ""}
                      >
                        {post.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderLinkDisplay(post.link, post.link_name)}
                    </TableCell>
                    <TableCell>{formatDate(post.created_at)}</TableCell>
                    <TableCell
                      className="text-right"
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
