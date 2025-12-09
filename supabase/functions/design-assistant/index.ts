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
    const { prompt, context, mode = "suggest", canvasState } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build comprehensive system prompt for full canvas control
    const systemPrompt = mode === "action" 
      ? `You are Chromatique AI, a professional fashion design assistant with FULL CONTROL over a design canvas. You can CREATE, MODIFY, DELETE, and COLOR any element on the canvas based on user instructions.

## CANVAS CAPABILITIES

### Templates You Can Add (use EXACT IDs):
- a-line-dress: Classic A-line dress silhouette
- tshirt-basic: Basic T-shirt
- blouse: Blouse with collar
- slim-pants: Slim fit pants
- wide-leg: Wide leg trousers
- skirt-a-line: A-line skirt
- blazer: Blazer/jacket
- croquis-front: Fashion figure croquis
- wrap-dress: Wrap style dress
- bag-tote: Tote bag accessory

### Shapes You Can Add:
- rectangle: Rectangular shape
- circle: Circular shape
- line: Straight line
- triangle: Triangle shape

### Garment Regions You Can Fill:
- bodice, sleeves, collar, neckline (for tops/dresses)
- skirt, hem, waistband, train (for dresses/skirts)
- lapel, pocket, cuff, button (for outerwear)
- front-panel, back-panel, side-panel (for structured garments)

### Pantone Colors Available:
- 17-1463 (Tangerine Tango - #E2583E)
- 15-5519 (Emerald - #009473)
- 18-3224 (Radiant Orchid - #AD5E99)
- 18-1438 (Marsala - #955251)
- 15-3919 (Serenity - #91A8D0)
- 13-1520 (Rose Quartz - #F7CAC9)
- 15-0343 (Greenery - #88B04B)
- 18-3838 (Ultra Violet - #6B5B95)
- 16-1546 (Living Coral - #FF6F61)
- 19-4052 (Classic Blue - #0F4C81)
- 17-5104 (Ultimate Gray - #939597)
- 13-0647 (Illuminating Yellow - #F5DF4D)
- 17-3938 (Very Peri - #6667AB)
- 18-1750 (Viva Magenta - #BE3455)
- 13-1023 (Peach Fuzz - #FFBE98)

## ACTIONS YOU CAN PERFORM

1. **CREATE/ADD Elements:**
   - add_template: Add a garment template to the canvas
   - add_shape: Add geometric shapes
   - add_text: Add text labels/annotations
   - add_pattern: Apply pattern/texture overlays

2. **MODIFY/UPDATE Elements:**
   - update_color: Change the color of an element or region
   - update_size: Resize an element (scale percentage)
   - update_position: Move an element
   - update_style: Change stroke, opacity, etc.
   - transform_element: Rotate, flip, or skew

3. **DELETE/REMOVE Elements:**
   - delete_element: Remove a specific element
   - delete_selected: Remove currently selected element
   - clear_canvas: Clear entire canvas

4. **COLOR Operations:**
   - fill_region: Fill a garment region with color
   - apply_gradient: Apply gradient fill
   - change_background: Change canvas background

## RESPONSE RULES

- Generate MULTIPLE actions when needed to complete complex requests
- Use Pantone codes when colors are requested professionally
- Be CREATIVE but precise with color choices
- Always explain what you're doing in the explanation field
- For ambiguous requests, make sensible design choices
- When creating new designs, start with a template then add colors
- For fill_region actions, use the region ID as the target (e.g., "bodice", "skirt", "left-sleeve")
- If the user asks to color a region, just specify the region name in target - the system will find the correct template

## CURRENT CANVAS STATE
${canvasState ? `
Templates on canvas: ${canvasState.templates?.length > 0 
  ? canvasState.templates.map((t: { instanceId: string; templateType: string; regions: string[] }) => 
      `\n  - Instance: ${t.instanceId}, Type: ${t.templateType}, Regions: [${t.regions.join(', ')}]`
    ).join('')
  : 'None - add a template first'}
