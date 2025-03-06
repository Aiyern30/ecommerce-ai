import Image from "next/image";
import Link from "next/link";
import { Heart, ZoomIn } from "lucide-react";

// Blog post data
const blogPosts = [
  {
    id: 1,
    image: "/placeholder.svg?height=400&width=600",
    author: "SaberAli",
    date: "21 August 2020",
    title: "Top essential Trends in 2021",
    excerpt:
      "More off this less hello samlande lied much over tightly circa horse taped mightily",
    readMoreColor: "text-blue-800",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=400&width=600",
    author: "Surfaxion",
    date: "21 August 2020",
    title: "Top essential trends in 2021",
    excerpt:
      "More off this less hello samlande lied much over tightly circa horse taped mightily",
    readMoreColor: "text-pink-500",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=400&width=600",
    author: "SaberAli",
    date: "21 August 2020",
    title: "Top essential Trends in 2021",
    excerpt:
      "More off this less hello samlande lied much over tightly circa horse taped mightily",
    readMoreColor: "text-blue-800",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=400&width=600",
    author: "SaberAli",
    date: "21 August 2020",
    title: "Top essential Trends in 2021",
    excerpt:
      "More off this less hello samlande lied much over tightly circa horse taped mightily",
    readMoreColor: "text-blue-800",
  },
];

export default function LatestBlog() {
  return (
    <>
      {blogPosts.map((post) => (
        <Link key={post.id} href="#" className="group block relative">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {/* Blog Image */}
            <Image
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Hover Icons */}
            <div className="absolute left-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
                <ZoomIn className="h-5 w-5 text-blue-600" />
              </button>
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200">
                <Heart className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Blog Details */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              <span>{post.date}</span>
            </div>
            <h3 className="font-medium text-gray-800">{post.title}</h3>
            <p className="text-gray-600 text-sm">{post.excerpt}</p>
            <Link
              href="#"
              className={`text-sm font-medium ${post.readMoreColor}`}
            >
              Read More
            </Link>
          </div>
        </Link>
      ))}
    </>
  );
}
