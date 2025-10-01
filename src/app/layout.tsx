import type { Metadata } from "next";
import "./globals.css";
import { PetSelectionProvider } from "@/contexts/PetSelectionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { FooterNav } from "@/components/FooterNav";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "aina-Life | 大切な家族との毎日を、もっと豊かに🐾",
  description: "ペットやお子様の食事や体調など、日々の記録を簡単管理。家族やパートナーと情報を共有し、健康管理をもっとスマートに。aina-Lifeで、大切な家族の成長を見守りましょう。",
  manifest: "/manifest.json",
  themeColor: "#000000",
  icons: {
    icon: "/icon-512x512.png",
    apple: "/icon-512x512.png",
  },
  openGraph: {
    title: "aina-Life | 大切な家族との毎日を、もっと豊かに🐾",
    description: "ペットやお子様の食事や体調など、日々の記録を簡単管理。家族やパートナーと情報を共有し、健康管理をもっとスマートに。aina-Lifeで、大切な家族の成長を見守りましょう。",
    url: "https://aina-life-dev.web.app",
    siteName: "aina-Life",
    images: [
      {
        url: "https://aina-life-dev.web.app/huku.png",
        width: 1070,
        height: 1070,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aina-Life | 大切な家族との毎日を、もっと豊かに🐾",
    description: "ペットやお子様の食事や体調など、日々の記録を簡単管理。家族やパートナーと情報を共有し、健康管理をもっとスマートに。aina-Lifeで、大切な家族の成長を見守りましょう。",
    images: ["https://aina-life-dev.web.app/huku.png"],
  },
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
            <main className="flex-grow pt-16 pb-16"> {/* Add padding-top for fixed header, padding-bottom for fixed footer */}
              {children}
            </main>
            <FooterNav />
            <ToastProvider />
          </PetSelectionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
