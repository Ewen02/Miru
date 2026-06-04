import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { AppHeader } from "@/components/app-header";
import { HeaderProvider } from "@/components/app-header/header-context";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/json-ld";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://miru.app";
const DESCRIPTION =
  "Plateforme anime — explorer 4 500+ titres, organiser ta watchlist, partager tes avis. Gratuit, sans pub, sans tracker.";
const KEYWORDS = [
  "anime",
  "tracker anime",
  "watchlist anime",
  "MyAnimeList alternative",
  "AniList alternative",
  "catalogue anime",
  "calendrier anime",
  "avis anime",
];

const OG_LOCALE: Record<string, string> = { fr: "fr_FR", en: "en_US" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Miru — Explorer, organiser, partager",
      template: "%s — Miru",
    },
    description: DESCRIPTION,
    keywords: KEYWORDS,
    applicationName: "Miru",
    authors: [{ name: "Miru" }],
    creator: "Miru",
    publisher: "Miru",
    // Self-referencing canonical + hreflang alternates. The default locale
    // (fr) lives at "/", en at "/en"; child routes extend these via their own
    // generateMetadata. See lib/alternates.ts for per-route helpers.
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: { fr: "/", en: "/en" },
    },
    openGraph: {
      title: "Miru — Explorer, organiser, partager",
      description: DESCRIPTION,
      url: locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`,
      siteName: "Miru",
      locale: OG_LOCALE[locale] ?? "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Miru — Explorer, organiser, partager",
      description: DESCRIPTION,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Miru",
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

export const viewport: import("next").Viewport = {
  themeColor: "#08080c",
  colorScheme: "dark",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opt the page into static rendering for this locale.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
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
        <JsonLd data={websiteSchema()} />
        <JsonLd data={organizationSchema()} />
      </head>
      <body className="flex min-h-full flex-col bg-bg-base font-body text-text-primary pb-16 md:pb-0">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <HeaderProvider>
            <AppHeader />
            <div className="flex-1">{children}</div>
          </HeaderProvider>
          <MobileBottomNav />
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
