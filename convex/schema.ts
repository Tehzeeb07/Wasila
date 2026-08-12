import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // authTables provides: users, authSessions, authAccounts, authRefreshTokens, etc.
  ...authTables,

  // Extend the built-in `users` table's data via a separate profile table
  // rather than editing authTables directly.
  userProfiles: defineTable({
  failedLoginCount: v.float64(),
  lastLoginAt: v.optional(v.float64()),
  name: v.string(),
  role: v.union(
    v.literal("ADMIN"),
    v.literal("FREELANCER"),
    v.literal("CLIENT")
  ),
  status: v.union(
    v.literal("PENDING"),
    v.literal("APPROVED"),
    v.literal("SUSPENDED")
  ),
  twoFactorEnabled: v.boolean(),
  twoFactorSecret: v.optional(v.string()),
  userId: v.id("users"),

  email: v.string(), // ← add this
}),

  freelancerProfiles: defineTable({
    userId: v.id("users"),
    headline: v.optional(v.string()),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    resumeFileId: v.optional(v.id("_storage")),
    skills: v.array(v.string()),
  }).index("by_userId", ["userId"]),

  clientProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.optional(v.string()),
    website: v.optional(v.string()),
    bio: v.optional(v.string()),
    logoFileId: v.optional(v.id("_storage")),
  }).index("by_userId", ["userId"]),

  portfolioItems: defineTable({
    freelancerUserId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    imageFileId: v.optional(v.id("_storage")),
    projectUrl: v.optional(v.string()),
  }).index("by_freelancer", ["freelancerUserId"]),

  jobs: defineTable({
    clientUserId: v.id("users"),
    title: v.string(),
    description: v.string(),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    category: v.string(),
    tags: v.array(v.string()),
    skills: v.array(v.string()),
    status: v.union(
      v.literal("OPEN"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETED"),
      v.literal("CANCELLED")
    ),
  })
    .index("by_client", ["clientUserId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .searchIndex("search_title", { searchField: "title" }),

  proposals: defineTable({
    jobId: v.id("jobs"),
    freelancerUserId: v.id("users"),
    coverLetter: v.string(),
    bidAmount: v.number(),
    status: v.union(v.literal("PENDING"), v.literal("ACCEPTED"), v.literal("REJECTED")),
  })
    .index("by_job", ["jobId"])
    .index("by_freelancer", ["freelancerUserId"])
    .index("by_job_and_freelancer", ["jobId", "freelancerUserId"]),

  messages: defineTable({
    jobId: v.id("jobs"),
    senderUserId: v.id("users"),
    content: v.string(),
    fileId: v.optional(v.id("_storage")),
    readBy: v.optional(v.array(v.id("users"))),
  }).index("by_job", ["jobId"]),

  typingIndicators: defineTable({
    jobId: v.id("jobs"),
    userId: v.id("users"),
    updatedAt: v.number(),
  }).index("by_job_and_user", ["jobId", "userId"]),

  reviews: defineTable({
    jobId: v.id("jobs"),
    authorUserId: v.id("users"),
    targetUserId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
  })
    .index("by_job", ["jobId"])
    .index("by_target", ["targetUserId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
  }).index("by_user", ["userId"]).index("by_user_and_job", ["userId", "jobId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    message: v.string(),
    read: v.boolean(),
  }).index("by_user", ["userId"]).index("by_user_and_read", ["userId", "read"]),

  activityLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  auditLogs: defineTable({
    actorUserId: v.id("users"),
    action: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_actor", ["actorUserId"]),

  reports: defineTable({
    authorUserId: v.id("users"),
    targetUserId: v.optional(v.id("users")),
    targetJobId: v.optional(v.id("jobs")),
    reason: v.string(),
    status: v.union(v.literal("PENDING"), v.literal("REVIEWED"), v.literal("DISMISSED")),
  }).index("by_status", ["status"]),
});