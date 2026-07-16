import { LegalPage } from "@/components/legal/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      summary="These terms describe the rules for using Renthob. By creating an account or using the platform, you agree to follow them."
      sections={[
        {
          title: "The Renthob service",
          content: <p>Renthob provides tools for discovering, listing and discussing rental properties. Unless Renthob expressly states otherwise, Renthob is not the landlord, tenant, agent, guarantor or party to a rental agreement. Users remain responsible for their own inspections, negotiations and agreements.</p>,
        },
        {
          title: "Account responsibilities",
          content: <p>You must provide accurate information, keep your login details secure and use only an account you are authorised to control. Landlord and agent access may require administrative approval. You are responsible for activity performed through your account until you notify Renthob of unauthorised use.</p>,
        },
        {
          title: "Listings and applications",
          content: <p>Property owners and agents must have authority to advertise each listing and must keep its price, availability, location, photographs and description accurate. Applicants must submit truthful information. Renthob may review, reject, suspend or remove misleading, unlawful, duplicate or unsafe content.</p>,
        },
        {
          title: "Safe renting",
          content: <p>Users should inspect properties, verify the identity and authority of the other party, and use a written agreement before making commitments. Do not send money solely because of a listing or message. Report requests for unusual advance payments, passwords, one-time codes or unrelated personal information.</p>,
        },
        {
          title: "Acceptable use",
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Do not impersonate another person or misrepresent a property.</li>
              <li>Do not scrape, attack, disrupt or attempt to bypass platform security.</li>
              <li>Do not send harassment, spam, discriminatory content or unlawful material.</li>
              <li>Do not upload content you do not have permission to use.</li>
            </ul>
          ),
        },
        {
          title: "Affiliate programme",
          content: <p>Affiliate participation may require approval. Referral and commission records are subject to validation, anti-fraud checks and the programme terms shown in the affiliate dashboard. Invalid, duplicated, self-referred or fraudulent activity may be rejected.</p>,
        },
        {
          title: "Suspension and termination",
          content: <p>Renthob may limit or suspend accounts and remove content to protect users, investigate abuse, comply with law or enforce these terms. Where appropriate, users will be given a reason and an opportunity to contact support.</p>,
        },
        {
          title: "Availability and liability",
          content: <p>Renthob works to keep the service accurate and available but cannot guarantee uninterrupted operation, a successful rental, the condition of a property or the conduct of another user. Nothing in these terms excludes liability that cannot lawfully be excluded.</p>,
        },
        {
          title: "Governing law and support",
          content: <p>These terms are governed by the laws of the Federal Republic of Nigeria. Users should first contact <a className="text-primary underline" href="mailto:support@renthob.com">support@renthob.com</a> so a complaint can be reviewed and resolved.</p>,
        },
        {
          title: "Changes to these terms",
          content: <p>Updated terms will be posted here with a new effective date. Continued use after a material update means the revised terms apply, subject to applicable law.</p>,
        },
      ]}
    />
  );
}
