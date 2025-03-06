import Image from "next/image";
import Link from "next/link";

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
];

export default function LatestBlog() {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-indigo-900">
        Latest Blog
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg overflow-hidden shadow-sm border border-gray-100"
          >
            <div className="relative">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                width={600}
                height={400}
                className="w-full h-56 object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
                  <span className="text-sm text-gray-600">{post.author}</span>
                </span>
                <span className="mx-4 text-gray-300">•</span>
                <span className="text-sm text-gray-600">{post.date}</span>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {post.title}
              </h3>

              <p className="text-gray-600 mb-4 text-sm">{post.excerpt}</p>

              <Link
                href="#"
                className={`text-sm font-medium ${post.readMoreColor}`}
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
