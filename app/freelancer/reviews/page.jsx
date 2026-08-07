"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ReviewsPage() {
  const reviews = useQuery(api.reviews.getMyReviews);

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Reviews</h1>
      <p className="text-gray-500 mb-6">
        Feedback clients have left after completed projects.
      </p>

      {avgRating && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 inline-flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
          <span className="text-yellow-500 text-xl">★</span>
          <span className="text-gray-500 text-sm">
            ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      {reviews?.length === 0 && (
        <p className="text-gray-500">No reviews yet.</p>
      )}

      <div className="space-y-4">
        {reviews?.map((review) => (
          <div
            key={review._id}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < review.rating ? "text-yellow-500" : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            {review.comment && (
              <p className="text-gray-700 text-sm">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}