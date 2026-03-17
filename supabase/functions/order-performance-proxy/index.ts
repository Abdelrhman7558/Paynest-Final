import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const N8N_WEBHOOK_URL = "https://n8n.srv1181726.hstgr.cloud/webhook/ads-perfomance";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        console.log("📤 Proxying to n8n Order-performance:", JSON.stringify(body));

        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        console.log("📥 n8n response status:", n8nResponse.status);

        const responseText = await n8nResponse.text();
        console.log("📥 n8n response body:", responseText);

        // Try to parse as JSON
        let n8nData;
        try {
            n8nData = JSON.parse(responseText);
        } catch {
            n8nData = [];
        }

        return new Response(JSON.stringify(n8nData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("❌ Proxy error:", error);
        return new Response(
            JSON.stringify([]),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
