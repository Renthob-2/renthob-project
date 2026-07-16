import type { ReactNode } from "react";

interface LegalSection {
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  summary: string;
  sections: LegalSection[];
}

export function LegalPage({ title, summary, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 md:py-16">
        <p className="text-sm font-medium text-primary">Last updated 14 July 2026</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">{summary}</p>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <h2
                id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                className="text-xl font-semibold text-foreground"
              >
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">{section.content}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
