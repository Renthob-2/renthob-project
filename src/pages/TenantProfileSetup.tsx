import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { LifestyleStep } from "@/components/tenant-profile/LifestyleStep";
import { IncomeStep } from "@/components/tenant-profile/IncomeStep";
import { BudgetStep } from "@/components/tenant-profile/BudgetStep";
import { PersonalityStep } from "@/components/tenant-profile/PersonalityStep";
import { AboutMeStep } from "@/components/tenant-profile/AboutMeStep";

const STEPS = ["Lifestyle", "Income", "Budget", "Living Style", "About You"];

export type ProfileFormData = {
  // Lifestyle
  has_pets: boolean;
  pet_details: string;
  smoking: boolean;
  work_from_home: string;
  exercise_frequency: string;
  social_lifestyle: string;
  hobbies: string[];
  // Income
  employment_type: string;
  employer_name: string;
  job_title: string;
  monthly_income_range: string;
  income_stability: string;
  // Budget
  max_monthly_rent: string;
  utilities_budget: string;
  willing_advance_months: string;
  // Personality
  noise_tolerance: string;
  cleanliness_level: string;
  guest_frequency: string;
  sleep_schedule: string;
  cooking_frequency: string;
  // Preferences
  preferred_locations: string[];
  commute_method: string;
  max_commute_minutes: string;
  must_have_amenities: string[];
  // About
  about_me: string;
  ideal_neighborhood: string;
  dealbreakers: string;
};

const defaultFormData: ProfileFormData = {
  has_pets: false,
  pet_details: "",
  smoking: false,
  work_from_home: "no",
  exercise_frequency: "occasionally",
  social_lifestyle: "moderate",
  hobbies: [],
  employment_type: "",
  employer_name: "",
  job_title: "",
  monthly_income_range: "",
  income_stability: "stable",
  max_monthly_rent: "",
  utilities_budget: "",
  willing_advance_months: "1",
  noise_tolerance: "moderate",
  cleanliness_level: "clean",
  guest_frequency: "occasionally",
  sleep_schedule: "normal",
  cooking_frequency: "regularly",
  preferred_locations: [],
  commute_method: "",
  max_commute_minutes: "",
  must_have_amenities: [],
  about_me: "",
  ideal_neighborhood: "",
  dealbreakers: "",
};

