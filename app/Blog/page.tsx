import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
} from "@/components/ui/";
import { Facebook, Linkedin, Twitter } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Blog Post 1 */}
          <Card className="mb-8 overflow-hidden border-0 shadow-sm">
            <div className="relative h-64 sm:h-80">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U8Lz7UTDjrUncO2xr3rqYppgi1tu8W.png"
                alt="Yellow soda and ice cream float"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                How grocers are approaching delivery as the market evolves
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>August 17, 2023</span>
                <span className="mx-2">•</span>
                <span>By Catherine Douglas</span>
              </div>
              <p className="text-gray-700 mb-4">
                As consumer preferences shift and technology advances, grocery
                retailers are adapting their delivery strategies to meet
                changing demands while maintaining profitability in an
                increasingly competitive market.
              </p>
              <Button
                variant="secondary"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Read more
              </Button>
            </div>
          </Card>

          {/* Blog Post 2 */}
          <Card className="mb-8 overflow-hidden border-0 shadow-sm">
            <div className="relative h-64 sm:h-80">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U8Lz7UTDjrUncO2xr3rqYppgi1tu8W.png"
                alt="Beer bottles in ice"
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                The Friday Checkout: Food insecurity keeps retailers off balance
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>August 11, 2023</span>
                <span className="mx-2">•</span>
                <span>By Editorial Staff</span>
              </div>
              <p className="text-gray-700 mb-4">
                Grocery retailers are navigating complex challenges as food
                insecurity affects consumer purchasing patterns, forcing
                companies to balance affordability initiatives with operational
                costs and profit margins.
              </p>
              <Button
                variant="secondary"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Read more
              </Button>
            </div>
          </Card>

          {/* Blog Post 3 */}
          <Card className="mb-8 overflow-hidden border-0 shadow-sm">
            <div className="relative h-64 sm:h-80">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-U8Lz7UTDjrUncO2xr3rqYppgi1tu8W.png"
                alt="Cheese selection"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                Consumer want grocers to use AI to help them save money
                Dunnhumby
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>August 9, 2023</span>
                <span className="mx-2">•</span>
                <span>By Peyton Garcia</span>
              </div>
              <p className="text-gray-700 mb-4">
                A recent study reveals that consumers are increasingly open to
                AI-powered solutions in grocery shopping, particularly when
                these technologies can help identify savings opportunities and
                personalize promotions.
              </p>
              <Button
                variant="secondary"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Read more
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="sticky top-24">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">
                RELATED TO
              </h3>
              <div className="space-y-4">
                {/* Related Item 1 */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Profile"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Janice Doe</p>
                    <p className="text-xs text-gray-500">
                      VP of Technology at FreshMart
                    </p>
                  </div>
                </div>

                {/* Related Item 2 */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Profile"
                    />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Michael Smith</p>
                    <p className="text-xs text-gray-500">
                      Director of Operations at GroceryPlus
                    </p>
                  </div>
                </div>

                {/* Related Item 3 */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Profile"
                    />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">
                      Head of AI Solutions at RetailTech
                    </p>
                  </div>
                </div>
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
