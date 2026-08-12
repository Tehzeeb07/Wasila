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

// Call this on every keystroke in the message input (debounced client-side).
export const setTyping = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_job_and_user", (q) =>
        q.eq("jobId", args.jobId).eq("userId", userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { updatedAt: Date.now() });
    } else {
      await ctx.db.insert("typingIndicators", {
        jobId: args.jobId,
        userId,
        updatedAt: Date.now(),
      });
    }
  },
});

// Returns names of everyone (besides me) currently typing in this job's chat.
// "Typing" = updated within the last 3 seconds — stale entries are ignored,
// not deleted, to keep this cheap (no cleanup job needed).
export const getTypingUsers = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const all = await ctx.db
      .query("typingIndicators")
      .withIndex("by_job_and_user", (q) => q.eq("jobId", args.jobId))
      .collect();

    const cutoff = Date.now() - 3000;
    const active = all.filter((t) => t.updatedAt > cutoff && t.userId !== userId);

    return await Promise.all(
      active.map(async (t) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", t.userId))
          .unique();
        return profile?.name ?? "Someone";
      })
    );
  },
});

// Call this when the chat window is open/focused and new messages arrive.
export const markRead = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();

    for (const m of messages) {
      if (m.senderUserId === userId) continue; // don't mark own messages
      const readBy = m.readBy ?? [];
      if (!readBy.includes(userId)) {
        await ctx.db.patch(m._id, { readBy: [...readBy, userId] });
      }
    }
  },
});

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
        return {
          ...m,
          senderName: profile?.name,
          fileUrl: m.fileId ? await ctx.storage.getUrl(m.fileId) : null,
        };
      })
    );
  },
});

export const send = mutation({
  args: {
    jobId: v.id("jobs"),
    content: v.string(),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requireParticipant(ctx, args.jobId, userId);
    return await ctx.db.insert("messages", {
      jobId: args.jobId,
      senderUserId: userId,
      content: args.content,
      fileId: args.fileId,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});