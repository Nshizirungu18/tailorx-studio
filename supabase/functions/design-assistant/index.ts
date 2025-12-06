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
    const { prompt, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Chromatique AI, an expert fashion design assistant integrated into a professional design studio. You help designers with:

1. **Color Suggestions**: Recommend Pantone colors, color harmonies, and seasonal palettes that work for specific garments or collections.

2. **Style Recommendations**: Suggest silhouette adjustments, proportions, and design details based on current fashion trends and classic techniques.

3. **Technical Details**: Advise on construction methods, fabric choices, and finishing touches that elevate designs.

4. **Design Tips**: Share professional tips for sketching, rendering fabrics, and presenting designs.

Always respond with 3-5 actionable suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "color" | "style" | "detail" | "tip",
      "title": "Short title (max 5 words)",
      "description": "Concise, actionable advice (max 30 words)"
    }
  ]
}

Current design context: ${context || "General fashion design workspace"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt || "Give me general design suggestions for starting a new fashion collection." },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
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
    const content = data.choices?.[0]?.message?.content;

    // Try to parse JSON from the response
    let suggestions;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      suggestions = JSON.parse(jsonMatch[1] || content);
    } catch {
      // If parsing fails, create a single suggestion from the text
      suggestions = {
        suggestions: [{
          type: "tip",
          title: "Design Insight",
          description: content.slice(0, 150)
        }]
      };
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Design assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
