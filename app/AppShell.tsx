"use client";
import Sidebar, { SidebarTrigger } from "./components/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthSurface = pathname === "/login" || pathname.startsWith("/auth/");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthSurface) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen w-full lg:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SidebarTrigger onClick={() => setSidebarOpen(true)} visible={!sidebarOpen} />
      <div className="min-w-0 flex-1 px-3 pb-3 pt-20 sm:px-4 lg:p-4 lg:pt-4">
        {children}
      </div>
    </div>
  );
}
