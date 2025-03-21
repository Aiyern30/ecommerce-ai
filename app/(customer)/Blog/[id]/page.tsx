import Image from "next/image";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import RelatedTo from "@/components/Blog/RelatedTo";
import { Card } from "@/components/ui";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

// interface BlogPostParams {
//   params: {
//     id: string;
//   };
// }

export default function BlogPost() {
  return (
    <article className="container mx-auto">
      <div className="py-4">
        <BreadcrumbNav showFilterButton={false} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 mb-4">
        <div className="lg:w-3/4">
          <Card className="">
            <div className="relative w-full h-[300px] md:h-[400px] mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xKOF0NE34DhVKckzV3VA0FtmDGvFvE.png"
                alt="Woman looking at phone"
                fill
                className="object-cover rounded-md"
              />
            </div>

            {/* Category */}
            <div className="mb-4 px-6">
              <span className="text-sm text-blue-600 font-medium">
                Self-help
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-900 mb-6 px-6">
              Mauris at orci non vulputate diam tincidunt nec
            </h1>

            {/* Content Paragraphs */}
            <div className="space-y-6 text-gray-700 px-6">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                tristique est et lectus varius, at hendrerit ex cursus.
                Curabitur eget ex interdum, ultrices nisi ac, convallis magna.
                Aliquam erat volutpat. Ut non maximus est, efficitur vestibulum
                dui. Sed nec.
              </p>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                tristique est et lectus varius, at hendrerit ex cursus.
                Curabitur eget ex interdum, ultrices nisi ac, convallis magna.
                Aliquam erat volutpat. Ut non maximus est, efficitur vestibulum
                dui. Sed nec purus ut magna. Sed nunc purus, dictum eget maximus
                sed, tincidunt egestas turpis. Sed et elit sem. Cras vitae purus
                diam. Vivamus placerat ultricies ipsum quis bibendum et amet,
                consequat adipiscing elit. Sed augue est, sem.
              </p>

              <div className="bg-gray-50 p-6 rounded-md border-l-4 border-blue-500">
                <p className="italic text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Commodo dictum magna, amet, consequat ipsum ipsum dolor sit
                  amet, consectetur adipiscing elit. Commodo dictum magna, amet,
                  consequat ipsum ipsum.
                </p>
              </div>
            </div>

            {/* Media Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 px-6">
              <div className="relative h-[200px] rounded-md overflow-hidden group">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-md group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="relative h-[200px] rounded-md overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Beach scene"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <p className="text-gray-700 mb-8 px-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              tristique est et lectus varius, at hendrerit ex cursus. Curabitur
              eget ex interdum, ultrices nisi ac, convallis magna. Aliquam erat
              volutpat. Ut non maximus est, efficitur vestibulum dui. Sed nec
              purus ut magna. Sed nunc purus, dictum eget maximus sed, tincidunt
              egestas turpis. Sed et elit sem. Cras vitae purus diam. Vivamus
              placerat ultricies ipsum quis bibendum et amet, consequat
              adipiscing elit. Sed augue est, sem.
            </p>

            {/* Product Recommendations */}
            <div className="my-8 px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Product 1 */}
                <div className="border rounded-md overflow-hidden">
                  <div className="relative h-[150px]">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Quam sed</h3>
                    <div className="flex items-center mt-1">
                      <div className="text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <div className="mt-1">
                      <span className="text-red-500 font-bold text-sm">
                        $39.99
                      </span>
                      <span className="text-gray-400 text-xs line-through ml-1">
                        $49.99
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product 2 */}
                <div className="border rounded-md overflow-hidden">
                  <div className="relative h-[150px]">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Torquent sed</h3>
                    <div className="flex items-center mt-1">
                      <div className="text-yellow-400 text-xs">★★★★☆</div>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-700 font-bold text-sm">
                        $29.99
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product 3 */}
                <div className="border rounded-md overflow-hidden">
                  <div className="relative h-[150px]">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Arcu in</h3>
                    <div className="flex items-center mt-1">
                      <div className="text-yellow-400 text-xs">★★★★★</div>
                    </div>
                    <div className="mt-1">
                      <span className="text-green-500 font-bold text-sm">
                        $24.99
                      </span>
                      <span className="text-gray-400 text-xs line-through ml-1">
                        $34.99
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product 4 */}
                <div className="border rounded-md overflow-hidden">
                  <div className="relative h-[150px]">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">Mi in</h3>
                    <div className="flex items-center mt-1">
                      <div className="text-yellow-400 text-xs">★★★★☆</div>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-700 font-bold text-sm">
                        $19.99
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Content */}
            <div className="space-y-6 text-gray-700 mb-12 px-6">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                tristique est et lectus varius, at hendrerit ex cursus.
                Curabitur eget ex interdum, ultrices nisi ac, convallis magna.
                Aliquam erat volutpat. Ut non maximus est, efficitur vestibulum
                dui. Sed nec purus ut magna. Sed nunc purus, dictum eget maximus
                sed, tincidunt egestas turpis. Sed et elit sem. Cras vitae purus
                diam. Vivamus placerat ultricies ipsum quis bibendum et amet,
                consequat adipiscing elit. Sed augue est, sem.
              </p>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                tristique est et lectus varius, at hendrerit ex cursus.
                Curabitur eget ex interdum, ultrices nisi ac, convallis magna.
                Aliquam erat volutpat. Ut non maximus est, efficitur vestibulum
                dui. Sed nec purus ut magna. Sed nunc purus, dictum eget maximus
                sed, tincidunt egestas turpis. Sed et elit sem. Cras vitae purus
                diam. Vivamus placerat ultricies ipsum quis bibendum et amet,
                consequat adipiscing elit. Sed augue est, sem.
              </p>
            </div>

            {/* Footer Navigation */}
            <div className="border-t pt-6 flex justify-between items-center px-6">
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
              </div>

              <div className="flex text-sm text-gray-500">
                <Link href="#" className="flex items-center mr-4">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Previous Post</span>
                </Link>
                <Link href="#" className="flex items-center">
                  <span>Next Post</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <RelatedTo />
        </div>
      </div>
    </article>
  );
}
