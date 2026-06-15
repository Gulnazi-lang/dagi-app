import type { Metadata, Viewport } from "next";
import { Golos_Text, Unbounded } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";

const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dud.lv"),
  title: "DUD — Domā un Dari",
  description: "Atrodi, ar ko pavadīt laiku tuvumā — kafija, sports, pastaigas. · Найди, с кем провести время рядом — кофе, спорт, прогулки. · Find people to spend time with nearby — coffee, sport, walks.",
  manifest: "/manifest.json",
  openGraph: {
    title: "DUD — Domā un Dari",
    description: "Atrodi, ar ko pavadīt laiku tuvumā — kafija, sports, pastaigas. · Найди, с кем провести время рядом — кофе, спорт, прогулки. · Find people to spend time with nearby — coffee, sport, walks.",
    url: "https://www.dud.lv",
    siteName: "DUD",
    images: [{ url: "/og2.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DUD — Domā un Dari",
    description: "Atrodi, ar ko pavadīt laiku tuvumā — kafija, sports, pastaigas. · Найди, с кем провести время рядом — кофе, спорт, прогулки. · Find people to spend time with nearby — coffee, sport, walks.",
    images: ["/og2.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DUD",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${golos.variable} ${unbounded.variable} h-full`}>
      <body className="min-h-full">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
