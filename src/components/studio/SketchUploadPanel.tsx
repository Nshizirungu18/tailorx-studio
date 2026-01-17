import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

interface SketchUploadPanelProps {
  uploadedSketch: string | null;
  onUpload: (dataUrl: string) => void;
  onClear: () => void;
}

export function SketchUploadPanel({ uploadedSketch, onUpload, onClear }: SketchUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or SVG file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpload(result);
      toast.success('Sketch uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Sketch</h3>
        <p className="text-sm text-muted-foreground">
          Upload an existing sketch or design to use as the base for AI generation.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {!uploadedSketch ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
            "hover:border-primary hover:bg-primary/5",
            isDragging && "border-primary bg-primary/10"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Drop your sketch here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileImage className="w-4 h-4" />
              <span>PNG, JPG, SVG • Max 10MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border bg-muted/50">
            <img 
              src={uploadedSketch} 
              alt="Uploaded sketch"
              className="w-full h-auto max-h-[300px] object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Replace Image
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClear}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <Label className="text-sm font-medium">Tips for best results:</Label>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use clean, high-contrast line drawings</li>
          <li>• Ensure the design fills most of the image</li>
          <li>• Simple backgrounds work best</li>
          <li>• Higher resolution images produce better results</li>
        </ul>
      </div>
    </div>
  );
}
