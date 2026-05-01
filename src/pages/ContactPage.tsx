import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Twitter, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const social = [
    { label: "Instagram", handle: "@userenthob", href: "https://instagram.com/userenthob", icon: Instagram },
    { label: "TikTok", handle: "@userenthob", href: "https://tiktok.com/@userenthob", icon: MessageCircle },
    { label: "X (Twitter)", handle: "@userenthob", href: "https://x.com/userenthob", icon: Twitter },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Contact Support</h1>
        <p className="text-muted-foreground">
          We're here to help. Reach out through any of the channels below and our team will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a href="mailto:support@renthob.com" className="text-primary hover:underline">
              support@renthob.com
            </a>
            <p className="text-sm text-muted-foreground mt-2">Typical response within 24 hours.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a href="tel:+2345551234567" className="text-primary hover:underline">
              (555) 123-4567
            </a>
            <p className="text-sm text-muted-foreground mt-2">Mon–Fri, 9am – 6pm WAT.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Lagos, Nigeria</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Follow us on social</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {social.map((s) => (
              <Button key={s.label} variant="outline" asChild className="justify-start">
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <s.icon className="h-4 w-4 mr-2" />
                  {s.label}: {s.handle}
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
