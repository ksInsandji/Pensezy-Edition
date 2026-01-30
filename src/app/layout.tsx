"use client"; // Obligatoire pour utiliser usePathname

//import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

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

/*export const metadata: Metadata = {
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
};*/

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 2. On récupère l'URL actuelle
  const pathname = usePathname();

  // 3. On définit si on est dans l'espace Admin ou Vendeur
  const isAdminPage = pathname?.startsWith("/admin");
  const isSellerPage = pathname?.startsWith("/seller");
  const isDashboard = isAdminPage || isSellerPage;

  return (
    <html 
      lang="fr" 
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white" suppressHydrationWarning>
        {/* 4. On affiche la Navbar uniquement si on n'est PAS sur un dashboard */}
        {!isAdminPage && <Navbar />}

        <main className="flex-1">
          {children}
        </main>

        {/* 4. On affiche la Navbar uniquement si on n'est PAS sur un dashboard */}
        {!isAdminPage && <Footer />}
        <Toaster />
      </body>
    </html>
  );
}