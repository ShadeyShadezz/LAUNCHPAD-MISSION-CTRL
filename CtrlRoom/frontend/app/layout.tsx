import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/app/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";

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
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
