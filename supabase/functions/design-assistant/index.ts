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
    const { prompt, context, mode = "suggest" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on mode
    const systemPrompt = mode === "action" 
      ? `You are Chromatique AI, a fashion design assistant with DIRECT CONTROL over a design canvas. You can execute actions on the canvas based on user instructions.

Available garment parts you can reference:
- bodice, sleeves, collar, neckline (for tops/dresses)
- skirt, hem, waistband (for dresses/skirts)
- lapel, pocket, cuff (for outerwear)
- entire garment (for whole-piece actions)

You can perform these actions:
1. ADD elements: templates, shapes, text, patterns
2. DELETE elements: remove selected or specified elements
3. UPDATE elements: change color, size, position, style
4. FILL regions: apply colors to garment parts

When users give instructions like:
- "Add a floral pattern to the skirt" → add_pattern action
- "Change bodice to Pantone 17-1463" → fill_region action
- "Delete the sleeve" → delete_element action
- "Make the dress wider" → update_element action

Always respond with specific, executable actions. Be creative but precise.

Current canvas context: ${context || "Empty canvas"}` 
      : `You are Chromatique AI, an expert fashion design assistant integrated into a professional design studio. You help designers with:

1. **Color Suggestions**: Recommend Pantone colors, color harmonies, and seasonal palettes.
2. **Style Recommendations**: Suggest silhouette adjustments, proportions, and design details.
3. **Technical Details**: Advise on construction methods, fabric choices, and finishing touches.
4. **Design Tips**: Share professional tips for sketching, rendering fabrics, and presenting designs.

Always respond with 3-5 actionable suggestions.

Current design context: ${context || "General fashion design workspace"}`;

    // Build request body
    const body: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt || "Give me general design suggestions." },
      ],
    };

    // Add tool calling for action mode
    if (mode === "action") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "execute_canvas_actions",
            description: "Execute one or more actions on the design canvas",
            parameters: {
              type: "object",
              properties: {
                actions: {
                  type: "array",
                  description: "List of actions to execute on the canvas",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["add_template", "add_shape", "add_text", "add_pattern", "fill_region", "update_element", "delete_element", "clear_canvas"],
                        description: "The type of action to perform"
                      },
                      target: {
                        type: "string",
                        description: "Target element or region (e.g., 'bodice', 'sleeves', 'selected', 'all')"
                      },
                      params: {
                        type: "object",
                        properties: {
                          templateId: { type: "string", description: "Template ID for add_template" },
                          shapeType: { type: "string", enum: ["rectangle", "circle", "line"] },
                          text: { type: "string", description: "Text content for add_text" },
                          color: { type: "string", description: "Color value (hex or Pantone name)" },
                          pantoneCode: { type: "string", description: "Pantone color code" },
                          pattern: { type: "string", enum: ["floral", "stripes", "dots", "geometric", "lace", "plaid"] },
                          size: { type: "number", description: "Size adjustment percentage" },
                          position: { 
                            type: "object",
                            properties: { x: { type: "number" }, y: { type: "number" } }
                          }
                        }
                      },
                      preview: {
                        type: "boolean",
                        description: "If true, show preview before applying"
                      }
                    },
                    required: ["type"]
                  }
                },
                explanation: {
                  type: "string",
                  description: "Brief explanation of what the actions will do"
                }
              },
              required: ["actions", "explanation"]
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "execute_canvas_actions" } };
    } else {
      // Suggestion mode - use structured output
      body.tools = [
        {
          type: "function",
          function: {
            name: "provide_suggestions",
            description: "Provide design suggestions to the user",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["color", "style", "detail", "tip"] },
                      title: { type: "string", description: "Short title (max 5 words)" },
                      description: { type: "string", description: "Actionable advice (max 30 words)" }
                    },
                    required: ["type", "title", "description"]
                  }
                }
              },
              required: ["suggestions"]
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "provide_suggestions" } };
    }

    console.log("Calling AI gateway with mode:", mode);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: parse from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        const parsed = JSON.parse(jsonMatch[1] || content);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({
          suggestions: [{
            type: "tip",
            title: "Design Insight",
            description: content.slice(0, 150)
          }]
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("Design assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
