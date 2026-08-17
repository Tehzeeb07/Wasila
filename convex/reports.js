import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitReport = mutation({
  args: {
    targetUserId: v.optional(v.id("users")),
    targetJobId: v.optional(v.id("jobs")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    if (!args.targetUserId && !args.targetJobId) {
      throw new Error("Report must target a user or a job.");
    }
    if (args.reason.trim().length < 10) {
      throw new Error("Please describe the issue in a bit more detail.");
    }

    return await ctx.db.insert("reports", {
      authorUserId: userId,
      targetUserId: args.targetUserId,
      targetJobId: args.targetJobId,
      reason: args.reason.trim(),
      status: "PENDING",
    });
  },
});