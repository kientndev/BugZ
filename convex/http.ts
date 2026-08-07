import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/api/scan-diff",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKeyHeader = request.headers.get("x-bugz-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
    const expectedKey = process.env.BUGZ_API_KEY;

    // Optional Auth check if key is set in Convex env
    if (expectedKey && apiKeyHeader !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid API key" }), {
        status: 401,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, x-bugz-api-key, Authorization",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    }

    try {
      const body = await request.json();
      const { diff, repository, prNumber } = body;

      if (!diff || typeof diff !== "string") {
        return new Response(JSON.stringify({ error: "Missing or invalid 'diff' payload" }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, x-bugz-api-key, Authorization",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
        });
      }

      // Size Guard: Max 50KB diff to prevent token overload
      if (diff.length > 50000) {
        return new Response(
          JSON.stringify({ error: "Diff payload exceeds 50KB safety limit." }),
          { 
            status: 400, 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type, x-bugz-api-key, Authorization",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
            } 
          }
        );
      }

      // Run Gemini Security Pipeline on raw diff
      const result = await ctx.runAction(api.scans.analyzeDiff, {
        diff,
        repository: repository || "CLI/GitHub-Action",
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, x-bugz-api-key, Authorization",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: "Malformed JSON payload" }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, x-bugz-api-key, Authorization",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
    }
  }),
});

// OPTIONS pre-flight endpoint for CORS requests from outside domains
http.route({
  path: "/api/scan-diff",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-bugz-api-key, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
