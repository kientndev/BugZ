import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scans: defineTable({
    userId: v.string(),
    input: v.string(),
    inputType: v.string(),
    results: v.any(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  userUsage: defineTable({
    userId: v.string(),
    scansToday: v.number(),
    lastScanTimestamp: v.number(),
  }).index("by_userId", ["userId"]),
});