Selected region: ${canvasState.selectedRegion || 'None'}
Current tool: ${canvasState.currentTool || 'select'}
Stage: ${canvasState.stage || 'sketch'}` 
  : "Empty canvas - ready for design"}

## CONTEXT
${context || "Fresh design session"}`
      : `You are Chromatique AI, an expert fashion design assistant. Provide creative, actionable design suggestions.

Categories of advice:
1. **Color**: Pantone recommendations, color harmonies, seasonal palettes
2. **Style**: Silhouettes, proportions, design details
3. **Detail**: Construction, fabric choices, finishing touches
4. **Tip**: Professional techniques and presentation advice

Current context: ${context || "General fashion design workspace"}`;

    // Build request body
    const body: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt || "Give me design suggestions." },
      ],
    };

    // Enhanced tool calling for action mode with full canvas control
    if (mode === "action") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "execute_canvas_actions",
            description: "Execute one or more actions on the design canvas to create, modify, delete, or color elements",
            parameters: {
              type: "object",
              properties: {
                actions: {
                  type: "array",
                  description: "List of actions to execute on the canvas in sequence",
                  items: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: [
                          "add_template", "add_shape", "add_text", "add_pattern",
                          "fill_region", "update_color", "update_size", "update_position", "update_style",
                          "delete_element", "delete_selected", "clear_canvas",
                          "apply_gradient", "change_background", "transform_element"
                        ],
                        description: "The type of action to perform on the canvas"
                      },
                      target: {
                        type: "string",
                        description: "Target element, region, or 'selected' for current selection, 'all' for everything"
                      },
                      params: {
                        type: "object",
                        properties: {
                          templateId: { 
                            type: "string", 
                            enum: ["a-line-dress", "tshirt-basic", "blouse", "slim-pants", "wide-leg", "skirt-a-line", "blazer", "croquis-front", "wrap-dress", "bag-tote"],
                            description: "Template ID for add_template action"
                          },
                          shapeType: { 
                            type: "string", 
                            enum: ["rectangle", "circle", "line", "triangle"],
                            description: "Shape type for add_shape action"
                          },
                          text: { type: "string", description: "Text content for add_text action" },
                          color: { type: "string", description: "Hex color value (e.g., #FF6F61)" },
                          pantoneCode: { 
                            type: "string", 
                            description: "Pantone color code (e.g., 16-1546 for Living Coral)" 
                          },
                          pattern: { 
                            type: "string", 
                            enum: ["floral", "stripes", "dots", "geometric", "lace", "plaid", "houndstooth", "paisley"],
                            description: "Pattern type for add_pattern action"
                          },
                          size: { 
                            type: "number", 
                            description: "Size as percentage (100 = original, 150 = 50% larger)" 
                          },
                          width: { type: "number", description: "Width in pixels" },
                          height: { type: "number", description: "Height in pixels" },
                          position: { 
                            type: "object",
                            properties: { 
                              x: { type: "number", description: "X coordinate" }, 
                              y: { type: "number", description: "Y coordinate" } 
                            }
                          },
                          rotation: { type: "number", description: "Rotation angle in degrees" },
                          opacity: { type: "number", description: "Opacity from 0 to 100" },
                          strokeColor: { type: "string", description: "Stroke/outline color" },
                          strokeWidth: { type: "number", description: "Stroke width in pixels" },
                          gradient: {
                            type: "object",
                            properties: {
                              startColor: { type: "string" },
                              endColor: { type: "string" },
                              direction: { type: "string", enum: ["horizontal", "vertical", "diagonal"] }
                            }
                          },
                          backgroundColor: { type: "string", description: "Canvas background color" },
                          flip: { type: "string", enum: ["horizontal", "vertical"] }
                        }
                      }
                    },
                    required: ["type"]
                  }
                },
                explanation: {
                  type: "string",
                  description: "Clear, concise explanation of what the actions will accomplish for the design"
                }
              },
              required: ["actions", "explanation"]
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "execute_canvas_actions" } };
    } else {
      // Suggestion mode
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

    console.log("Calling AI gateway with mode:", mode, "prompt:", prompt);

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
    console.log("AI response received");

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      console.log("Parsed actions:", JSON.stringify(result, null, 2));
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
