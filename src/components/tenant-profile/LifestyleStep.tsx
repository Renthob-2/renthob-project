import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import type { ProfileFormData } from "@/pages/TenantProfileSetup";

interface Props {
  formData: ProfileFormData;
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
}

const HOBBY_SUGGESTIONS = [
  "Reading", "Cooking", "Fitness", "Music", "Gaming", "Photography",
  "Gardening", "Painting", "Travel", "Dancing", "Movies", "Sports",
  "Yoga", "Writing", "Socializing", "Hiking",
];

export function LifestyleStep({ formData, updateField }: Props) {
  const [hobbyInput, setHobbyInput] = useState("");

  const addHobby = (hobby: string) => {
    const trimmed = hobby.trim();
    if (trimmed && !formData.hobbies.includes(trimmed)) {
      updateField("hobbies", [...formData.hobbies, trimmed]);
    }
    setHobbyInput("");
  };

  const removeHobby = (hobby: string) => {
    updateField("hobbies", formData.hobbies.filter((h) => h !== hobby));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">🐾 Your Lifestyle</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your day-to-day life so we can find places that match
        </p>
      </div>

      {/* Pets */}
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div>
          <Label className="font-medium">Do you have pets?</Label>
          <p className="text-sm text-muted-foreground">Dogs, cats, or other animals</p>
        </div>
        <Switch
          checked={formData.has_pets}
          onCheckedChange={(v) => updateField("has_pets", v)}
        />
      </div>
      {formData.has_pets && (
        <Input
          placeholder="What kind of pet(s)? e.g., 1 dog (Labrador)"
          value={formData.pet_details}
          onChange={(e) => updateField("pet_details", e.target.value)}
        />
      )}

      {/* Smoking */}
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div>
          <Label className="font-medium">Do you smoke?</Label>
          <p className="text-sm text-muted-foreground">Tobacco or other</p>
        </div>
        <Switch
          checked={formData.smoking}
          onCheckedChange={(v) => updateField("smoking", v)}
        />
      </div>

      {/* Work from home */}
      <div className="space-y-2">
        <Label className="font-medium">Do you work from home?</Label>
        <Select value={formData.work_from_home} onValueChange={(v) => updateField("work_from_home", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No — I go to an office/workplace</SelectItem>
            <SelectItem value="sometimes">Sometimes — hybrid schedule</SelectItem>
            <SelectItem value="always">Yes — fully remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exercise */}
      <div className="space-y-2">
        <Label className="font-medium">How often do you exercise?</Label>
        <Select value={formData.exercise_frequency} onValueChange={(v) => updateField("exercise_frequency", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="occasionally">Occasionally</SelectItem>
            <SelectItem value="regularly">Regularly (3-4x/week)</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Social lifestyle */}
      <div className="space-y-2">
        <Label className="font-medium">How would you describe your social life?</Label>
        <Select value={formData.social_lifestyle} onValueChange={(v) => updateField("social_lifestyle", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quiet">Quiet — I prefer staying in</SelectItem>
            <SelectItem value="moderate">Moderate — balanced social life</SelectItem>
            <SelectItem value="social">Social — I enjoy going out often</SelectItem>
            <SelectItem value="very_social">Very social — always on the move</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hobbies */}
      <div className="space-y-2">
        <Label className="font-medium">Your hobbies & interests</Label>
        <p className="text-sm text-muted-foreground">Pick from suggestions or add your own</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {HOBBY_SUGGESTIONS.filter((h) => !formData.hobbies.includes(h)).map((h) => (
            <Badge
              key={h}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => addHobby(h)}
            >
              + {h}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a custom hobby..."
            value={hobbyInput}
            onChange={(e) => setHobbyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHobby(hobbyInput);
              }
            }}
          />
        </div>
        {formData.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.hobbies.map((h) => (
              <Badge key={h} className="gap-1">
                {h}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeHobby(h)} />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
