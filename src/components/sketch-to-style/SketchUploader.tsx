import { useState, useCallback, useRef } from "react";
import { Upload, Image, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SketchUploaderProps {
  onImageSelect: (dataUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

// Downscale image to max 1024px dimension
function downscaleImage(dataUrl: string, maxDim: number = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { width, height } = img;
      
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.min(maxDim / width, maxDim / height);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } else {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

export function SketchUploader({ onImageSelect, selectedImage, onClear }: SketchUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const downscaled = await downscaleImage(dataUrl);
      onImageSelect(downscaled);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (selectedImage) {
    return (
      <div className="relative group">
        <div className="aspect-square rounded-xl overflow-hidden border-2 border-primary/30 bg-secondary">
          <img 
            src={selectedImage} 
            alt="Selected sketch" 
            className="w-full h-full object-contain"
          />
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Sketch uploaded successfully
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "aspect-square rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />
        
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        
        <div className="text-center px-4">
          <p className="font-medium text-foreground">Drop your sketch here</p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse (PNG, JPG, WebP)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button variant="outline" className="w-full gap-2" asChild>
        <Link to="/sketch-to-style/studio">
          <Pencil className="h-4 w-4" />
          Draw in Studio Mode
        </Link>
      </Button>
    </div>
  );
}
