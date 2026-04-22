import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Launchpad Mission Control",
  description: "Shared staff workspace for partnership management and student outreach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: "var(--background)" }}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto" style={{ backgroundColor: "var(--background)" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
