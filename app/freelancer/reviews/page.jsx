"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Star, MessageSquare, Award } from "lucide-react";

export default function ReviewsPage() {
  const reviews = useQuery(api.reviews.getMyReviews);
  const profile = useQuery(api.freelancerProfiles.getMyProfile);

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const fiveStarCount = reviews?.filter((r) => r.rating === 5).length ?? 0;

  return (
    <div className="-m-6 md:-m-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 h-24 md:rounded-t-3xl md:mx-10 md:mt-10" />

      <div className="px-6 md:px-10 pb-10">
        {/* Profile header card, overlapping banner */}
        <div className="bg-white border border-gray-200 rounded-b-2xl md:rounded-2xl -mt-14 relative p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-bold shrink-0 -mt-6">
              {profile?.headline ? profile.headline[0].toUpperCase() : "F"}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.headline || "Freelancer"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {profile?.skills?.slice(0, 3).join(" · ") || "No skills listed yet"}
              </p>
            </div>
            {avgRating && (
              <div className="flex items-center gap-1.5 bg-amber-50 px-4 py-2 rounded-xl">
                <Star size={16} className="fill-amber-500 text-amber-500" />
                <span className="font-bold text-gray-900">{avgRating}</span>
                <span className="text-xs text-gray-500">
                  ({reviews.length})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews list */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
              {reviews && (
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {reviews.length}
                </span>
              )}
            </div>

            {reviews?.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={22} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No reviews yet. Complete a project to get your first review.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {reviews?.map((r) => (
                <div
                  key={r._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < r.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  {r.comment ? (
                    <p className="text-sm text-gray-700">{r.comment}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No comment left.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Review Statistics
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {avgRating ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400">Average rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {reviews?.length ?? 0}
                  </p>
                  <p className="text-xs text-gray-400">Total reviews</p>
                </div>
              </div>
            </div>

            {fiveStarCount > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Achievements
                </h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Award size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Top Rated
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Received {fiveStarCount} five-star review
                      {fiveStarCount !== 1 ? "s" : ""} from clients.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}