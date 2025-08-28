/// <reference types="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, body } = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Missing Twilio credentials");
    }

    const auth = btoa(`${accountSid}:${authToken}`);
    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            To: to,
            From: fromNumber,
            Body: body
          })
        }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Twilio Error Response:", result);
      return new Response(JSON.stringify({ success: false, error: result.message || "Twilio error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      success: true,
      sid: result.sid,
      message: "SMS sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("❌ Exception while sending SMS:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});