export default function TenantProfileSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>(defaultFormData);
  const { profile } = useAuth();
  const { tenantProfile, isLoading, upsertProfile, isSaving } = useTenantProfile();
  const navigate = useNavigate();

  // Pre-fill from existing profile
  useEffect(() => {
    if (tenantProfile) {
      setFormData({
        has_pets: tenantProfile.has_pets ?? false,
        pet_details: tenantProfile.pet_details ?? "",
        smoking: tenantProfile.smoking ?? false,
        work_from_home: tenantProfile.work_from_home ?? "no",
        exercise_frequency: tenantProfile.exercise_frequency ?? "occasionally",
        social_lifestyle: tenantProfile.social_lifestyle ?? "moderate",
        hobbies: tenantProfile.hobbies ?? [],
        employment_type: tenantProfile.employment_type ?? "",
        employer_name: tenantProfile.employer_name ?? "",
        job_title: tenantProfile.job_title ?? "",
        monthly_income_range: tenantProfile.monthly_income_range ?? "",
        income_stability: tenantProfile.income_stability ?? "stable",
        max_monthly_rent: tenantProfile.max_monthly_rent?.toString() ?? "",
        utilities_budget: tenantProfile.utilities_budget?.toString() ?? "",
        willing_advance_months: tenantProfile.willing_advance_months?.toString() ?? "1",
        noise_tolerance: tenantProfile.noise_tolerance ?? "moderate",
        cleanliness_level: tenantProfile.cleanliness_level ?? "clean",
        guest_frequency: tenantProfile.guest_frequency ?? "occasionally",
        sleep_schedule: tenantProfile.sleep_schedule ?? "normal",
        cooking_frequency: tenantProfile.cooking_frequency ?? "regularly",
        preferred_locations: tenantProfile.preferred_locations ?? [],
        commute_method: tenantProfile.commute_method ?? "",
        max_commute_minutes: tenantProfile.max_commute_minutes?.toString() ?? "",
        must_have_amenities: tenantProfile.must_have_amenities ?? [],
        about_me: tenantProfile.about_me ?? "",
        ideal_neighborhood: tenantProfile.ideal_neighborhood ?? "",
        dealbreakers: tenantProfile.dealbreakers ?? "",
      });
    }
  }, [tenantProfile]);

  const updateField = <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleSubmit = () => {
    upsertProfile(
      {
        has_pets: formData.has_pets,
        pet_details: formData.pet_details || null,
        smoking: formData.smoking,
        work_from_home: formData.work_from_home,
        exercise_frequency: formData.exercise_frequency,
        social_lifestyle: formData.social_lifestyle,
        hobbies: formData.hobbies.length > 0 ? formData.hobbies : null,
        employment_type: formData.employment_type || null,
        employer_name: formData.employer_name || null,
        job_title: formData.job_title || null,
        monthly_income_range: formData.monthly_income_range || null,
        income_stability: formData.income_stability,
        max_monthly_rent: formData.max_monthly_rent ? parseFloat(formData.max_monthly_rent) : null,
        utilities_budget: formData.utilities_budget ? parseFloat(formData.utilities_budget) : null,
        willing_advance_months: parseInt(formData.willing_advance_months) || 1,
        noise_tolerance: formData.noise_tolerance,
        cleanliness_level: formData.cleanliness_level,
        guest_frequency: formData.guest_frequency,
        sleep_schedule: formData.sleep_schedule,
        cooking_frequency: formData.cooking_frequency,
        preferred_locations: formData.preferred_locations.length > 0 ? formData.preferred_locations : null,
        commute_method: formData.commute_method || null,
        max_commute_minutes: formData.max_commute_minutes ? parseInt(formData.max_commute_minutes) : null,
        must_have_amenities: formData.must_have_amenities.length > 0 ? formData.must_have_amenities : null,
        about_me: formData.about_me || null,
        ideal_neighborhood: formData.ideal_neighborhood || null,
        dealbreakers: formData.dealbreakers || null,
        is_complete: true,
      },
      {
        onSuccess: () => navigate("/dashboard/tenant"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Complete Your Profile 🏡
          </h1>
          <p className="text-muted-foreground mt-2">
            Help us find the perfect property and neighborhood for you, {profile?.full_name?.split(" ")[0] || "there"}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{STEPS[currentStep]}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, i) => (
              <button
                key={step}
                onClick={() => setCurrentStep(i)}
                className={`text-xs px-1 transition-colors ${
                  i === currentStep
                    ? "text-primary font-medium"
                    : i < currentStep
                    ? "text-primary/60"
                    : "text-muted-foreground"
                }`}
              >
                {i < currentStep ? "✓" : ""} {step}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 0 && (
              <LifestyleStep formData={formData} updateField={updateField} />
            )}
            {currentStep === 1 && (
              <IncomeStep formData={formData} updateField={updateField} />
            )}
            {currentStep === 2 && (
              <BudgetStep formData={formData} updateField={updateField} />
            )}
            {currentStep === 3 && (
              <PersonalityStep formData={formData} updateField={updateField} />
            )}
            {currentStep === 4 && (
              <AboutMeStep formData={formData} updateField={updateField} />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 0) navigate(-1);
              else setCurrentStep((s) => s - 1);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Back" : "Previous"}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => setCurrentStep((s) => s + 1)}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSaving}>
              <Check className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Complete Profile"}
            </Button>
          )}
        </div>

        {/* Skip option */}
        {!tenantProfile?.is_complete && (
          <div className="text-center mt-4">
            <Button
              variant="link"
              className="text-muted-foreground text-sm"
              onClick={() => navigate("/dashboard/tenant")}
            >
              Skip for now — complete later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
