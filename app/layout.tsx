import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { AppShell } from "@/components/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Paper & Ink - Beautiful Stationery",
  description: "Curated stationery and writing supplies for everyday creativity",
  keywords: ["stationery", "notebooks", "pens", "planners", "art supplies", "paper"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased flex flex-col min-h-screen`}>
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
