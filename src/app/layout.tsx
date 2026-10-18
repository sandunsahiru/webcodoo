import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webcodoo - Digital Tool Subscriptions",
  description:
    "Premium digital tool subscriptions — Quillbot, StealthWriter, JetBrains, Figma, MS Office & more at the best prices in Sri Lanka.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <ThemeProvider>
            {children}
            <WhatsAppWidget />
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
