import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  problems: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    tags: v.array(v.string()),
    examples: v.array(v.object({
      input: v.string(),
      output: v.string(),
      explanation: v.optional(v.string()),
    })),
    constraints: v.array(v.string()),
    starterCode: v.object({
      javascript: v.string(),
      python: v.string(),
      java: v.string(),
      cpp: v.string(),
    }),
    testCases: v.array(v.object({
      input: v.string(),
      expectedOutput: v.string(),
    })),
    striverIndex: v.number(),
  }).index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_striver_index", ["striverIndex"]),

  submissions: defineTable({
    userId: v.id("users"),
    problemId: v.id("problems"),
    code: v.string(),
    language: v.string(),
    status: v.union(v.literal("Accepted"), v.literal("Wrong Answer"), v.literal("Runtime Error"), v.literal("Time Limit Exceeded")),
    testCasesPassed: v.number(),
    totalTestCases: v.number(),
    submittedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_problem", ["problemId"])
    .index("by_user_and_problem", ["userId", "problemId"]),

  userProgress: defineTable({
    userId: v.id("users"),
    problemId: v.id("problems"),
    status: v.union(v.literal("solved"), v.literal("attempted")),
    lastAttempted: v.number(),
    bestSubmissionId: v.optional(v.id("submissions")),
  }).index("by_user", ["userId"])
    .index("by_user_and_problem", ["userId", "problemId"]),

  userStats: defineTable({
    userId: v.id("users"),
    totalSolved: v.number(),
    easySolved: v.number(),
    mediumSolved: v.number(),
    hardSolved: v.number(),
    currentStreak: v.number(),
    maxStreak: v.number(),
    lastSolvedDate: v.optional(v.number()),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
