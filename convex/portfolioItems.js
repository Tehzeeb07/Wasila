import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
export const getMyPortfolio = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("portfolioItems")
      .withIndex("by_freelancer", (q) => q.eq("freelancerUserId", userId))
      .collect();

    return await Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageFileId ? await ctx.storage.getUrl(item.imageFileId) : null,
      }))
    );
  },
});

export const addPortfolioItem = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    imageFileId: v.optional(v.id("_storage")),
    projectUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    return await ctx.db.insert("portfolioItems", {
      freelancerUserId: userId,
      ...args,
    });
  },
});

export const deletePortfolioItem = mutation({
  args: { id: v.id("portfolioItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    const item = await ctx.db.get(args.id);
    if (!item || item.freelancerUserId !== userId) {
      throw new Error("Not allowed");
    }

    await ctx.db.delete(args.id);
  },
});