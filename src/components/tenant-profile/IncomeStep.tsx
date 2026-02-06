import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProfileFormData } from "@/pages/TenantProfileSetup";

interface Props {
  formData: ProfileFormData;
  updateField: <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => void;
}

export function IncomeStep({ formData, updateField }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">💼 Income & Employment</h3>
        <p className="text-sm text-muted-foreground">
          This helps us match you with properties in your range. Your data is kept private.
        </p>
      </div>

      {/* Employment type */}
      <div className="space-y-2">
        <Label className="font-medium">Employment status</Label>
        <Select value={formData.employment_type} onValueChange={(v) => updateField("employment_type", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employed">Employed (Full-time/Part-time)</SelectItem>
            <SelectItem value="self_employed">Self-employed / Business Owner</SelectItem>
            <SelectItem value="freelancer">Freelancer / Contractor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="unemployed">Currently Unemployed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employer / Job */}
      {(formData.employment_type === "employed" || formData.employment_type === "self_employed") && (
        <>
          <div className="space-y-2">
            <Label className="font-medium">
              {formData.employment_type === "self_employed" ? "Business name" : "Employer name"}
            </Label>
            <Input
              placeholder={formData.employment_type === "self_employed" ? "Your business name" : "Company name"}
              value={formData.employer_name}
              onChange={(e) => updateField("employer_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Job title / Role</Label>
            <Input
              placeholder="e.g., Software Engineer, Manager"
              value={formData.job_title}
              onChange={(e) => updateField("job_title", e.target.value)}
            />
          </div>
        </>
      )}

      {formData.employment_type === "freelancer" && (
        <div className="space-y-2">
          <Label className="font-medium">What do you do?</Label>
          <Input
            placeholder="e.g., Web Developer, Graphic Designer"
            value={formData.job_title}
            onChange={(e) => updateField("job_title", e.target.value)}
          />
        </div>
      )}

      {/* Monthly income range */}
      <div className="space-y-2">
        <Label className="font-medium">Monthly income range</Label>
        <Select value={formData.monthly_income_range} onValueChange={(v) => updateField("monthly_income_range", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your income range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="below_100k">Below ₦100,000</SelectItem>
            <SelectItem value="100k_250k">₦100,000 — ₦250,000</SelectItem>
            <SelectItem value="250k_500k">₦250,000 — ₦500,000</SelectItem>
            <SelectItem value="500k_1m">₦500,000 — ₦1,000,000</SelectItem>
            <SelectItem value="1m_2m">₦1,000,000 — ₦2,000,000</SelectItem>
            <SelectItem value="2m_5m">₦2,000,000 — ₦5,000,000</SelectItem>
            <SelectItem value="above_5m">Above ₦5,000,000</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Income stability */}
      <div className="space-y-2">
        <Label className="font-medium">Income stability</Label>
        <Select value={formData.income_stability} onValueChange={(v) => updateField("income_stability", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="variable">Variable — changes month to month</SelectItem>
            <SelectItem value="mostly_stable">Mostly stable — minor fluctuations</SelectItem>
            <SelectItem value="stable">Stable — consistent monthly income</SelectItem>
            <SelectItem value="very_stable">Very stable — guaranteed salary + benefits</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
