export interface PostFilters {
  search: string;
  sortBy: "title-asc" | "title-desc" | "date-new" | "date-old";
  hasImage: "all" | "with-image" | "without-image";
  hasLink: "all" | "with-link" | "without-link";
  status: "all" | "draft" | "published";
}
