import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PetSelectionProvider } from "@/contexts/PetSelectionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";

export const metadata: Metadata = {
  title: "aina-Life",
  description: "Aina-Life is a pet care application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <PetSelectionProvider>
            <Header />
            <main className="flex-grow pb-16"> {/* Add padding-bottom equal to footer height */}
              {children}
            </main>
            <FooterNav />
          </PetSelectionProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
