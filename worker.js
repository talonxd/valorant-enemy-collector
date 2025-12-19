export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
          "Access-Control-Allow-Methods": "POST, GET"
        }
      });
    }

    if (req.method === "POST") {
      const key = req.headers.get("x-api-key");
      if (key !== env.API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await req.json();
      const { matchUrl, messages } = body;

      if (!Array.isArray(messages)) {
        return new Response("Invalid payload", { status: 400 });
      }

      const stored = (await env.DATA.get("messages", { type: "json" })) || [];
      const updated = [...stored, ...messages];

      await env.DATA.put("messages", JSON.stringify(updated));

      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (req.method === "GET") {
      const data = (await env.DATA.get("messages", { type: "json" })) || [];
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
