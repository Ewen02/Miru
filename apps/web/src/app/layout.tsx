import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { HeaderProvider } from "@/components/app-header/header-context";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";
const DESCRIPTION =
  "Plateforme anime — explorer les trending, organiser ta watchlist, partager tes découvertes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Miru — Explorer, Organiser, Partager",
    template: "%s — Miru",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Miru — Explorer, Organiser, Partager",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Miru",
    images: ["/og.png"],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miru — Explorer, Organiser, Partager",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg-base font-body text-text-primary pb-16 md:pb-0">
        <HeaderProvider>
          <AppHeader />
          <div className="flex-1">{children}</div>
        </HeaderProvider>
        <MobileBottomNav />
        <SiteFooter />
      </body>
    </html>
  );
}
