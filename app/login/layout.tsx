import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Launchpad Mission Control",
  description: "Staff Portal Login",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
