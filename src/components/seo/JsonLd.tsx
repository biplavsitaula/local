import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flamebeverage.com";

// Organization Schema
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flame Beverage",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "Nepal's premier online liquor store offering premium spirits and beverages with fast delivery.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      addressCountry: "NP",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+977-9800000000",
      contactType: "customer service",
      email: "info@flamebeverage.com",
      availableLanguage: ["English", "Nepali"],
    },
    sameAs: [
      "https://facebook.com/flamebeverage",
      "https://instagram.com/flamebeverage",
      "https://twitter.com/flamebeverage",
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Local Business Schema (for liquor store)
export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    "@id": siteUrl,
    name: "Flame Beverage",
    url: siteUrl,
    telephone: "+977-9800000000",
    email: "info@flamebeverage.com",
    description: "Premium spirits and beverages store in Nepal. Fast delivery in Kathmandu Valley.",
    image: `${siteUrl}/og-image.jpg`,
    priceRange: "Rs. 500 - Rs. 50,000",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kathmandu",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      postalCode: "44600",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "27.7172",
      longitude: "85.3240",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "21:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "11:00",
        closes: "20:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Premium Spirits Collection",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Whisky",
          description: "Premium whisky collection from around the world",
        },
        {
          "@type": "OfferCatalog",
          name: "Wine",
          description: "Fine wines for every occasion",
        },
        {
          "@type": "OfferCatalog",
          name: "Vodka",
          description: "Premium vodka selection",
        },
        {
          "@type": "OfferCatalog",
          name: "Rum",
          description: "Caribbean and international rum varieties",
        },
        {
          "@type": "OfferCatalog",
          name: "Gin",
          description: "Craft and premium gin collection",
        },
      ],
    },
  };

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema with Search Action
export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flame Beverage",
    url: siteUrl,
    description: "Nepal's premier online liquor store",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product Schema (for product pages)
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  category?: string;
  brand?: string;
  sku?: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "NPR",
  availability = "InStock",
  category,
  brand,
  sku,
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image.startsWith("http") ? image : `${siteUrl}${image}`,
    category,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand,
        }
      : undefined,
    sku,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "Flame Beverage",
      },
    },
  };

  return (
    <Script
      id={`product-jsonld-${sku || name}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

