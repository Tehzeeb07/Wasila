import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();
  if (profile?.role !== "ADMIN") throw new Error("Forbidden");
  return userId;
}

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [users, jobs, proposals, reports, recentLogs] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("jobs").collect(),
      ctx.db.query("proposals").collect(),
      ctx.db.query("reports").collect(),
      ctx.db.query("activityLogs").order("desc").take(10),
    ]);

    const activeFreelancers = users.filter(
      (u) => u.role === "FREELANCER" && u.status === "APPROVED"
    ).length;
    const activeClients = users.filter(
      (u) => u.role === "CLIENT" && u.status === "APPROVED"
    ).length;
    const pendingAccountRequests = users.filter((u) => u.status === "PENDING").length;
    const pendingReports = reports.filter((r) => r.status === "PENDING").length;

    return {
      totalUsers: users.length,
      activeFreelancers,
      activeClients,
      pendingRequests: pendingAccountRequests + pendingReports,
      recentActivity: recentLogs.map((l) => ({
        id: l._id,
        action: l.action,
        timestamp: l._creationTime,
      })),
      quickStats: {
        totalJobs: jobs.length,
        openJobs: jobs.filter((j) => j.status === "OPEN").length,
        totalProposals: proposals.length,
        pendingReports,
      },
    };
  },
});

export const listReports = query({
  args: {
    status: v.optional(v.union(v.literal("PENDING"), v.literal("REVIEWED"), v.literal("DISMISSED"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(v.literal("REVIEWED"), v.literal("DISMISSED")),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    await ctx.db.patch(args.reportId, { status: args.status });
    await ctx.db.insert("auditLogs", {
      actorUserId: adminId,
      action: "RESOLVE_REPORT",
      targetType: "reports",
      targetId: args.reportId,
      metadata: { status: args.status },
    });
  },
});

export const fileReport = mutation({
  args: {
    targetUserId: v.optional(v.id("users")),
    targetJobId: v.optional(v.id("jobs")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("reports", {
      authorUserId: userId,
      targetUserId: args.targetUserId,
      targetJobId: args.targetJobId,
      reason: args.reason,
      status: "PENDING",
    });
  },
});

export const listAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.query("auditLogs").order("desc").take(args.limit ?? 100);
  },
});

export const getFullAnalytics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [users, jobs, proposals, reviews] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("jobs").collect(),
      ctx.db.query("proposals").collect(),
      ctx.db.query("reviews").collect(),
    ]);

    // User Growth Chart — signups per day, last 30 days
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const userGrowth: Record<string, number> = {};
    for (const u of users.filter((u) => u._creationTime >= thirtyDaysAgo)) {
      const day = new Date(u._creationTime).toISOString().slice(0, 10);
      userGrowth[day] = (userGrowth[day] || 0) + 1;
    }

    // Proposal Trends — proposals submitted per day, last 30 days
    const proposalTrends: Record<string, number> = {};
    for (const p of proposals.filter((p) => p._creationTime >= thirtyDaysAgo)) {
      const day = new Date(p._creationTime).toISOString().slice(0, 10);
      proposalTrends[day] = (proposalTrends[day] || 0) + 1;
    }

    // Project Completion Rate
    const completedJobs = jobs.filter((j) => j.status === "COMPLETED").length;
    const completionRate =
      jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

    // Popular Categories
    const categoryCount: Record<string, number> = {};
    for (const j of jobs) {
      categoryCount[j.category] = (categoryCount[j.category] || 0) + 1;
    }
    const popularCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Freelancer Performance — avg rating per freelancer, top 5
    const ratingsByFreelancer: Record<string, { total: number; count: number; name: string }> = {};
    for (const r of reviews) {
      const target = users.find((u) => u.userId === r.targetUserId);
      if (!target || target.role !== "FREELANCER") continue;
      const key = r.targetUserId;
      if (!ratingsByFreelancer[key]) {
        ratingsByFreelancer[key] = { total: 0, count: 0, name: target.name };
      }
      ratingsByFreelancer[key].total += r.rating;
      ratingsByFreelancer[key].count += 1;
    }
    const freelancerPerformance = Object.values(ratingsByFreelancer)
      .map((f) => ({ name: f.name, avgRating: +(f.total / f.count).toFixed(1) }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    // Client Engagement — jobs posted per client, top 5
    const jobsByClient: Record<string, { count: number; name: string }> = {};
    for (const j of jobs) {
      const client = users.find((u) => u.userId === j.clientUserId);
      if (!client) continue;
      const key = j.clientUserId;
      if (!jobsByClient[key]) jobsByClient[key] = { count: 0, name: client.name };
      jobsByClient[key].count += 1;
    }
    const clientEngagement = Object.values(jobsByClient)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Revenue / Commission Insights — assume 10% platform commission on accepted proposals
    const COMMISSION_RATE = 0.1;
    const acceptedProposals = proposals.filter((p) => p.status === "ACCEPTED");
    const totalTransacted = acceptedProposals.reduce((sum, p) => sum + p.bidAmount, 0);
    const commissionEarned = Math.round(totalTransacted * COMMISSION_RATE);

    return {
      userGrowth: Object.entries(userGrowth)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([date, count]) => ({ date: date.slice(5), count })),
      proposalTrends: Object.entries(proposalTrends)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([date, count]) => ({ date: date.slice(5), count })),
      completionRate,
      popularCategories,
      freelancerPerformance,
      clientEngagement,
      revenue: {
        totalTransacted,
        commissionEarned,
        commissionRate: COMMISSION_RATE * 100,
      },
    };
  },
});

export const exportUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("userProfiles").collect();
    return profiles.map((p) => ({
      id: p._id,
      name: p.name,
      role: p.role,
      status: p.status,
      twoFactorEnabled: p.twoFactorEnabled,
      joined: new Date(p._creationTime).toISOString(),
    }));
  },
});