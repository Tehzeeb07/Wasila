import { query } from "./_generated/server";
import { v } from "convex/values";

export const listOpenJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "OPEN"))
      .order("desc")
      .collect();
  },
});

export const searchJobs = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (!args.searchTerm) return [];

    return await ctx.db
      .query("jobs")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm)
      )
      .take(20);
  },
});

export const getJobById = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});