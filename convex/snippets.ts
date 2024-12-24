import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSnippet = mutation({
  args: {
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return new Error("User not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((e) => e.eq(e.field("userId"), identity.subject))
      .first();

    if (!user) return new Error("User not found");

    const snippetId = await ctx.db.insert("snippets", {
      userId: identity.subject,
      language: args.language,
      code: args.code,
      title: args.title,
      userName: user.name,
    });

    return snippetId;
  },
});

export const getSnippets = query({
  handler: async (ctx) => {
    const snippets = await ctx.db.query("snippets").order("desc").collect();
    return snippets;
  },
});

export const isSnippetStarred = query({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const star = ctx.db
      .query("stars")
      .withIndex("by_snippet_id_and_user_id")
      .filter(
        (e) =>
          e.eq(e.field("userId"), identity.subject) &&
          e.eq(e.field("snippetsId"), args.snippetId)
      )
      .first();
    // star is a string so we are converting it to boolean value.
    return !!star;
  },
});

export const getSnippetStarCount = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetsId"), args.snippetId))
      .collect();

    return stars.length;
  },
});

export const deleteSnippet = mutation({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("Snippet not found");

    if (snippet.userId === identity.subject) {
      throw new Error("Not authorized to delete this snippet");
    }

    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetsId"), args.snippetId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetsId"), args.snippetId))
      .collect();
    for (const star of stars) {
      await ctx.db.delete(star._id);
    }

    await ctx.db.delete(args.snippetId);
  },
});

export const starSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id_and_user_id")
      .filter(
        (q) =>
          q.eq(q.field("userId"), identity.subject) &&
          q.eq(q.field("snippetsId"), args.snippetId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("stars", {
        userId: identity.subject,
        snippetsId: args.snippetId,
      });
    }
  },
});