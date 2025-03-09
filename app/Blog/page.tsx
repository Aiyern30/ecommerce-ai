import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
} from "@/components/ui/";
import { Facebook, Linkedin, Twitter } from "lucide-react";

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

// Related People Data
const relatedPeople = [
  {
    id: 1,
    name: "Janice Doe",
    position: "VP of Technology at FreshMart",
    avatar: "/placeholder.svg?height=40&width=40",
    fallback: "JD",
  },
  {
    id: 2,
    name: "Michael Smith",
    position: "Director of Operations at GroceryPlus",
    avatar: "/placeholder.svg?height=40&width=40",
    fallback: "MS",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    position: "Head of AI Solutions at RetailTech",
    avatar: "/placeholder.svg?height=40&width=40",
    fallback: "SJ",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
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
          <div className="sticky top-24">
            {/* Related People */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">
                RELATED TO
              </h3>
              <div className="space-y-4">
                {relatedPeople.map((person) => (
                  <div key={person.id} className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback>{person.fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share These Pages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-4">
                SHARE THESE PAGES
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Facebook className="mr-2 h-4 w-4" /> Facebook
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <Twitter className="mr-2 h-4 w-4" /> Twitter
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-blue-700 hover:bg-blue-800 text-white"
                >
                  <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
