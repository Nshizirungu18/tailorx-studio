import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Sparkles, Wand2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SketchUploader } from "@/components/sketch-to-style/SketchUploader";
import { StyleControls, StyleSettings } from "@/components/sketch-to-style/StyleControls";
import { GeneratedResult } from "@/components/sketch-to-style/GeneratedResult";
import { useGenerationCooldown } from "@/hooks/useGenerationCooldown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const defaultSettings: StyleSettings = {
  fabricType: "cotton",
  lightingStyle: "natural studio",
  detailLevel: 70,
  additionalNotes: "",
};

export default function SketchToStyle() {
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cooldownRemaining, isOnCooldown, startCooldown } = useGenerationCooldown();

  const handleGenerate = useCallback(async () => {
    if (!sketchImage) {
      toast.error("Please upload a sketch first");
      return;
    }

    if (isGenerating || isOnCooldown) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke("generate-fashion", {
        body: {
          sketchBase64: sketchImage,
          fabricType: settings.fabricType,
          lightingStyle: settings.lightingStyle,
          detailLevel: settings.detailLevel,
          additionalNotes: settings.additionalNotes,
        },
      });

      const { data, error: fnError } = response;

      // Handle function invocation errors
      if (fnError) {
        console.error("Function invocation error:", fnError);
        const errorMessage = fnError.message || "Failed to connect to the AI service";
        throw new Error(errorMessage);
      }

      // Handle response errors
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
        setDescription(data.description || null);
        toast.success("Design generated successfully!");
        startCooldown(10);
      } else {
        throw new Error("No image was generated. Please try a different sketch.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      let message = "Generation failed. Please try again.";
      if (err instanceof Error) {
        // Provide friendlier error messages
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
      startCooldown(15); // Longer cooldown on error to prevent spam
    } finally {
      setIsGenerating(false);
    }
  }, [sketchImage, settings, isGenerating, isOnCooldown, startCooldown]);

  const handleClearSketch = useCallback(() => {
    setSketchImage(null);
    setGeneratedImage(null);
    setDescription(null);
    setError(null);
  }, []);

  const currentStep = !sketchImage ? 1 : !generatedImage ? 2 : 3;

  return (
    <Layout>
      <Helmet>
        <title>Sketch to Style - AI Fashion Generator | TailorX</title>
        <meta 
          name="description" 
          content="Transform your fashion sketches into photorealistic garment images using AI. Upload or draw a sketch and generate stunning fashion designs instantly." 
        />
      </Helmet>

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Fashion Generation
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Sketch to <span className="text-gradient-gold">Style</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your fashion sketches into photorealistic garment images. 
              Upload a sketch, customize the style, and let AI bring your designs to life.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[
              { num: 1, label: "Upload Sketch" },
              { num: 2, label: "Style Settings" },
              { num: 3, label: "Generated Result" },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep >= step.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.num}
                </div>
                <span className={`hidden sm:inline text-sm ${
                  currentStep >= step.num ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
                {i < 2 && (
                  <div className={`w-8 md:w-16 h-0.5 ${
                    currentStep > step.num ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1: Upload */}
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-foreground">1. Upload Sketch</h2>
              <SketchUploader
                onImageSelect={setSketchImage}
                selectedImage={sketchImage}
                onClear={handleClearSketch}
              />
            </div>

            {/* Step 2: Style Settings */}
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-foreground">2. Style Settings</h2>
              <div className="p-6 rounded-xl border border-border bg-card">
                <StyleControls
                  settings={settings}
                  onChange={setSettings}
                  disabled={isGenerating}
                />
                
                <Button
                  onClick={handleGenerate}
                  disabled={!sketchImage || isGenerating || isOnCooldown}
                  className="w-full mt-6 gap-2"
                  size="lg"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : isOnCooldown ? (
                    <>Wait {cooldownRemaining}s</>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Design
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Step 3: Result */}
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-foreground">3. Generated Result</h2>
              <GeneratedResult
                image={generatedImage}
                description={description}
                isGenerating={isGenerating}
                error={error}
                cooldownRemaining={cooldownRemaining}
                onRegenerate={handleGenerate}
                hasSketch={!!sketchImage}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
