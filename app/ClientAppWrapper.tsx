"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "./AppShell";

export default function ClientAppWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthSurface = pathname === "/login" || pathname.startsWith("/auth/");

  return (
    <AuthProvider>
      <ThemeProvider>
        <main className="relative min-h-screen">
          {isAuthSurface ? children : <AppShell>{children}</AppShell>}
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}
