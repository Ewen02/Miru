import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miru — Explorer, Organiser, Partager",
  description:
    "Plateforme anime — explorer les trending, organiser ta watchlist, partager tes découvertes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-full bg-bg-base font-body text-text-primary">{children}</body>
    </html>
  );
}
