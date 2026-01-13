import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flamebeverage.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Flame Beverage | Premium Spirits & Beverages in Nepal",
    template: "%s | Flame Beverage",
  },
  description: "Flame Beverage is Nepal's premier online liquor store offering a curated selection of premium whisky, wine, vodka, rum, gin, and more. Fast delivery in Kathmandu Valley. Age 21+ only.",
  keywords: [
    "liquor store Nepal",
    "premium spirits",
    "whisky Nepal",
    "wine delivery Kathmandu",
    "vodka online",
    "rum Nepal",
    "gin delivery",
    "beer online Nepal",
    "alcohol delivery",
    "Flame Beverage",
    "online liquor Nepal",
    "premium beverages",
  ],
  authors: [{ name: "Flame Beverage" }],
  creator: "Flame Beverage",
  publisher: "Flame Beverage",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ne_NP",
    url: siteUrl,
    siteName: "Flame Beverage",
    title: "Flame Beverage | Premium Spirits & Beverages in Nepal",
    description: "Discover Nepal's finest collection of premium spirits and beverages. Fast delivery, authentic products, and exceptional service.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Flame Beverage - Premium Spirits & Beverages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flame Beverage | Premium Spirits & Beverages in Nepal",
    description: "Discover Nepal's finest collection of premium spirits and beverages. Fast delivery, authentic products, and exceptional service.",
    images: ["/og-image.jpg"],
    creator: "@flamebeverage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "E-commerce",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || !theme) {
                    // Default to dark if no theme is set
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // If localStorage is not available, default to dark
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
