/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Blog } from "@/type/blogs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/";
import { Skeleton } from "@/components/ui/";
import { Button } from "@/components/ui/";
import { BlogCard } from "@/components/BlogCards";
import { BlogFilter } from "@/components/BlogFilter";
import { useDeviceType } from "@/utils/useDeviceTypes";
import { TypographyH1 } from "@/components/ui/Typography";

interface Tag {
  id: string;
  name: string;
  count: number;
}

export default function BlogsPage() {
  const { isMobile } = useDeviceType();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 8;

  const fetchAllBlogs = async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select(
        `
        id, title, description, status, created_at, updated_at,
        link, link_name, content, image_url,
        blog_images ( image_url ),
        blog_tags ( tags ( id, name ) )
      `
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch blogs:", error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    const validBlogs = data.filter(
      (blog) => blog.title && blog.blog_images && blog.blog_images.length > 0
    );

    const transformedBlogs: Blog[] = validBlogs.map((blog: any) => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      status: blog.status,
      created_at: blog.created_at,
      updated_at: blog.updated_at,
      link: blog.link,
      link_name: blog.link_name,
      content: blog.content,
      image_url: blog.image_url,
      blog_images:
        blog.blog_images?.map((img: any) => ({
          image_url: img.image_url,
        })) || null,
      blog_tags:
        blog.blog_tags?.map((blogTag: any) => ({
          tags: {
            id: blogTag.tags.id,
            name: blogTag.tags.name,
          },
        })) || null,
    }));

    return transformedBlogs;
  };

  const fetchTags = async () => {
    // First, get all blogs with their tags
    const { data: blogsWithTags, error: blogsError } = await supabase
      .from("blogs")
      .select(
        `
        id,
        status,
        blog_tags ( tags ( id, name ) )
      `
      )
      .eq("status", "published");

    if (blogsError) {
      console.error("Failed to fetch blogs with tags:", blogsError.message);
      return [];
    }

    const tagCounts: {
      [key: string]: { id: string; name: string; count: number };
    } = {};

    blogsWithTags?.forEach((blog: any) => {
      if (blog.blog_tags && Array.isArray(blog.blog_tags)) {
        blog.blog_tags.forEach((blogTag: any) => {
          const tag = blogTag.tags;
          if (tag && tag.id && tag.name) {
            if (!tagCounts[tag.id]) {
              tagCounts[tag.id] = {
                id: tag.id,
                name: tag.name,
                count: 0,
              };
            }
            tagCounts[tag.id].count += 1;
          }
        });
      }
    });

    return Object.values(tagCounts).filter((tag) => tag.count > 0);
  };

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [blogsData, tagsData] = await Promise.all([
        fetchAllBlogs(),
        fetchTags(),
      ]);

      setAllBlogs(blogsData);
      setBlogs(blogsData.slice(0, LIMIT));
      setTags(tagsData);
      setHasMore(blogsData.length > LIMIT);
      setPage(0);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredBlogs = useMemo(() => {
    let filtered = allBlogs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.description?.toLowerCase().includes(query) ||
          (blog.content && blog.content.toLowerCase().includes(query))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((blog) => {
        if (!blog.blog_tags || blog.blog_tags.length === 0) {
          return false;
        }

        const blogTagIds: string[] = [];
        blog.blog_tags.forEach((blogTag) => {
          if (blogTag.tags && blogTag.tags.id) {
            blogTagIds.push(blogTag.tags.id);
          }
        });

        const hasMatch = selectedTags.some((selectedTagId) =>
          blogTagIds.includes(selectedTagId)
        );

        return hasMatch;
      });
    }

    return filtered;
  }, [allBlogs, selectedTags, searchQuery]);

  useEffect(() => {
    const initialBlogs = filteredBlogs.slice(0, LIMIT);
    setBlogs(initialBlogs);
    setHasMore(filteredBlogs.length > LIMIT);
    setPage(0);
  }, [filteredBlogs]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const from = nextPage * LIMIT;
    const to = from + LIMIT;

    const newBlogs = filteredBlogs.slice(from, to);

    if (newBlogs.length > 0) {
      setBlogs((prev) => [...prev, ...newBlogs]);
      setPage(nextPage);
    }

    setHasMore(filteredBlogs.length > to);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="min-h-screen mb-4">
      <div className="container mx-auto px-4">
        <TypographyH1 className="my-8">ALL BLOGS</TypographyH1>

        <div
          className={`${
            isMobile
              ? "space-y-6"
              : "grid gap-6 lg:gap-8 grid-cols-1 xl:grid-cols-4"
          }`}
        >
          <div className={isMobile ? "" : "xl:col-span-1"}>
            <BlogFilter
              tags={tags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalBlogs={allBlogs.length}
              filteredBlogs={filteredBlogs.length}
            />
          </div>

          <div className={isMobile ? "" : "xl:col-span-3"}>
            {!loading && (selectedTags.length > 0 || searchQuery.trim()) && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Showing{" "}
                  <span className="font-medium">{filteredBlogs.length}</span> of{" "}
                  <span className="font-medium">{allBlogs.length}</span> blogs
                  {selectedTags.length > 0 && <span> with selected tags</span>}
                  {searchQuery.trim() && <span> matching "{searchQuery}"</span>}
                </p>
              </div>
            )}

            <div
              className={`grid gap-4 lg:gap-6 ${
                isMobile
                  ? "grid-cols-1"
                  : "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
              }`}
            >
              {blogs.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Initial loading skeleton */}
            {loading && (
              <div
                className={`grid gap-6 ${
                  isMobile
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                } mt-6`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden p-0">
                    <CardHeader className="p-0 relative h-52">
                      <Skeleton className="absolute inset-0 w-full h-full rounded-t-lg" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </CardContent>
                    <CardFooter className="px-4 pb-4">
                      <Skeleton className="h-4 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Load more skeleton */}
            {loadingMore && (
              <div
                className={`grid gap-6 ${
                  isMobile
                    ? "grid-cols-1"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                } mt-6`}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={`loading-${i}`} className="overflow-hidden p-0">
                    <CardHeader className="p-0 relative h-52">
                      <Skeleton className="absolute inset-0 w-full h-full rounded-t-lg" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </CardContent>
                    <CardFooter className="px-4 pb-4">
                      <Skeleton className="h-4 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!loading && !loadingMore && hasMore && blogs.length > 0 && (
              <div className="mt-8 text-center">
                <Button onClick={loadMore} className="bg-blue-700 text-white">
                  Load More ({filteredBlogs.length - blogs.length} remaining)
                </Button>
              </div>
            )}

            {/* No more blogs message */}
            {!loading && !loadingMore && !hasMore && blogs.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {filteredBlogs.length === allBlogs.length
                    ? "You've reached the end of our blog posts."
                    : `Showing all ${filteredBlogs.length} filtered results.`}
                </p>
              </div>
            )}

            {/* No blogs found */}
            {!loading && filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m-2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No blogs found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {selectedTags.length > 0 || searchQuery.trim()
                    ? "Try adjusting your filters or search query to find more blogs."
                    : "No blog posts are available at the moment. Check back later!"}
                </p>
                {(selectedTags.length > 0 || searchQuery.trim()) && (
                  <div className="mt-4 space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTags([]);
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
