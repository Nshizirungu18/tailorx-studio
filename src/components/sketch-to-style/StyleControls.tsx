import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface StyleSettings {
  fabricType: string;
  lightingStyle: string;
  detailLevel: number;
  additionalNotes: string;
}

interface StyleControlsProps {
  settings: StyleSettings;
  onChange: (settings: StyleSettings) => void;
  disabled?: boolean;
}

const fabricTypes = [
  { value: "cotton", label: "Cotton" },
  { value: "silk", label: "Silk" },
  { value: "linen", label: "Linen" },
  { value: "wool", label: "Wool" },
  { value: "denim", label: "Denim" },
  { value: "leather", label: "Leather" },
  { value: "velvet", label: "Velvet" },
  { value: "chiffon", label: "Chiffon" },
  { value: "satin", label: "Satin" },
  { value: "tweed", label: "Tweed" },
];

const lightingStyles = [
  { value: "natural studio", label: "Natural Studio" },
  { value: "soft diffused", label: "Soft Diffused" },
  { value: "dramatic high contrast", label: "Dramatic High Contrast" },
  { value: "warm golden hour", label: "Warm Golden Hour" },
  { value: "cool blue", label: "Cool Blue" },
  { value: "editorial flash", label: "Editorial Flash" },
  { value: "ambient natural", label: "Ambient Natural" },
];

export function StyleControls({ settings, onChange, disabled }: StyleControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fabric">Fabric Type</Label>
        <Select
          value={settings.fabricType}
          onValueChange={(value) => onChange({ ...settings, fabricType: value })}
          disabled={disabled}
        >
          <SelectTrigger id="fabric">
            <SelectValue placeholder="Select fabric type" />
          </SelectTrigger>
          <SelectContent>
            {fabricTypes.map((fabric) => (
              <SelectItem key={fabric.value} value={fabric.value}>
                {fabric.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lighting">Lighting Style</Label>
        <Select
          value={settings.lightingStyle}
          onValueChange={(value) => onChange({ ...settings, lightingStyle: value })}
          disabled={disabled}
        >
          <SelectTrigger id="lighting">
            <SelectValue placeholder="Select lighting style" />
          </SelectTrigger>
          <SelectContent>
            {lightingStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Detail Level</Label>
          <span className="text-sm text-muted-foreground">{settings.detailLevel}%</span>
        </div>
        <Slider
          value={[settings.detailLevel]}
          onValueChange={([value]) => onChange({ ...settings, detailLevel: value })}
          min={10}
          max={100}
          step={10}
          disabled={disabled}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Clean & Simple</span>
          <span>Highly Detailed</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any specific details about colors, patterns, embellishments..."
          value={settings.additionalNotes}
          onChange={(e) => onChange({ ...settings, additionalNotes: e.target.value })}
          disabled={disabled}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
}
