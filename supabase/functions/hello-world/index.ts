// supabase/functions/hello-world/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

serve((req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    return new Response(
        JSON.stringify({
            message: "👋 Hello from Supabase Edge Function!",
            method: req.method
        }),
        {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            },
            status: 200
        }
    );
});
