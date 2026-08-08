"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const job = useQuery(api.jobs.getJobById, { id: params.id });
  const submitProposal = useMutation(api.proposals.submitProposal);
  const submitReview = useMutation(api.reviews.submitReview);
  const jobReviews = useQuery(api.reviews.getJobReviews, { jobId: params.id });

  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  const handleApply = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      await submitProposal({
        jobId: params.id,
        coverLetter,
        bidAmount: Number(bidAmount),
      });
      setStatus("✓ Proposal submitted!");
      setCoverLetter("");
      setBidAmount("");
    } catch (err) {
      setStatus("Error: " + err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewStatus("Submitting...");
    try {
      await submitReview({
        jobId: params.id,
        targetUserId: job.clientUserId,
        rating,
        comment,
      });
      setReviewStatus("✓ Review submitted!");
      setComment("");
    } catch (err) {
      setReviewStatus("Error: " + err.message);
    }
  };

  if (job === undefined) return <p className="text-gray-500">Loading...</p>;
  if (job === null) return <p className="text-gray-500">Job not found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <Link
  href={`/freelancer/jobs/${params.id}/messages`}
  className="text-emerald-600 text-sm hover:underline"
>
  💬 Open Project Chat
</Link>
          <p className="text-emerald-700 font-semibold mt-2">
            ${job.budgetMin ?? "?"} - ${job.budgetMax ?? "?"}
          </p>
          <p className="text-gray-600 mt-4 whitespace-pre-wrap">
            {job.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {job.skills?.map((skill, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {job.status === "COMPLETED" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Leave a Review for the Client
            </h2>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your experience working with this client?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
              >
                Submit Review
              </button>
              {reviewStatus && (
                <p className="text-xs text-gray-600">{reviewStatus}</p>
              )}
            </form>
          </div>
        )}

        {jobReviews && jobReviews.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews</h2>
            <div className="space-y-3">
              {jobReviews.map((r) => (
                <div key={r._id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < r.rating ? "text-yellow-500" : "text-gray-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
        <h2 className="font-semibold text-gray-900 mb-4">Submit a Proposal</h2>
        <form onSubmit={handleApply} className="space-y-4">
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Cover letter..."
            rows={5}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Your bid ($)"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition"
          >
            Submit Proposal
          </button>
          {status && <p className="text-xs text-gray-600">{status}</p>}
        </form>
      </div>
    </div>
  );
}