import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pensezy Edition | La référence du livre physique et numérique",
  description: "Plateforme hybride de vente de livres au Cameroun. Achetez des livres physiques ou lisez instantanément nos e-books sécurisés.",
  keywords: ["livres cameroun", "littérature africaine", "e-books", "librairie en ligne"],
  authors: [{ name: "Pensezy Edition" }],
  openGraph: {
    title: "Pensezy Edition",
    description: "La plateforme de référence pour la littérature camerounaise",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}