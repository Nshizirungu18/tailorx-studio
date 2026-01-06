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
    const { sketchImage, prompt, referenceStrength, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!sketchImage) {
      throw new Error("Sketch image is required");
    }

    // Build the rendering prompt based on user input and style
    const styleDescriptions: Record<string, string> = {
      photorealistic: "ultra-realistic fashion photography, studio lighting, high-end editorial",
      editorial: "high fashion editorial, dramatic lighting, Vogue-style photography",
      illustration: "fashion illustration style, artistic rendering, watercolor effects",
      streetwear: "urban streetwear photography, natural lighting, lifestyle shot",
      couture: "haute couture, luxury fashion, glamorous, runway presentation",
      minimalist: "clean minimal aesthetic, neutral tones, contemporary fashion",
    };

    const selectedStyle = styleDescriptions[style] || styleDescriptions.photorealistic;
    
    // Adjust prompt based on reference strength
    const strengthDescription = referenceStrength > 70 
      ? "strictly following the exact design, silhouette, and proportions from the reference sketch"
      : referenceStrength > 40
      ? "closely following the design while adding realistic details and textures"
      : "inspired by the sketch concept, with creative interpretation";

    const fullPrompt = `Transform this fashion sketch into a high-fidelity photorealistic render. ${strengthDescription}. Style: ${selectedStyle}. ${prompt || "A mannequin or model in a clean studio, product-style fashion photo."}. No text, no watermark. Target ~1024px on the longest side.`;

    console.log("Generating render with prompt:", fullPrompt);

    // Call the image generation model
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
              {
                type: "text",
                text: fullPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: sketchImage,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
       if (response.status === 429) {
         const retryAfter = response.headers.get("retry-after");
         const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 15;
         return new Response(
           JSON.stringify({
             error: "Rate limit exceeded. Please wait before trying again.",
             retryAfterSeconds,
           }),
           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the generated image
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!generatedImage) {
      throw new Error("No image was generated");
    }

    return new Response(
      JSON.stringify({
        image: generatedImage,
        description: textContent,
        style: style,
        prompt: fullPrompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sketch to render error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
