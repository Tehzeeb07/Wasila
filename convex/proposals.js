import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ==================== Freelancer-side (existing) ====================

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

// ==================== Client-side (new) ====================

// All proposals on a job, with the freelancer's name/headline attached,
// newest first. Used on the client's job-detail / proposal-review screen.
export const listForJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .order("desc")
      .collect();

    return await Promise.all(
      proposals.map(async (p) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", p.freelancerUserId))
          .unique();
        const freelancerProfile = await ctx.db
          .query("freelancerProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", p.freelancerUserId))
          .unique();
        return {
          ...p,
          name: profile?.name,
          headline: freelancerProfile?.headline,
          hourlyRate: freelancerProfile?.hourlyRate,
        };
      })
    );
  },
});

// Every PENDING proposal across every job the signed-in client owns —
// powers the top-level "Proposals" inbox page.
export const listPendingForClient = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_client", (q) => q.eq("clientUserId", userId))
      .collect();

    const result = [];
    for (const job of jobs) {
      const pending = await ctx.db
        .query("proposals")
        .withIndex("by_job", (q) => q.eq("jobId", job._id))
        .filter((q) => q.eq(q.field("status"), "PENDING"))
        .collect();

      for (const p of pending) {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", p.freelancerUserId))
          .unique();
        result.push({ ...p, jobTitle: job.title, name: profile?.name });
      }
    }
    return result.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Client accepts a proposal: that proposal -> ACCEPTED, every other pending
// proposal on the job -> REJECTED, job -> IN_PROGRESS.
export const accept = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("Proposal not found");
    const job = await ctx.db.get(proposal.jobId);
    if (!job || job.clientUserId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.proposalId, { status: "ACCEPTED" });

    const siblings = await ctx.db
      .query("proposals")
      .withIndex("by_job", (q) => q.eq("jobId", proposal.jobId))
      .collect();
    for (const sibling of siblings) {
      if (sibling._id !== args.proposalId && sibling.status === "PENDING") {
        await ctx.db.patch(sibling._id, { status: "REJECTED" });
      }
    }

    await ctx.db.patch(proposal.jobId, { status: "IN_PROGRESS" });
  },
});

export const reject = mutation({
  args: { proposalId: v.id("proposals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) throw new Error("Proposal not found");
    const job = await ctx.db.get(proposal.jobId);
    if (!job || job.clientUserId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.proposalId, { status: "REJECTED" });
  },
});
