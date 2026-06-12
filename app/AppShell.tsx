"use client";
import Sidebar, { SidebarTrigger } from "./components/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthSurface = pathname === "/login" || pathname.startsWith("/auth/");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarClosed, setSidebarClosed] = useState(false);

  if (isAuthSurface) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen w-full bg-background lg:flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        desktopClosed={sidebarClosed}
        onCloseDesktop={() => setSidebarClosed(true)}
      />
      <SidebarTrigger
        onClick={() => {
          setSidebarOpen(true);
          setSidebarClosed(false);
        }}
        visible={!sidebarOpen}
        desktopVisible={sidebarClosed}
      />
      <div className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-5 sm:pb-7 lg:px-8 lg:pb-8 lg:pt-6">
        {children}
      </div>
    </div>
  );
}
