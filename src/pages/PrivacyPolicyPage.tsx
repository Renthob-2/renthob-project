import { LegalPage } from "@/components/legal/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="This policy explains what information Renthob collects, why it is used, how it is protected, and the choices available to people who use the platform."
      sections={[
        {
          title: "Who we are",
          content: <p>Renthob is a Nigerian rental marketplace that connects prospective tenants with landlords and property agents. Privacy questions can be sent to <a className="text-primary underline" href="mailto:support@renthob.com">support@renthob.com</a>.</p>,
        },
        {
          title: "Information we collect",
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Account information such as name, email address, phone number, username and account role.</li>
              <li>Rental preferences, profile details, applications, tour requests and messages you choose to submit.</li>
              <li>Property listing details, photographs and ownership or agency information.</li>
              <li>Identity-verification documents when verification is requested.</li>
              <li>Affiliate and withdrawal details when someone joins the affiliate programme.</li>
              <li>Technical information needed for security and operation, such as timestamps, browser information and authentication records.</li>
            </ul>
          ),
        },
        {
          title: "How we use information",
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide accounts, property search, saved listings, applications, tours and messaging.</li>
              <li>Verify users, moderate listings, prevent fraud and enforce platform rules.</li>
              <li>Send service messages about account, application, tour, role and security activity.</li>
              <li>Operate referrals and affiliate requests.</li>
              <li>Improve reliability and respond to support enquiries.</li>
            </ul>
          ),
        },
        {
          title: "When information is shared",
          content: <p>Information is shared only where needed to provide the service—for example, application details with the relevant property owner, messages with their recipients, and public listing details with visitors. Service providers that host the application, database, email or storage may process information on Renthob's behalf. Information may also be disclosed where required by law or necessary to protect users and the platform.</p>,
        },
        {
          title: "Storage and security",
          content: <p>Renthob uses access controls and row-level database permissions to limit account information to authorised users. No online service can guarantee absolute security. Users should keep passwords private and report suspicious activity promptly.</p>,
        },
        {
          title: "Retention",
          content: <p>Information is kept only for as long as reasonably needed to provide the service, resolve disputes, prevent fraud and meet legal or accounting obligations. Verification documents and inactive-account data should be removed according to Renthob's approved retention schedule.</p>,
        },
        {
          title: "Your choices and rights",
          content: <p>You may request access to, correction of, deletion of, or restriction on the use of your personal information where applicable. You may also object to certain processing or withdraw consent. Contact support from the email address connected to your account so the request can be verified.</p>,
        },
        {
          title: "Children",
          content: <p>Renthob is not intended for children under 18. A parent or guardian who believes a child provided personal information should contact support.</p>,
        },
        {
          title: "Changes to this policy",
          content: <p>Material changes will be posted on this page with a new effective date. Where appropriate, registered users will also be notified through the platform or by email.</p>,
        },
      ]}
    />
  );
}
