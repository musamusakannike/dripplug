import React from "react";
import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter, Poppins } from "next/font/google";
import "./globals.css";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  APP_URL,
  CAMPUS_CITY,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from "@/config/site";
import { getCurrentUser } from "@/lib/auth";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { ToastContainer } from "@/components/ui/ToastContainer";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: [ '400', '500', '600', '700' ]
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Campus Fashion Store for UNILORIN Students`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1734,
        height: 907,
        alt: `${APP_NAME} — Campus fashion. Delivered.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Campus Fashion Store for UNILORIN Students`,
    description: APP_DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: APP_NAME,
        url: APP_URL,
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE,
        address: {
          "@type": "PostalAddress",
          addressLocality: CAMPUS_CITY,
          addressCountry: "NG",
        },
        sameAs: Object.values(SOCIAL_LINKS),
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        url: APP_URL,
        name: APP_NAME,
        publisher: {
          "@id": `${APP_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${APP_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${archivoBlack.variable} ${poppins.className}`}>
      <body className="min-h-screen flex flex-col bg-white text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AnnouncementBar />
        <Navbar initialUser={user} />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <CartDrawer />
        <AuthModal />
        <ToastContainer />
      </body>
    </html>
  );
}
