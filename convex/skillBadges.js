import { query } from "./_generated/server";
import { v } from "convex/values";

const MIN_COMPLETED_JOBS = 3;
const MIN_AVERAGE_RATING = 4;

// Shared helper — also imported by jobs.js and proposals.js so job/proposal
// listings can attach verified-skill badges without an extra round trip.
export async function computeSkillStats(ctx, freelancerUserId) {
  const proposals = await ctx.db
    .query("proposals")
    .withIndex("by_freelancer", (q) => q.eq("freelancerUserId", freelancerUserId))
    .filter((q) => q.eq(q.field("status"), "ACCEPTED"))
    .collect();

  const statsBySkill = {};

  for (const p of proposals) {
    const job = await ctx.db.get(p.jobId);
    if (!job || job.status !== "COMPLETED") continue;

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_job", (q) => q.eq("jobId", job._id))
      .filter((q) => q.eq(q.field("targetUserId"), freelancerUserId))
      .collect();

    for (const skill of job.skills || []) {
      if (!statsBySkill[skill]) {
        statsBySkill[skill] = { completedJobs: 0, ratingSum: 0, ratingCount: 0 };
      }
      statsBySkill[skill].completedJobs += 1;
      for (const r of reviews) {
        statsBySkill[skill].ratingSum += r.rating;
        statsBySkill[skill].ratingCount += 1;
      }
    }
  }

  return Object.entries(statsBySkill).map(([skill, s]) => {
    const averageRating = s.ratingCount > 0 ? s.ratingSum / s.ratingCount : null;
    return {
      skill,
      completedJobs: s.completedJobs,
      averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
      verified:
        s.completedJobs >= MIN_COMPLETED_JOBS &&
        averageRating !== null &&
        averageRating >= MIN_AVERAGE_RATING,
    };
  });
}

// Every skill + its stats, verified or not — good for a freelancer's own
// profile ("2/3 jobs toward verification in React").
export const getSkillStats = query({
  args: { freelancerUserId: v.id("users") },
  handler: async (ctx, args) => computeSkillStats(ctx, args.freelancerUserId),
});

// Just the skill names that crossed the threshold — what you render as a badge.
export const getVerifiedSkills = query({
  args: { freelancerUserId: v.id("users") },
  handler: async (ctx, args) => {
    const stats = await computeSkillStats(ctx, args.freelancerUserId);
    return stats.filter((s) => s.verified).map((s) => s.skill);
  },
});