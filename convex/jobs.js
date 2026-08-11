import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const statusValidator = v.union(
  v.literal("OPEN"),
  v.literal("IN_PROGRESS"),
  v.literal("COMPLETED"),
  v.literal("CANCELLED")
);

async function requireClientOwner(ctx, jobId) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const job = await ctx.db.get(jobId);
  if (!job || job.clientUserId !== userId) throw new Error("Not authorized");
  return { userId, job };
}

// ==================== Freelancer-side (existing) ====================
export const getRecommendedJobs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile?.skills?.length) return [];

    const openJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "OPEN"))
      .collect();

    const mySkills = profile.skills.map((s) => s.toLowerCase());
    const myRate = profile.hourlyRate;

    const scored = openJobs.map((job) => {
      let score = 0;

      // Skill overlap (60% weight)
      const jobSkills = (job.skills ?? []).map((s) => s.toLowerCase());
      const matchedSkills = jobSkills.filter((s) => mySkills.includes(s));
      const skillScore = jobSkills.length > 0
        ? (matchedSkills.length / jobSkills.length) * 60
        : 0;

      // Budget fit (25% weight) — job budget should be close to freelancer's rate
      let budgetScore = 0;
      if (myRate && job.budgetMax) {
        const diff = Math.abs(job.budgetMax - myRate * 10); // rough estimate
        budgetScore = Math.max(0, 25 - diff / 20);
      } else {
        budgetScore = 12;
      }

      // Recency (15% weight) — newer jobs score higher
      const daysOld = (Date.now() - job._creationTime) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 15 - daysOld);

      score = skillScore + budgetScore + recencyScore;

      return { ...job, matchScore: Math.round(score), matchedSkills };
    });

    return scored
      .filter((j) => j.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
  },
});

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

// ==================== Client-side (new) ====================

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("jobs")
      .withIndex("by_client", (q) => q.eq("clientUserId", userId))
      .order("desc")
      .collect();
  },
});

export const listMineByStatuses = query({
  args: { statuses: v.array(statusValidator) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_client", (q) => q.eq("clientUserId", userId))
      .order("desc")
      .collect();
    return jobs.filter((j) => args.statuses.includes(j.status));
  },
});

export const get = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => await ctx.db.get(args.jobId),
});

export const getWithAssignedFreelancer = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    const accepted = await ctx.db
      .query("proposals")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
      .unique();

    if (!accepted) return { ...job, proposal: null };

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", accepted.freelancerUserId))
      .unique();
    const freelancerProfile = await ctx.db
      .query("freelancerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", accepted.freelancerUserId))
      .unique();

    return {
      ...job,
      proposal: {
        ...accepted,
        name: profile?.name,
        headline: freelancerProfile?.headline,
      },
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    skills: v.array(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("jobs", {
      clientUserId: userId,
      status: "OPEN",
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    jobId: v.id("jobs"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    skills: v.array(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...rest } = args;
    await requireClientOwner(ctx, jobId);
    await ctx.db.patch(jobId, rest);
  },
});

export const setStatus = mutation({
  args: { jobId: v.id("jobs"), status: statusValidator },
  handler: async (ctx, args) => {
    await requireClientOwner(ctx, args.jobId);
    await ctx.db.patch(args.jobId, { status: args.status });
  },
});

export const remove = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const { job } = await requireClientOwner(ctx, args.jobId);
    if (job.status !== "OPEN") {
      throw new Error("Only open jobs (with no assigned freelancer) can be deleted");
    }
    await ctx.db.delete(args.jobId);
  },
});