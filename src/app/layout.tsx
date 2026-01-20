import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pensezy Edition - Librairie Hybride",
  description: "Achetez des livres physiques et numériques en toute simplicité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
