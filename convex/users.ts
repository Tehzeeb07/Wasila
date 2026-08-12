import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";


const ADMIN_INVITE_CODE = "Wasila"; // change this to something only your team knows

export const completeSignup = mutation({
  args: {
    role: v.union(v.literal("FREELANCER"), v.literal("CLIENT"), v.literal("ADMIN")),
    name: v.string(),
    email: v.string(),
    adminCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.role === "ADMIN" && args.adminCode?.trim() !== ADMIN_INVITE_CODE.trim()) {
      throw new Error("Invalid admin invite code");
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) return existing._id;

    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: args.role,
      email: args.email,
      status: "APPROVED",
      name: args.name,
      twoFactorEnabled: false,
      failedLoginCount: 0,
    });

    if (args.role === "FREELANCER") {
      await ctx.db.insert("freelancerProfiles", { userId, skills: [] });
    } else if (args.role === "CLIENT") {
      await ctx.db.insert("clientProfiles", { userId });
    }
    // ADMIN gets no freelancer/client profile row — just the userProfiles entry

    await ctx.db.insert("activityLogs", {
      userId,
      action: "SIGNUP",
      metadata: { role: args.role },
    });

    return profileId;
  },
});

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const listUsers = query({
  args: {
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("FREELANCER"), v.literal("CLIENT"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (me?.role !== "ADMIN") throw new Error("Forbidden");

    if (args.role) {
      return await ctx.db
        .query("userProfiles")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    }
    return await ctx.db.query("userProfiles").collect();
  },
});

export const setUserStatus = mutation({
  args: {
    targetProfileId: v.id("userProfiles"),
    status: v.union(v.literal("PENDING"), v.literal("APPROVED"), v.literal("SUSPENDED")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (me?.role !== "ADMIN") throw new Error("Forbidden");

    await ctx.db.patch(args.targetProfileId, { status: args.status });
    await ctx.db.insert("auditLogs", {
      actorUserId: userId,
      action: "SET_USER_STATUS",
      targetType: "userProfiles",
      targetId: args.targetProfileId,
      metadata: { status: args.status },
    });
  },
});