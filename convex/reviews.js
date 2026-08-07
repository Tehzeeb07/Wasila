import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyReviews = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("reviews")
      .withIndex("by_target", (q) => q.eq("targetUserId", userId))
      .order("desc")
      .collect();
  },
});