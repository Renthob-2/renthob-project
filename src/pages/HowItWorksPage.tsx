import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  FileText,
  Home,
  ClipboardList,
  Users,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const renterSteps = [
  {
    icon: Search,
    title: "Search Properties",
    description:
      "Browse thousands of verified listings with detailed filters for location, price, and amenities.",
  },
  {
    icon: FileText,
    title: "Apply Online",
    description:
      "Submit your rental application in minutes. Upload documents and track your application status.",
  },
  {
    icon: Home,
    title: "Move In",
    description:
      "Once approved, sign your lease digitally and coordinate your move-in with your new landlord.",
  },
];

const landlordSteps = [
  {
    icon: ClipboardList,
    title: "List Your Property",
    description:
      "Create a detailed listing with photos, amenities, and pricing. Publish in minutes.",
  },
  {
    icon: Users,
    title: "Review Applications",
    description:
      "Receive applications from qualified renters. Review profiles and approve the best fit.",
  },
  {
    icon: Wallet,
    title: "Manage & Collect",
    description:
      "Track rent payments, manage tenant communications, and store lease documents securely.",
  },
];

const renterBenefits = [
  "Access to verified listings only",
  "Save and compare properties",
  "One application for multiple properties",
  "Direct messaging with landlords",
  "Digital lease signing",
  "Payment history tracking",
];

const landlordBenefits = [
  "Easy property listing creation",
  "Application management dashboard",
  "Tenant screening tools",
  "Rent payment tracking",
  "Document storage",
  "AI pricing insights (coming soon)",
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            How Renthob Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking for a rental or listing your property, we've
            made the process simple and stress-free.
          </p>
        </div>
      </section>

      {/* For Renters */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-accent px-3 py-1 rounded-full mb-4">
              <Home className="h-4 w-4" />
              For Renters
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Home in 3 Steps
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Our streamlined process makes finding and securing your next
              rental easier than ever.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {renterSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Connector Line */}
                {index < renterSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                )}

                <div className="bg-card rounded-2xl p-6 shadow-card relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <step.icon className="h-7 w-7 text-accent-foreground" />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-secondary/50 rounded-3xl p-8 md:p-10">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
              What Renters Get
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {renterBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 bg-background rounded-xl p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link to="/signup?role=renter" className="gap-2">
                  Start Searching
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-accent px-3 py-1 rounded-full mb-4">
              <ClipboardList className="h-4 w-4" />
              For Landlords
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              List, Manage, and Grow in 3 Steps
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Powerful tools to list your properties and manage tenants all in
              one place.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {landlordSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Connector Line */}
                {index < landlordSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                )}

                <div className="bg-card rounded-2xl p-6 shadow-card relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  <div className="h-14 w-14 rounded-xl bg-renthob-blue-50 flex items-center justify-center mb-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="bg-card rounded-3xl p-8 md:p-10 shadow-card">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6 text-center">
              What Landlords Get
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {landlordBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 bg-secondary/50 rounded-xl p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <Link to="/signup?role=landlord" className="gap-2">
                  List Your Property
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join Renthob today and experience the easiest way to rent or list
            properties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Create Free Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/faqs">Read FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
