import React from "react";
import { Avatar, AvatarFallback, AvatarImage, Button } from "../ui";
import { Facebook, Twitter, Linkedin } from "lucide-react";

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

const RelatedTo = () => {
  return (
    <div className="sticky top-24">
      {/* Related People */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">RELATED TO</h3>
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
  );
};

export default RelatedTo;
