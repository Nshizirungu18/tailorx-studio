import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sketchBase64, fabricType, lightingStyle, detailLevel, additionalNotes } = await req.json();

    if (!sketchBase64) {
      return new Response(
        JSON.stringify({ error: "Sketch image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt based on settings
    const fabricDesc = fabricType || "cotton";
    const lightingDesc = lightingStyle || "natural studio lighting";
    const detailDesc = detailLevel >= 80 ? "highly detailed, intricate textures" : 
                       detailLevel >= 50 ? "well-defined details" : "clean and simple";
    
    const prompt = `You are a fashion product photographer. Convert the provided fashion sketch into a single photorealistic studio product photo.

Requirements:
- Keep the exact silhouette, seams, panels, and design lines from the sketch (do not redesign).
- Photorealistic fabric: ${fabricDesc} with believable weave, folds, stitching, and drape.
- Lighting: ${lightingDesc} with professional studio softboxes, accurate shadows and highlights.
- Detail: ${detailDesc}
${additionalNotes ? `- Notes: ${additionalNotes}` : ""}

Output:
- A clean, high-end catalog photo on a neutral background (no text, no watermark, no collage).
- Target image size ~1024px on the longest side.`;

    console.log("Generating fashion image with prompt:", prompt.substring(0, 100) + "...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: sketchBase64 } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);

      if (response.status === 429) {
        // Parse retry-after header if available
        const retryAfter = response.headers.get("retry-after");
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 15;
        
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please wait before trying again.",
            retryAfterSeconds 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to generate image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received successfully");

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = data.choices?.[0]?.message?.content;

    if (!generatedImage) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: "No image was generated. Please try again with a different sketch." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        image: generatedImage,
        description: description || "Fashion design generated successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate fashion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
