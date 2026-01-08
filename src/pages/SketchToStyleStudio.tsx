import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Eraser, Pencil, Trash2, Wand2, Download, RefreshCw, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { StyleControls, StyleSettings } from "@/components/sketch-to-style/StyleControls";
import { BackendStatusBanner } from "@/components/sketch-to-style/BackendStatusBanner";
import { useGenerationCooldown } from "@/hooks/useGenerationCooldown";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as fabric from "fabric";

const defaultSettings: StyleSettings = {
  fabricType: "cotton",
  lightingStyle: "natural studio",
  detailLevel: 70,
  additionalNotes: "",
};

export default function SketchToStyleStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cooldownRemaining, isOnCooldown, startCooldown } = useGenerationCooldown();
  const { isHealthy, error: healthError, recheckHealth } = useBackendHealth();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#ffffff",
      width: 400,
      height: 400,
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "#000000";
    canvas.freeDrawingBrush.width = brushSize;

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Update brush settings
  useEffect(() => {
    if (!fabricRef.current?.freeDrawingBrush) return;
    
    fabricRef.current.freeDrawingBrush.width = brushSize;
    fabricRef.current.freeDrawingBrush.color = isEraser ? "#ffffff" : "#000000";
  }, [brushSize, isEraser]);

  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = "#ffffff";
    fabricRef.current.renderAll();
    setGeneratedImage(null);
    setError(null);
  }, []);

  const getCanvasDataUrl = useCallback((): string | null => {
    if (!fabricRef.current) return null;
    return fabricRef.current.toDataURL({ format: "jpeg", quality: 0.85, multiplier: 1 });
  }, []);

  const handleGenerate = useCallback(async () => {
    const sketchImage = getCanvasDataUrl();
    if (!sketchImage) {
      toast.error("Canvas is empty");
      return;
    }

    if (isGenerating || isOnCooldown) return;

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError, response: fnResponse } = await supabase.functions.invoke(
        "generate-fashion",
        {
          body: {
            sketchBase64: sketchImage,
            fabricType: settings.fabricType,
            lightingStyle: settings.lightingStyle,
            detailLevel: settings.detailLevel,
            additionalNotes: settings.additionalNotes,
          },
        }
      );

      if (fnError) {
        if (fnError.name === "FunctionsHttpError" && fnResponse) {
          const status = fnResponse.status;
          const contentType = fnResponse.headers.get("content-type") ?? "";
          const payload = contentType.includes("application/json")
            ? await fnResponse.clone().json().catch(() => null)
            : null;

          const serverError = payload?.error as string | undefined;
          const retryAfterSeconds =
            typeof payload?.retryAfterSeconds === "number" ? (payload.retryAfterSeconds as number) : undefined;

          if (status === 429) {
            const wait = retryAfterSeconds ?? 15;
            const msg = serverError ?? `Rate limited. Please wait ${wait} seconds.`;
            startCooldown(wait);
            setError(msg);
            toast.error(msg);
            return;
          }

          if (status === 503) {
            throw new Error(
              serverError ??
                "The backend is currently paused/unavailable. Please resume it and try again."
            );
          }

          throw new Error(serverError ?? `Generation failed (status ${status}). Please try again.`);
        }

        if (fnError.name === "FunctionsFetchError") {
          throw new Error(
            "Cannot reach the generation service. Please check your internet/VPN/firewall and try again."
          );
        }

        if (fnError.name === "FunctionsRelayError") {
          throw new Error("Generation service is temporarily unavailable. Please try again shortly.");
        }

        throw new Error(fnError.message || "Failed to generate image");
      }

      if (data?.error) {
        if (data.retryAfterSeconds) {
          startCooldown(data.retryAfterSeconds);
          toast.error(`Rate limited. Please wait ${data.retryAfterSeconds} seconds.`);
        } else {
          toast.error(data.error);
        }
        setError(data.error);
        return;
      }

      if (data?.image) {
        setGeneratedImage(data.image);
        toast.success("Design generated successfully!");
        startCooldown(10);
      } else {
        throw new Error("No image was generated. Please try a different sketch.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      let message = "Generation failed. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("Failed to send")) {
          message = "Unable to connect to AI service. The service may be temporarily unavailable. Please try again in a moment.";
        } else if (err.message.includes("FunctionsFetchError")) {
          message = "Network error connecting to AI service. Please check your connection and try again.";
        } else {
          message = err.message;
        }
      }
      setError(message);
      toast.error(message);
      startCooldown(15);
    } finally {
      setIsGenerating(false);
    }
  }, [settings, isGenerating, isOnCooldown, startCooldown, getCanvasDataUrl]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `fashion-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  return (
    <Layout>
      <Helmet>
        <title>Studio Mode - Sketch to Style | TailorX</title>
        <meta 
          name="description" 
          content="Draw your fashion sketches directly in the browser and transform them into photorealistic garment images using AI." 
        />
      </Helmet>

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/sketch-to-style">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Studio Mode
              </h1>
              <p className="text-muted-foreground">
                Draw your sketch directly and generate designs
              </p>
            </div>
          </div>

          {/* Backend Status Banner */}
          <BackendStatusBanner
            isHealthy={isHealthy}
            error={healthError}
            onRetry={recheckHealth}
          />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Drawing Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Drawing Canvas</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isEraser ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => setIsEraser(false)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isEraser ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setIsEraser(true)}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Brush Size */}
              <div className="flex items-center gap-4">
                <Label className="w-24">Brush Size</Label>
                <Slider
                  value={[brushSize]}
                  onValueChange={([v]) => setBrushSize(v)}
                  min={1}
                  max={30}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-8">{brushSize}px</span>
              </div>

              {/* Canvas Container */}
              <div className="flex justify-center">
                <div className="border-2 border-border rounded-xl overflow-hidden bg-white">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>

            {/* Settings & Result */}
            <div className="space-y-6">
              {/* Style Settings */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold mb-4">Style Settings</h3>
                <StyleControls
                  settings={settings}
                  onChange={setSettings}
                  disabled={isGenerating}
                />
                
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || isOnCooldown}
                  className="w-full mt-6 gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : isOnCooldown ? (
                    <>
                      <Clock className="h-4 w-4" />
                      Wait {cooldownRemaining}s
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Design
                    </>
                  )}
                </Button>
              </div>

              {/* Generated Result */}
              {(generatedImage || error) && (
                <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                  <h3 className="font-semibold">Generated Result</h3>
                  
                  {error ? (
                    <div className="text-center py-8 text-destructive">
                      <p>{error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="aspect-square rounded-lg overflow-hidden border border-border">
                        <img
                          src={generatedImage!}
                          alt="Generated design"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleDownload} className="flex-1 gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleGenerate}
                          disabled={isGenerating || isOnCooldown}
                          className="flex-1 gap-2"
                        >
                          {isOnCooldown ? (
                            <>{cooldownRemaining}s</>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              Regenerate
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
