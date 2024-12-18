import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), //clerk id
    email: v.string(), //
    name: v.string(), //
    isPro: v.boolean(), //
    proSince: v.optional(v.number()), //
    lemonSqueezeCustomerId: v.optional(v.string()), //
    lemonSqueezeOrderId: v.optional(v.string()), //
  }).index("by_user_id", ["userId"]),

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(), // store user's name for easy access
  }).index("by_user_id", ["userId"]),

  snippetComments: defineTable({
    snippetsId: v.id("snippets"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(), // this will store HTML content
  }).index("by_snippet_id", ["snippetsId"]),

  stars: defineTable({
    userId: v.id("users"),
    snippetsId: v.id("snippets"),
  })
    .index("by_user_id", ["userId"])
    .index("by_snippet_id", ["snippetsId"])
    .index("by_snippet_id_and_user_id", ["snippetsId", "userId"]),
});
 