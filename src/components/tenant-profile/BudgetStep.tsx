import { Label } from "@/components/ui/label";
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

const LOCATION_SUGGESTIONS = [
  "Lagos Island", "Victoria Island", "Lekki", "Ikoyi", "Ajah",
  "Yaba", "Surulere", "Ikeja", "Gbagada", "Magodo",
  "Abuja Central", "Wuse", "Garki", "Maitama", "Asokoro",
  "Port Harcourt", "Ibadan", "Enugu",
];

const AMENITY_SUGGESTIONS = [
  "24/7 Power", "Water Supply", "Security", "Parking", "Pool",
  "Gym", "Elevator", "Garden", "Balcony", "Air Conditioning",
  "Internet/WiFi", "CCTV", "Gated Community", "Playground",
];

export function BudgetStep({ formData, updateField }: Props) {
  const [locationInput, setLocationInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");

  const addToList = (field: "preferred_locations" | "must_have_amenities", value: string) => {
    const trimmed = value.trim();
    if (trimmed && !formData[field].includes(trimmed)) {
      updateField(field, [...formData[field], trimmed]);
    }
  };

  const removeFromList = (field: "preferred_locations" | "must_have_amenities", value: string) => {
    updateField(field, formData[field].filter((v) => v !== value));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">💰 Budget & Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Help us understand your budget and location priorities
        </p>
      </div>

      {/* Max rent */}
      <div className="space-y-2">
        <Label className="font-medium">Maximum monthly rent (₦)</Label>
        <Input
          type="number"
          placeholder="e.g., 500000"
          value={formData.max_monthly_rent}
          onChange={(e) => updateField("max_monthly_rent", e.target.value)}
        />
      </div>

      {/* Utilities */}
      <div className="space-y-2">
        <Label className="font-medium">Monthly utilities budget (₦)</Label>
        <Input
          type="number"
          placeholder="e.g., 50000"
          value={formData.utilities_budget}
          onChange={(e) => updateField("utilities_budget", e.target.value)}
        />
      </div>

      {/* Advance */}
      <div className="space-y-2">
        <Label className="font-medium">How many months advance are you willing to pay?</Label>
        <Select value={formData.willing_advance_months} onValueChange={(v) => updateField("willing_advance_months", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 month</SelectItem>
            <SelectItem value="3">3 months</SelectItem>
            <SelectItem value="6">6 months</SelectItem>
            <SelectItem value="12">1 year (12 months)</SelectItem>
            <SelectItem value="24">2 years (24 months)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preferred locations */}
      <div className="space-y-2">
        <Label className="font-medium">Preferred locations</Label>
        <p className="text-sm text-muted-foreground">Where would you like to live?</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {LOCATION_SUGGESTIONS.filter((l) => !formData.preferred_locations.includes(l)).slice(0, 12).map((l) => (
            <Badge
              key={l}
              variant="outline"
              className="cursor-pointer hover:bg-accent text-xs"
              onClick={() => addToList("preferred_locations", l)}
            >
              + {l}
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Add a custom location..."
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addToList("preferred_locations", locationInput);
              setLocationInput("");
            }
          }}
        />
        {formData.preferred_locations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.preferred_locations.map((l) => (
              <Badge key={l} className="gap-1">
                {l}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFromList("preferred_locations", l)} />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Commute */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-medium">Commute method</Label>
          <Select value={formData.commute_method} onValueChange={(v) => updateField("commute_method", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="public_transport">Public transport</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
              <SelectItem value="bicycle">Bicycle</SelectItem>
              <SelectItem value="walking">Walking</SelectItem>
              <SelectItem value="remote">Remote (no commute)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-medium">Max commute (minutes)</Label>
          <Input
            type="number"
            placeholder="e.g., 45"
            value={formData.max_commute_minutes}
            onChange={(e) => updateField("max_commute_minutes", e.target.value)}
          />
        </div>
      </div>

      {/* Must-have amenities */}
      <div className="space-y-2">
        <Label className="font-medium">Must-have amenities</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {AMENITY_SUGGESTIONS.filter((a) => !formData.must_have_amenities.includes(a)).map((a) => (
            <Badge
              key={a}
              variant="outline"
              className="cursor-pointer hover:bg-accent text-xs"
              onClick={() => addToList("must_have_amenities", a)}
            >
              + {a}
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Add a custom amenity..."
          value={amenityInput}
          onChange={(e) => setAmenityInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addToList("must_have_amenities", amenityInput);
              setAmenityInput("");
            }
          }}
        />
        {formData.must_have_amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.must_have_amenities.map((a) => (
              <Badge key={a} className="gap-1">
                {a}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFromList("must_have_amenities", a)} />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
