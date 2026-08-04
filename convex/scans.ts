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

export const getUserUsage = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const finalUserId = identity?.subject || args.userId;

    if (!finalUserId) {
      return { scansToday: 0, lastScanTimestamp: 0 };
    }

    const record = await ctx.db
      .query("userUsage")
      .withIndex("by_userId", (q: any) => q.eq("userId", finalUserId))
      .first();

    if (!record) {
      return { scansToday: 0, lastScanTimestamp: 0 };
    }

    // Reset if it is a new calendar day in UTC
    const lastDate = new Date(record.lastScanTimestamp);
    const currentDate = new Date();
    const isNewDay =
      lastDate.getUTCDate() !== currentDate.getUTCDate() ||
      lastDate.getUTCMonth() !== currentDate.getUTCMonth() ||
      lastDate.getUTCFullYear() !== currentDate.getUTCFullYear();

    if (isNewDay) {
      return { scansToday: 0, lastScanTimestamp: record.lastScanTimestamp };
    }

    return { scansToday: record.scansToday, lastScanTimestamp: record.lastScanTimestamp };
  },
});

export const checkAndIncrementUsage = mutation({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    const finalUserId = identity?.subject || args.userId;

    if (!finalUserId) {
      throw new Error("User authentication context required to track usage limits");
    }

    const record = await ctx.db
      .query("userUsage")
      .withIndex("by_userId", (q: any) => q.eq("userId", finalUserId))
      .first();

    const now = Date.now();

    if (!record) {
      // First scan ever
      await ctx.db.insert("userUsage", {
        userId: finalUserId,
        scansToday: 1,
        lastScanTimestamp: now,
      });
      return { scansToday: 1, lastScanTimestamp: now };
    }

    const lastDate = new Date(record.lastScanTimestamp);
    const currentDate = new Date(now);
    const isNewDay =
      lastDate.getUTCDate() !== currentDate.getUTCDate() ||
      lastDate.getUTCMonth() !== currentDate.getUTCMonth() ||
      lastDate.getUTCFullYear() !== currentDate.getUTCFullYear();

    let newScansToday = record.scansToday;
    if (isNewDay) {
      newScansToday = 0;
    }

    if (newScansToday >= 5) {
      throw new Error("Daily scan limit reached (5/5). Upgrade to Pro for unlimited scans or check back tomorrow!");
    }

    newScansToday += 1;

    await ctx.db.patch(record._id, {
      scansToday: newScansToday,
      lastScanTimestamp: now,
    });

    return { scansToday: newScansToday, lastScanTimestamp: now };
  },
});
