import { action, mutation, query } from "./_generated/server";
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

export const analyzeDiff = action({
  args: {
    diff: v.string(),
    repository: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured on the Convex backend.");
    }

    const systemPrompt = `You are BugZ, an autonomous security agent auditing a git diff payload.
Analyze the added lines (prefixed with '+') in the provided git diff for security vulnerabilities (e.g., OWASP Top 10, secrets leaks, SQL/NoSQL injection, insecure settings, CSRF, broken access control).
Do not flag issues in deleted lines (prefixed with '-') or unchanged lines.

You MUST respond with a valid JSON object adhering to this schema:
{
  "hasVulnerabilities": boolean,
  "vulnerabilities": [
    {
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "name": "Vulnerability Name",
      "explanation": "Clear explanation of the risk and how it maps to OWASP.",
      "vulnerableCode": "The bad snippet line(s)",
      "secureCode": "The patched secure line(s)",
      "filePath": "Relative path of the file being changed"
    }
  ],
  "patch": "A standard Unified Git Diff patch string repairing all vulnerabilities detected in the added lines. Must start with standard diff headers (e.g., '--- a/path/to/file' and '+++ b/path/to/file') and use standard '+' and '-' lines representing the fix."
}

If no security vulnerabilities are found in the added lines, return strictly:
{
  "hasVulnerabilities": false,
  "vulnerabilities": [],
  "patch": ""
}
Do not include markdown formatting or wrap the JSON response in code blocks. Return strictly valid JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Audit this git diff:\n\n${args.diff}` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              hasVulnerabilities: { type: "BOOLEAN" },
              vulnerabilities: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    severity: { type: "STRING" },
                    name: { type: "STRING" },
                    explanation: { type: "STRING" },
                    vulnerableCode: { type: "STRING" },
                    secureCode: { type: "STRING" },
                    filePath: { type: "STRING" }
                  },
                  required: ["severity", "name", "explanation", "vulnerableCode", "secureCode", "filePath"]
                }
              },
              patch: { type: "STRING" }
            },
            required: ["hasVulnerabilities", "vulnerabilities", "patch"]
          },
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { hasVulnerabilities: false, vulnerabilities: [], patch: "" };
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini JSON response:", text);
      return { hasVulnerabilities: false, vulnerabilities: [], patch: "" };
    }
  }
});
