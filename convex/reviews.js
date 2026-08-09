import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyReviews = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("reviews")
      .withIndex("by_target", (q) => q.eq("targetUserId", userId))
      .order("desc")
      .collect();
  },
});

export const getJobReviews = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();
  },
});

export const submitReview = mutation({
  args: {
    jobId: v.id("jobs"),
    targetUserId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Prevent duplicate review from same author for same job
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .filter((q) => q.eq(q.field("authorUserId"), userId))
      .first();

    if (existing) {
      throw new Error("You already reviewed this job");
    }

    return await ctx.db.insert("reviews", {
      jobId: args.jobId,
      authorUserId: userId,
      targetUserId: args.targetUserId,
      rating: args.rating,
      comment: args.comment,
    });
  },
});