import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileFormData } from "@/pages/TenantProfileSetup";

interface Props {
  formData: ProfileFormData;
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
}

export function AboutMeStep({ formData, updateField }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">✨ About You</h3>
        <p className="text-sm text-muted-foreground">
          Tell us more about yourself and what you're looking for. Our AI will use this to find your perfect match.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">About me</Label>
        <p className="text-xs text-muted-foreground">
          Share anything about yourself that could help find the right home
        </p>
        <Textarea
          placeholder="I'm a software developer who works from home most days. I enjoy a quiet environment during the week but love hosting small dinners on weekends..."
          value={formData.about_me}
          onChange={(e) => updateField("about_me", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-medium">Ideal neighborhood</Label>
        <p className="text-xs text-muted-foreground">
          Describe what your perfect neighborhood looks and feels like
        </p>
        <Textarea
          placeholder="A quiet, tree-lined street with good restaurants nearby. Close to a gym and grocery store. Safe enough to walk around in the evening..."
          value={formData.ideal_neighborhood}
          onChange={(e) => updateField("ideal_neighborhood", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-medium">Dealbreakers</Label>
        <p className="text-xs text-muted-foreground">
          What are absolute no-go's for you?
        </p>
        <Textarea
          placeholder="No flooding areas, must have 24/7 security, not near a busy road, no shared apartments..."
          value={formData.dealbreakers}
          onChange={(e) => updateField("dealbreakers", e.target.value)}
          rows={3}
        />
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium">🤖 How we'll use this</p>
        <p className="text-sm text-muted-foreground mt-1">
          Our AI will analyze your profile to recommend properties and neighborhoods that match your lifestyle, budget, and personality. The more detail you share, the better your matches will be.
        </p>
      </div>
    </div>
  );
}
