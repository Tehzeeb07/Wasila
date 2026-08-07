import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const toggleBookmark = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_job", (q) =>
        q.eq("userId", userId).eq("jobId", args.jobId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // removed
    } else {
      await ctx.db.insert("bookmarks", { userId, jobId: args.jobId });
      return true; // added
    }
  },
});

export const getMyBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch actual job details for each bookmark
    const jobs = await Promise.all(
      bookmarks.map((b) => ctx.db.get(b.jobId))
    );

    return jobs.filter(Boolean);
  },
});