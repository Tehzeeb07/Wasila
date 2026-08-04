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

    const [users, jobs, proposals, reports] = await Promise.all([
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("jobs").collect(),
      ctx.db.query("proposals").collect(),
      ctx.db.query("reports").collect(),
    ]);

    const usersByRole = {
      ADMIN: users.filter((u) => u.role === "ADMIN").length,
      FREELANCER: users.filter((u) => u.role === "FREELANCER").length,
      CLIENT: users.filter((u) => u.role === "CLIENT").length,
    };

    const jobsByStatus = {
      OPEN: jobs.filter((j) => j.status === "OPEN").length,
      IN_PROGRESS: jobs.filter((j) => j.status === "IN_PROGRESS").length,
      COMPLETED: jobs.filter((j) => j.status === "COMPLETED").length,
      CANCELLED: jobs.filter((j) => j.status === "CANCELLED").length,
    };

    const proposalsByStatus = {
      PENDING: proposals.filter((p) => p.status === "PENDING").length,
      ACCEPTED: proposals.filter((p) => p.status === "ACCEPTED").length,
      REJECTED: proposals.filter((p) => p.status === "REJECTED").length,
    };

    const now = Date.now();
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
    const recentUsers = users.filter((u) => u._creationTime >= fourteenDaysAgo);
    const signupsByDay: Record<string, number> = {};
    for (const u of recentUsers) {
      const day = new Date(u._creationTime).toISOString().slice(0, 10);
      signupsByDay[day] = (signupsByDay[day] || 0) + 1;
    }

    return {
      totalUsers: users.length,
      totalJobs: jobs.length,
      totalProposals: proposals.length,
      pendingReports: reports.filter((r) => r.status === "PENDING").length,
      usersByRole,
      jobsByStatus,
      proposalsByStatus,
      signupsByDay,
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