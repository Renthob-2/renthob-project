import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Home, Building2, HelpCircle } from "lucide-react";

const renterFaqs = [
  {
    question: "How do I search for properties?",
    answer:
      "Use our search bar on the homepage or visit the Search page. You can filter by location, price range, number of bedrooms, amenities, and more. Save your favorite listings to compare them later.",
  },
  {
    question: "Is it free to use Renthob as a renter?",
    answer:
      "Yes! Creating an account, searching for properties, saving listings, and applying to rentals is completely free for renters.",
  },
  {
    question: "How do I apply for a rental property?",
    answer:
      "Once you find a property you like, click 'Apply' on the listing page. You'll need to complete your renter profile with basic information and any required documents. Your application will be sent directly to the landlord.",
  },
  {
    question: "Can I message landlords before applying?",
    answer:
      "Yes! You can send messages to landlords through our secure messaging system to ask questions about the property before submitting an application.",
  },
  {
    question: "How do I track my rental applications?",
    answer:
      "All your applications are tracked in your renter dashboard. You can see the status of each application (pending, approved, rejected) and receive notifications when there are updates.",
  },
  {
    question: "What documents do I need to apply?",
    answer:
      "Common documents include proof of income, government ID, and references. Each landlord may have different requirements, which will be listed on the property page.",
  },
];

const landlordFaqs = [
  {
    question: "How do I list my property?",
    answer:
      "After creating a landlord account, go to your dashboard and click 'Add Property'. Fill in the property details, upload photos, set your price, and publish. Your listing will be visible to renters immediately.",
  },
  {
    question: "What does it cost to list a property?",
    answer:
      "Basic listings are free! We also offer premium features for enhanced visibility and advanced management tools. Check our pricing page for more details.",
  },
  {
    question: "How do I review rental applications?",
    answer:
      "All applications appear in your landlord dashboard. You can view each applicant's profile, documents, and message history. Approve or reject applications with a single click.",
  },
  {
    question: "Can I manage multiple properties?",
    answer:
      "Absolutely! Our platform is designed for both individual landlords and agencies. Manage unlimited properties from a single dashboard.",
  },
  {
    question: "How do I track rent payments?",
    answer:
      "Our payment tracking feature lets you record rent payments, view payment history, and identify overdue payments. You can also set up reminders for tenants.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take security seriously. All data is encrypted, and we follow industry best practices to protect your information and your tenants' data.",
  },
];

const generalFaqs = [
  {
    question: "What is Renthob?",
    answer:
      "Renthob is a modern rental platform that connects renters with landlords and agencies. We make it easy to search for properties, apply for rentals, manage listings, and communicate—all in one place.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Click 'Get Started' or 'Sign Up' and choose whether you're a renter or landlord. Fill in your email and password, verify your email, and you're ready to go!",
  },
  {
    question: "Can I use Renthob on my phone?",
    answer:
      "Yes! Renthob is fully responsive and works great on all devices—phones, tablets, and desktops. We're also working on dedicated mobile apps coming soon.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team at hello@renthob.com or through the contact form in your account settings. We typically respond within 24 hours.",
  },
  {
    question: "What cities does Renthob cover?",
    answer:
      "We're currently available in major metropolitan areas across the United States and expanding to new cities regularly. Enter your city in the search to see available listings.",
  },
  {
    question: "Do you verify listings?",
    answer:
      "Yes, we verify all listings to ensure authenticity and quality. Our team reviews property details and photos to protect renters from scams.",
  },
];

export default function FAQsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about using Renthob. Can't find
            what you're looking for? Contact us!
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          {/* Renter FAQs */}
          <div id="renters" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <Home className="h-5 w-5 text-accent-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                For Renters
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {renterFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`renter-${index}`}
                  className="bg-card rounded-xl border border-border/50 px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Landlord FAQs */}
          <div id="landlords" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-renthob-blue-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                For Landlords
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {landlordFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`landlord-${index}`}
                  className="bg-card rounded-xl border border-border/50 px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* General FAQs */}
          <div id="general">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                General Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {generalFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`general-${index}`}
                  className="bg-card rounded-xl border border-border/50 px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Our support team is here to help. Reach out and we'll get back to
            you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="mailto:hello@renthob.com">Contact Support</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
