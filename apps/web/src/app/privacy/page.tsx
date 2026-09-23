import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Dooniq",
  description: "How Dooniq collects, uses, and protects your information."
};

const sections = [
  {
    title: "1. Who we are",
    body: "Dooniq (\"we\", \"us\", \"our\") operates dooniq.com — an inspiration and marketplace platform where people discover designs, remix them with AI, and buy finished products from independent creators and providers. This policy explains what information we collect, why, and the choices you have."
  },
  {
    title: "2. Information we collect",
    items: [
      "Account information — name, email address, username, and password (stored only as a secure hash) when you sign up.",
      "Profile and content — designs, prompts, remixes, collections, and portfolio items you create or publish.",
      "Transaction information — orders, purchases, and fulfillment details when you buy or sell. Payment card details are processed by our payment partners and never stored on our servers.",
      "Usage data — pages viewed, searches, likes, saves, device and browser type, and approximate location derived from IP address.",
      "Cookies and similar technologies — session tokens, preferences, and analytics identifiers. See section 7."
    ]
  },
  {
    title: "3. How we use your information",
    items: [
      "Provide and personalize the service — your feed, recommendations, remix history, and marketplace matches.",
      "Generate AI remixes from prompts and source designs you choose.",
      "Process orders, connect buyers with creators and providers, and handle fulfillment.",
      "Communicate with you — account notices, order updates, and (with your consent) product news.",
      "Keep the platform safe — fraud prevention, abuse detection, and enforcing our terms.",
      "Improve the product through aggregated, de-identified analytics."
    ]
  },
  {
    title: "4. How we share information",
    body: "We do not sell your personal information. We share it only in these cases:",
    items: [
      "With creators and providers — the minimum order details needed to fulfill something you bought.",
      "With service providers — hosting, payments, analytics, and email delivery partners bound by confidentiality obligations.",
      "When you publish — content you mark public (designs, profile, collections) is visible to other users.",
      "For legal reasons — to comply with law, regulation, or valid legal process, or to protect rights and safety.",
      "In a business transfer — if Dooniq is acquired or merged, subject to this policy's protections."
    ]
  },
  {
    title: "5. AI features",
    body: "Prompts and source designs you submit to Studio are processed to generate remixes. We may use anonymized, aggregated interaction data to improve generation quality. We do not use your private, unpublished designs to train models for other users without your consent."
  },
  {
    title: "6. Data retention and security",
    body: "We keep your information for as long as your account is active or as needed to provide the service, comply with legal obligations, and resolve disputes. We use industry-standard safeguards including encryption in transit, hashed credentials, and access controls. No method of transmission or storage is 100% secure, but we work hard to protect your data."
  },
  {
    title: "7. Cookies",
    body: "We use essential cookies (sign-in sessions, security), preference cookies (filters, theme), and analytics cookies (aggregated usage). You can control cookies through your browser settings; disabling essential cookies may prevent sign-in and checkout from working."
  },
  {
    title: "8. Your rights and choices",
    items: [
      "Access or correct your account information from your profile settings at any time.",
      "Download or delete your designs and personal data by contacting us.",
      "Opt out of marketing emails via the unsubscribe link — transactional emails (orders, security) will still be sent.",
      "Depending on your region (GDPR, CCPA, and similar laws), you may have additional rights to access, portability, deletion, and objection. We honor these for all users regardless of location."
    ]
  },
  {
    title: "9. Children's privacy",
    body: "Dooniq is not directed at children under 13 (or the minimum age in your jurisdiction), and we do not knowingly collect their personal information. If you believe a child has provided us information, contact us and we will delete it."
  },
  {
    title: "10. International users",
    body: "Your information may be processed in countries other than your own, where data protection laws may differ. Where required, we use appropriate safeguards such as standard contractual clauses."
  },
  {
    title: "11. Changes to this policy",
    body: "We may update this policy from time to time. We will post the new version here and update the \"last updated\" date below. For material changes, we will notify you by email or an in-product notice."
  },
  {
    title: "12. Contact us",
    body: "Questions, requests, or concerns about this policy or your data? Email us at privacy@dooniq.com."
  }
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-[#1d1d1f] sm:py-16">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/40">Legal</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-black/45">Last updated: September 23, 2026</p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">{section.title}</h2>
            {section.body ? <p className="mt-3 text-sm leading-7 text-black/60 sm:text-[15px]">{section.body}</p> : null}
            {section.items ? (
              <ul className="mt-3 space-y-2.5">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-7 text-black/60 sm:text-[15px]">
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
