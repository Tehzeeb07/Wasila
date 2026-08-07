import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitProposal = mutation({
  args: {
    jobId: v.id("jobs"),
    coverLetter: v.string(),
    bidAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    // Check if already applied
    const existing = await ctx.db
      .query("proposals")
      .withIndex("by_job_and_freelancer", (q) =>
        q.eq("jobId", args.jobId).eq("freelancerUserId", userId)
      )
      .first();

    if (existing) throw new Error("Already applied to this job");

    return await ctx.db.insert("proposals", {
      jobId: args.jobId,
      freelancerUserId: userId,
      coverLetter: args.coverLetter,
      bidAmount: args.bidAmount,
      status: "PENDING",
    });
  },
});

export const getMyProposals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("proposals")
      .withIndex("by_freelancer", (q) => q.eq("freelancerUserId", userId))
      .order("desc")
      .collect();
  },
});

export const withdrawProposal = mutation({
  args: { id: v.id("proposals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");

    const proposal = await ctx.db.get(args.id);
    if (!proposal || proposal.freelancerUserId !== userId) {
      throw new Error("Not allowed");
    }

    await ctx.db.delete(args.id);
  },
});