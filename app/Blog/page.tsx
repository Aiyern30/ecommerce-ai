import Image from "next/image";
import { Button, Card } from "@/components/ui/";
import RelatedTo from "@/components/Blog/RelatedTo";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

// Blog Data
const blogs = [
  {
    id: 1,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U8Lz7UTDjrUncO2xr3rqYppgi1tu8W.png",
    title: "How grocers are approaching delivery as the market evolves",
    date: "August 17, 2023",
    author: "Catherine Douglas",
    description:
      "As consumer preferences shift and technology advances, grocery retailers are adapting their delivery strategies to meet changing demands while maintaining profitability in an increasingly competitive market.",
  },
  {
    id: 2,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U8Lz7UTDjrUncO2xr3rqYppgi1tu8W.png",
    title: "The Friday Checkout: Food insecurity keeps retailers off balance",
    date: "August 11, 2023",
    author: "Editorial Staff",
    description:
      "Grocery retailers are navigating complex challenges as food insecurity affects consumer purchasing patterns, forcing companies to balance affordability initiatives with operational costs and profit margins.",
  },
  {
    id: 3,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U8Lz7UTDjrUncO2xr3rqYppgi1tu8W.png",
    title: "Consumers want grocers to use AI to help them save money",
    date: "August 9, 2023",
    author: "Peyton Garcia",
    description:
      "A recent study reveals that consumers are increasingly open to AI-powered solutions in grocery shopping, particularly when these technologies can help identify savings opportunities and personalize promotions.",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto">
      <div className="py-4">
        <BreadcrumbNav currentPage={"Blog"} showFilterButton={false} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 mb-4">
        {/* Main Content */}
        <div className="lg:w-3/4">
          {blogs.map((blog) => (
            <Card
              key={blog.id}
              className="mb-8 overflow-hidden border-0 shadow-sm"
            >
              <div className="relative h-64 sm:h-80">
                <Image
                  src={blog.image || "/placeholder.svg"}
                  alt={blog.title || "Blog image"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {blog.title || "Untitled Blog"}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{blog.date || "Unknown Date"}</span>
                  <span className="mx-2">•</span>
                  <span>{blog.author || "Unknown Author"}</span>
                </div>
                <p className="text-gray-700 mb-4">
                  {blog.description || "No description available."}
                </p>
                <Button variant="default">Read more</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <RelatedTo />
        </div>
      </div>
    </div>
  );
}
