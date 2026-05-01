import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Home, Building2, HelpCircle, Briefcase } from "lucide-react";

const generalFaqs = [
  {
    question: "What is Renthob?",
    answer:
      "Renthob is a digital platform that connects renters with landlords and property agencies to make renting homes easier and more transparent.",
  },
  {
    question: "Is Renthob free for renters?",
    answer:
      "Yes. Searching for properties and contacting landlords is free for renters.",
  },
  {
    question: "Are listings verified?",
    answer:
      "We encourage landlords and agencies to verify their listings to ensure reliability and transparency.",
  },
  {
    question: "Can I list properties if I'm not an agency?",
    answer:
      "Yes. Individual landlords can list properties directly on Renthob.",
  },
  {
    question: "Does Renthob handle rental payments?",
    answer:
      "Currently Renthob focuses on property discovery and connections between renters and property owners.",
  },
];

const renterFaqs = [
  {
    question: "How do I find a property on Renthob?",
    answer:
      "Simply search by location, price range, and property type to see available listings.",
  },
  {
    question: "Do I need to create an account to search?",
    answer:
      "You can browse listings without an account, but creating an account allows you to contact landlords and save properties.",
  },
  {
    question: "How do I contact a landlord?",
    answer:
      "Click the contact or message button on the property listing to send a message directly.",
  },
  {
    question: "Can I schedule property inspections?",
    answer:
      "Yes. Renters can coordinate inspections directly with the landlord or agent.",
  },
  {
    question: "Are the listings verified?",
    answer:
      "Renthob works to ensure listings are legitimate and encourages landlord verification.",
  },
  {
    question: "Does Renthob charge renters?",
    answer:
      "No. Renters can browse and contact property owners for free.",
  },
];

const landlordFaqs = [
  {
    question: "Who can list a property on Renthob?",
    answer:
      "Any verified property owner can list rental properties on Renthob.",
  },
  {
    question: "How much does it cost to list a property?",
    answer:
      "Basic property listing may be free, while premium listing options may offer greater visibility.",
  },
  {
    question: "How do renters contact me?",
    answer:
      "Renters can message you directly through the Renthob platform.",
  },
  {
    question: "Can I list multiple properties?",
    answer:
      "Yes. Landlords with multiple properties can manage all listings from one dashboard.",
  },
  {
    question: "Can I remove my listing anytime?",
    answer:
      "Yes. You can edit or remove your property listing whenever you want.",
  },
];

const agencyFaqs = [
  {
    question: "Who can create an agency account?",
    answer:
      "Registered real estate agencies and property managers can create an agency account.",
  },
  {
    question: "Can agencies manage multiple agents?",
    answer:
      "Yes. Agencies can manage listings and property inquiries from multiple agents.",
  },
  {
    question: "How do renters contact agencies?",
    answer:
      "Renters can send direct messages through each property listing.",
  },
  {
    question: "Can agencies update property availability?",
    answer:
      "Yes. Agencies can edit listings, update pricing, or mark properties as rented.",
  },
  {
    question: "Is there a cost for agencies?",
    answer:
      "Basic listings may be free while premium visibility tools may be available for agencies.",
  },
];

const faqSections = [
  {
    id: "general",
    label: "General Questions",
    icon: HelpCircle,
    iconClassName: "bg-muted text-muted-foreground",
    faqs: generalFaqs,
  },
  {
    id: "renters",
    label: "For Renters",
    icon: Home,
    iconClassName: "bg-accent text-accent-foreground",
    faqs: renterFaqs,
  },
  {
    id: "landlords",
    label: "For Landlords",
    icon: Building2,
    iconClassName: "bg-accent text-primary",
    faqs: landlordFaqs,
  },
  {
    id: "agencies",
    label: "For Agencies",
    icon: Briefcase,
    iconClassName: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    faqs: agencyFaqs,
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
            Find answers to common questions about using Renthob. Can't find what you're looking for? Contact us!
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 md:py-20">
        <div className="container max-w-4xl">
          {faqSections.map((section) => (
            <div key={section.id} id={section.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${section.iconClassName}`}>
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {section.label}
                </h2>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {section.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${section.id}-${index}`}
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
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            About Us
          </h2>
          <div className="space-y-4 text-muted-foreground text-lg">
            <p>
              Renthob was created to simplify the rental experience in Nigeria and other emerging markets.
            </p>
            <p>
              Finding a home should not involve stress, hidden fees, or unreliable listings. Our mission is to build a trusted digital marketplace where renters can easily discover homes while landlords and agencies can efficiently reach the right tenants.
            </p>
            <p>
              We believe technology can make renting faster, safer, and more transparent for everyone involved.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Our support team is here to help. Reach out and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="mailto:support@renthob.com">Contact Support</a>
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
