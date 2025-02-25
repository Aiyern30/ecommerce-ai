import { Star, MoreVertical } from "lucide-react";
import { Button } from "../ui";

export function ProductReviews() {
  const reviews = [
    {
      name: "Samantha D.",
      rating: 5,
      date: "August 14, 2023",
      verified: true,
      text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail, it's become my favorite go-to shirt.",
    },
    {
      name: "Alex M.",
      rating: 4,
      date: "August 15, 2023",
      verified: true,
      text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics and this t-shirt definitely gets a thumbs up from me.",
    },
    {
      name: "Ethan R.",
      rating: 4,
      date: "August 16, 2023",
      verified: true,
      text: "The t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt!",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Reviews (453)</h3>
        <div className="flex items-center gap-4">
          <select className="rounded-md border px-3 py-1">
            <option>Latest</option>
            <option>Highest Rating</option>
            <option>Lowest Rating</option>
          </select>
          <Button>Write a Review</Button>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review, i) => (
          <div key={i} className="border-b pb-6 last:border-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.name}</span>
                  {review.verified && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                      Verified
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Posted on {review.date}
                  </span>
                </div>
              </div>
              <button>
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <p className="mt-3 text-muted-foreground">{review.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline">Load More Reviews</Button>
      </div>
    </div>
  );
}
