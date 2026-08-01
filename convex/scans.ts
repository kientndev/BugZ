import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveScan = mutation({
  args: {
    userId: v.optional(v.string()),
    input: v.string(),
    inputType: v.string(),
    results: v.any(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const finalUserId = identity?.subject || args.userId;

    if (!finalUserId) {
      console.error("[Convex saveScan] No user ID provided.");
      return null;
    }

    return await ctx.db.insert("scans", {
      userId: finalUserId,
      input: args.input,
      inputType: args.inputType,
      results: args.results,
      createdAt: Date.now(),
    });
  },
});

export const getMyScans = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const finalUserId = identity?.subject || args.userId;

    if (!finalUserId) {
      return [];
    }
    
    return await ctx.db
      .query("scans")
      .withIndex("by_user", (q: any) => q.eq("userId", finalUserId))
      .order("desc")
      .collect();
  },
});

export const getScanById = query({
  args: { id: v.id("scans") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getScanById");
    }

    const scan = await ctx.db.get(args.id);
    if (!scan) return null;

    if (scan.userId !== identity.subject) {
      throw new Error("Unauthorized access to scan report");
    }

    return scan;
  },
});
