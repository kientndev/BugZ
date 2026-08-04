import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const joinWaitlist = mutation({
  args: { email: v.string() },
  handler: async (ctx: any, args: any) => {
    const email = args.email.trim().toLowerCase();
    if (!email) {
      throw new Error("Email address is required");
    }

    // Check if already in waitlist
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();

    if (existing) {
      return { success: true, message: "Already registered" };
    }

    await ctx.db.insert("waitlist", {
      email,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const submitContactMessage = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    inquiryType: v.string(),
    message: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const name = args.name.trim();
    const email = args.email.trim();
    const message = args.message.trim();

    if (!name || !email || !message) {
      throw new Error("All fields are required");
    }

    await ctx.db.insert("contactMessages", {
      name,
      email,
      inquiryType: args.inquiryType,
      message,
      sentAt: Date.now(),
    });

    return { success: true };
  },
});
