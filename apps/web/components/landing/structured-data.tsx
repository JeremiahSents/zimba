import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"

/**
 * Organization plus SoftwareApplication: the first is what search engines use
 * for a knowledge panel, the second is what makes the listing describe Zimba as
 * software rather than an unspecified business.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Zimba Group Ltd.",
      alternateName: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-landing.png`,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      featureList: [
        "Project expense tracking",
        "Budget monitoring",
        "Expense approvals",
        "Cash flow reporting",
        "Payment vouchers",
        "Receipt capture from the field",
      ],
    },
  ],
}

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD has no other injection point in the App Router.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
