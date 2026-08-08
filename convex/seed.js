import { mutation } from "./_generated/server";

export const createTestJob = mutation({
  args: {},
  handler: async (ctx) => {
    // Pick any existing user as the client for this test job
    const anyUser = await ctx.db.query("users").first();
    if (!anyUser) throw new Error("No users exist yet — sign up first");

    const jobId = await ctx.db.insert("jobs", {
      clientUserId: anyUser._id,
      title: "Test Job - React Developer Needed",
      description: "This is a test job created for development purposes.",
      budgetMin: 100,
      budgetMax: 500,
      category: "Web Development",
      tags: ["react", "test"],
      skills: ["React", "JavaScript"],
      status: "OPEN",
    });

    return jobId;
  },
});

export const markJobCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").collect();
    if (jobs.length === 0) throw new Error("No jobs found");

    const firstJob = jobs[0];
    await ctx.db.patch(firstJob._id, { status: "COMPLETED" });
    return firstJob._id;
  },
});