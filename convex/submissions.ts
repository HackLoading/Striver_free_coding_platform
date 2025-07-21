import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const submitCode = mutation({
  args: {
    problemId: v.id("problems"),
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be logged in to submit");

    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new Error("Problem not found");

    // Simple test case evaluation (in a real system, this would run in a sandbox)
    const testResults = evaluateCode(args.code, problem.testCases, args.language);
    
    const submission = await ctx.db.insert("submissions", {
      userId,
      problemId: args.problemId,
      code: args.code,
      language: args.language,
      status: testResults.status as "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded",
      testCasesPassed: testResults.passed,
      totalTestCases: problem.testCases.length,
      submittedAt: Date.now(),
    });

    // Update user progress
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user_and_problem", (q) => 
        q.eq("userId", userId).eq("problemId", args.problemId)
      )
      .unique();

    const newStatus = testResults.status === "Accepted" ? "solved" : "attempted";

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        status: testResults.status === "Accepted" ? "solved" : existingProgress.status,
        lastAttempted: Date.now(),
        bestSubmissionId: testResults.status === "Accepted" ? submission : existingProgress.bestSubmissionId,
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId,
        problemId: args.problemId,
        status: newStatus,
        lastAttempted: Date.now(),
        bestSubmissionId: testResults.status === "Accepted" ? submission : undefined,
      });
    }

    // Update user stats if problem was solved
    if (testResults.status === "Accepted") {
      await updateUserStats(ctx, userId, problem.difficulty);
    }

    return {
      submissionId: submission,
      status: testResults.status,
      testCasesPassed: testResults.passed,
      totalTestCases: problem.testCases.length,
      details: testResults.details,
    };
  },
});

export const getSubmissions = query({
  args: { problemId: v.optional(v.id("problems")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.problemId) {
      return await ctx.db.query("submissions")
        .withIndex("by_user_and_problem", (q) => 
          q.eq("userId", userId).eq("problemId", args.problemId!)
        )
        .order("desc")
        .take(50);
    }

    return await ctx.db.query("submissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

async function updateUserStats(ctx: MutationCtx, userId: Id<"users">, difficulty: string) {
  const existingStats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  const today = new Date().toDateString();
  const lastSolvedDate = existingStats?.lastSolvedDate 
    ? new Date(existingStats.lastSolvedDate).toDateString()
    : null;

  let newStreak = 1;
  if (existingStats) {
    if (lastSolvedDate === today) {
      // Already solved something today, don't update streak
      return;
    } else if (lastSolvedDate === new Date(Date.now() - 86400000).toDateString()) {
      // Solved yesterday, continue streak
      newStreak = existingStats.currentStreak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
  }

  if (existingStats) {
    const updates: any = {
      totalSolved: existingStats.totalSolved + 1,
      currentStreak: newStreak,
      maxStreak: Math.max(existingStats.maxStreak, newStreak),
      lastSolvedDate: Date.now(),
    };

    if (difficulty === "Easy") updates.easySolved = existingStats.easySolved + 1;
    else if (difficulty === "Medium") updates.mediumSolved = existingStats.mediumSolved + 1;
    else if (difficulty === "Hard") updates.hardSolved = existingStats.hardSolved + 1;

    await ctx.db.patch(existingStats._id, updates);
  } else {
    await ctx.db.insert("userStats", {
      userId,
      totalSolved: 1,
      easySolved: difficulty === "Easy" ? 1 : 0,
      mediumSolved: difficulty === "Medium" ? 1 : 0,
      hardSolved: difficulty === "Hard" ? 1 : 0,
      currentStreak: 1,
      maxStreak: 1,
      lastSolvedDate: Date.now(),
    });
  }
}

// Simple code evaluation (in production, this would use a secure sandbox)
function evaluateCode(code: string, testCases: any[], language: string) {
  try {
    let passed = 0;
    const details = [];

    for (const testCase of testCases) {
      try {
        // This is a simplified evaluation - in production you'd use a secure sandbox
        const result = runTestCase(code, testCase.input, language);
        const isCorrect = result.trim() === testCase.expectedOutput.trim();
        
        if (isCorrect) passed++;
        
        details.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: result,
          passed: isCorrect,
        });
      } catch (error) {
        details.push({
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: "Runtime Error",
          passed: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      status: passed === testCases.length ? "Accepted" : "Wrong Answer",
      passed,
      details,
    };
  } catch (error) {
    return {
      status: "Runtime Error",
      passed: 0,
      details: [{ error: error instanceof Error ? error.message : "Unknown error" }],
    };
  }
}

function runTestCase(code: string, input: string, language: string): string {
  // This is a mock implementation - in production, you'd run this in a secure sandbox
  // For now, we'll just return mock results based on the problem
  
  if (code.includes("twoSum")) {
    const lines = input.split('\n');
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1]);
    
    // Simple two sum implementation for testing
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        if (nums[i] + nums[j] === target) {
          return JSON.stringify([i, j]);
        }
      }
    }
  }
  
  // Mock other test cases
  return "[]";
}
