import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listProblems = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    let problems;
    
    if (args.category) {
      problems = await ctx.db.query("problems")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("asc")
        .collect();
    } else if (args.difficulty) {
      problems = await ctx.db.query("problems")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty!))
        .order("asc")
        .collect();
    } else {
      problems = await ctx.db.query("problems").order("asc").collect();
    }
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      problems = problems.filter(problem => 
        problem.title.toLowerCase().includes(searchLower) ||
        problem.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Get user progress for each problem
    if (userId) {
      const userProgress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      
      const progressMap = new Map(userProgress.map(p => [p.problemId, p.status]));
      
      return problems.map(problem => ({
        ...problem,
        userStatus: progressMap.get(problem._id) || null,
      }));
    }
    
    return problems.map(problem => ({ ...problem, userStatus: null }));
  },
});

export const getProblem = query({
  args: { problemId: v.id("problems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const problem = await ctx.db.get(args.problemId);
    
    if (!problem) return null;
    
    let userStatus = null;
    if (userId) {
      const progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user_and_problem", (q) => 
          q.eq("userId", userId).eq("problemId", args.problemId)
        )
        .unique();
      
      userStatus = progress?.status || null;
    }
    
    return { ...problem, userStatus };
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const problems = await ctx.db.query("problems").collect();
    const categories = [...new Set(problems.map(p => p.category))];
    return categories.sort();
  },
});

export const initializeProblems = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if problems already exist
    const existingProblems = await ctx.db.query("problems").take(1);
    if (existingProblems.length > 0) return;

    const striverProblems = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy" as const,
        category: "Arrays",
        tags: ["Array", "Hash Table"],
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ],
        starterCode: {
          javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
          python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
          java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" },
          { input: "[3,2,4]\n6", expectedOutput: "[1,2]" },
          { input: "[3,3]\n6", expectedOutput: "[0,1]" }
        ],
        striverIndex: 1
      },
      {
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        difficulty: "Easy" as const,
        category: "Arrays",
        tags: ["Array", "Dynamic Programming"],
        examples: [
          {
            input: "prices = [7,1,5,3,6,4]",
            output: "5",
            explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
          }
        ],
        constraints: [
          "1 <= prices.length <= 10^5",
          "0 <= prices[i] <= 10^4"
        ],
        starterCode: {
          javascript: "/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    \n};",
          python: "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        ",
          java: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
          { input: "[7,6,4,3,1]", expectedOutput: "0" }
        ],
        striverIndex: 2
      },
      {
        title: "Contains Duplicate",
        description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        difficulty: "Easy" as const,
        category: "Arrays",
        tags: ["Array", "Hash Table", "Sorting"],
        examples: [
          {
            input: "nums = [1,2,3,1]",
            output: "true"
          },
          {
            input: "nums = [1,2,3,4]",
            output: "false"
          }
        ],
        constraints: [
          "1 <= nums.length <= 10^5",
          "-10^9 <= nums[i] <= 10^9"
        ],
        starterCode: {
          javascript: "/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar containsDuplicate = function(nums) {\n    \n};",
          python: "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        ",
          java: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[1,2,3,1]", expectedOutput: "true" },
          { input: "[1,2,3,4]", expectedOutput: "false" },
          { input: "[1,1,1,3,3,4,3,2,4,2]", expectedOutput: "true" }
        ],
        striverIndex: 3
      },
      {
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA subarray is a contiguous part of an array.",
        difficulty: "Medium" as const,
        category: "Arrays",
        tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
        examples: [
          {
            input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            output: "6",
            explanation: "[4,-1,2,1] has the largest sum = 6."
          }
        ],
        constraints: [
          "1 <= nums.length <= 10^5",
          "-10^4 <= nums[i] <= 10^4"
        ],
        starterCode: {
          javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    \n};",
          python: "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        ",
          java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
          { input: "[1]", expectedOutput: "1" },
          { input: "[5,4,-1,7,8]", expectedOutput: "23" }
        ],
        striverIndex: 4
      },
      {
        title: "Product of Array Except Self",
        description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
        difficulty: "Medium" as const,
        category: "Arrays",
        tags: ["Array", "Prefix Sum"],
        examples: [
          {
            input: "nums = [1,2,3,4]",
            output: "[24,12,8,6]"
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^5",
          "-30 <= nums[i] <= 30",
          "The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer."
        ],
        starterCode: {
          javascript: "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar productExceptSelf = function(nums) {\n    \n};",
          python: "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        ",
          java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" },
          { input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]" }
        ],
        striverIndex: 5
      },
      {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        difficulty: "Easy" as const,
        category: "Stack",
        tags: ["String", "Stack"],
        examples: [
          {
            input: 's = "()"',
            output: "true"
          },
          {
            input: 's = "()[]{}"',
            output: "true"
          },
          {
            input: 's = "(]"',
            output: "false"
          }
        ],
        constraints: [
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'."
        ],
        starterCode: {
          javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};",
          python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        ",
          java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
          cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};"
        },
        testCases: [
          { input: '"()"', expectedOutput: "true" },
          { input: '"()[]{}"', expectedOutput: "true" },
          { input: '"(]"', expectedOutput: "false" }
        ],
        striverIndex: 6
      },
      {
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        difficulty: "Easy" as const,
        category: "Linked List",
        tags: ["Linked List", "Recursion"],
        examples: [
          {
            input: "list1 = [1,2,4], list2 = [1,3,4]",
            output: "[1,1,2,3,4,4]"
          }
        ],
        constraints: [
          "The number of nodes in both lists is in the range [0, 50].",
          "-100 <= Node.val <= 100",
          "Both list1 and list2 are sorted in non-decreasing order."
        ],
        starterCode: {
          javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nvar mergeTwoLists = function(list1, list2) {\n    \n};",
          python: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        ",
          java: "/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\nclass Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}",
          cpp: "/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]" },
          { input: "[]\n[]", expectedOutput: "[]" },
          { input: "[]\n[0]", expectedOutput: "[0]" }
        ],
        striverIndex: 7
      },
      {
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
        difficulty: "Easy" as const,
        category: "Binary Tree",
        tags: ["Stack", "Tree", "Depth-First Search", "Binary Tree"],
        examples: [
          {
            input: "root = [1,null,2,3]",
            output: "[1,3,2]"
          }
        ],
        constraints: [
          "The number of nodes in the tree is in the range [0, 100].",
          "-100 <= Node.val <= 100"
        ],
        starterCode: {
          javascript: "/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number[]}\n */\nvar inorderTraversal = function(root) {\n    \n};",
          python: "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        ",
          java: "/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode() {}\n *     TreeNode(int val) { this.val = val; }\n *     TreeNode(int val, TreeNode left, TreeNode right) {\n *         this.val = val;\n *         this.left = left;\n *         this.right = right;\n *     }\n * }\n */\nclass Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        \n    }\n}",
          cpp: "/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\nclass Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        \n    }\n};"
        },
        testCases: [
          { input: "[1,null,2,3]", expectedOutput: "[1,3,2]" },
          { input: "[]", expectedOutput: "[]" },
          { input: "[1]", expectedOutput: "[1]" }
        ],
        striverIndex: 8
      }
    ];

    for (const problem of striverProblems) {
      await ctx.db.insert("problems", problem);
    }
  },
});
