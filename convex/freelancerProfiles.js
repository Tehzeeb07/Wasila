import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Apna profile fetch karo
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

export const setAvailability = mutation({
  args: {
    availability: v.union(
      v.literal("AVAILABLE"),
      v.literal("BUSY"),
      v.literal("NOT_ACCEPTING")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { availability: args.availability });
  },
});

// Profile banao ya update karo
export const upsertProfile = mutation({
  args: {
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    skills: v.array(v.string()),
    resumeFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    const existing = await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      const newId = await ctx.db.insert("freelancerProfiles", {
        userId,
        ...args,
      });
      return newId;
    }
  },
});