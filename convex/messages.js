import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireParticipant(ctx, jobId, userId) {
  const job = await ctx.db.get(jobId);
  if (!job) throw new Error("Job not found");
  if (job.clientUserId === userId) return job;

  const accepted = await ctx.db
    .query("proposals")
    .withIndex("by_job", (q) => q.eq("jobId", jobId))
    .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
    .unique();
  if (accepted?.freelancerUserId === userId) return job;

  throw new Error("Not authorized");
}

export const listForJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (m) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", m.senderUserId))
          .unique();
        return { ...m, senderName: profile?.name };
      })
    );
  },
});

export const send = mutation({
  args: { jobId: v.id("jobs"), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requireParticipant(ctx, args.jobId, userId);
    return await ctx.db.insert("messages", {
      jobId: args.jobId,
      senderUserId: userId,
      content: args.content,
    });
  },
});
