import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!stats) {
      return {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        currentStreak: 0,
        maxStreak: 0,
      };
    }

    return stats;
  },
});

export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get problem details for each progress entry
    const progressWithProblems = await Promise.all(
      progress.map(async (p) => {
        const problem = await ctx.db.get(p.problemId);
        return {
          ...p,
          problem: problem ? {
            title: problem.title,
            difficulty: problem.difficulty,
            category: problem.category,
          } : null,
        };
      })
    );

    return progressWithProblems.filter(p => p.problem !== null);
  },
});
