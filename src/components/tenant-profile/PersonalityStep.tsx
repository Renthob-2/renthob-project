import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileFormData } from "@/pages/TenantProfileSetup";

interface Props {
  formData: ProfileFormData;
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
}

export function PersonalityStep({ formData, updateField }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">🏠 Living Style</h3>
        <p className="text-sm text-muted-foreground">
          How do you like to live? This helps match you with compatible neighborhoods.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">Noise tolerance</Label>
        <p className="text-xs text-muted-foreground">How much noise is okay for you?</p>
        <Select value={formData.noise_tolerance} onValueChange={(v) => updateField("noise_tolerance", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="very_low">Very low — I need absolute quiet</SelectItem>
            <SelectItem value="low">Low — minimal noise please</SelectItem>
            <SelectItem value="moderate">Moderate — normal city noise is fine</SelectItem>
            <SelectItem value="high">High — noise doesn't bother me much</SelectItem>
            <SelectItem value="very_high">Very high — I can sleep through anything</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">Cleanliness standard</Label>
        <Select value={formData.cleanliness_level} onValueChange={(v) => updateField("cleanliness_level", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relaxed">Relaxed — lived-in feel</SelectItem>
            <SelectItem value="average">Average — tidy but not obsessive</SelectItem>
            <SelectItem value="clean">Clean — I keep things neat</SelectItem>
            <SelectItem value="very_clean">Very clean — regular deep cleaning</SelectItem>
            <SelectItem value="spotless">Spotless — everything in its place</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">How often do you have guests?</Label>
        <Select value={formData.guest_frequency} onValueChange={(v) => updateField("guest_frequency", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rarely">Rarely — almost never</SelectItem>
            <SelectItem value="occasionally">Occasionally — once or twice a month</SelectItem>
            <SelectItem value="often">Often — weekly visitors</SelectItem>
            <SelectItem value="frequently">Frequently — friends over all the time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">Sleep schedule</Label>
        <Select value={formData.sleep_schedule} onValueChange={(v) => updateField("sleep_schedule", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="early_bird">Early bird — up before 6 AM</SelectItem>
            <SelectItem value="normal">Normal — 10 PM to 7 AM</SelectItem>
            <SelectItem value="night_owl">Night owl — stay up past midnight</SelectItem>
            <SelectItem value="irregular">Irregular — varies a lot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-medium">How often do you cook?</Label>
        <Select value={formData.cooking_frequency} onValueChange={(v) => updateField("cooking_frequency", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rarely">Rarely — mostly eat out / order in</SelectItem>
            <SelectItem value="sometimes">Sometimes — a few times a week</SelectItem>
            <SelectItem value="regularly">Regularly — cook most meals</SelectItem>
            <SelectItem value="daily">Daily — I love cooking</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
