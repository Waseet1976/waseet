import type { Metadata } from "next";
import { Sora, Lora, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Waseet - Plateforme Immobilière",
    template: "%s | Waseet",
  },
  description:
    "Waseet est la plateforme SaaS immobilière complète pour les agents et agences : gestion des biens, clients, contrats et transactions.",
  keywords: ["immobilier", "agence", "CRM", "gestion biens", "Belgique"],
  authors: [{ name: "Waseet" }],
  creator: "Waseet",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: "/",
    title: "Waseet - Plateforme Immobilière",
    description: "Gérez votre activité immobilière avec Waseet",
    siteName: "Waseet",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sora.variable} ${lora.variable} ${playfair.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
