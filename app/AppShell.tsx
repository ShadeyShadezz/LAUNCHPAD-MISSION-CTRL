"use client";
import Sidebar, { SidebarTrigger } from "./components/sidebar";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 h-full flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SidebarTrigger onClick={() => setSidebarOpen(true)} visible={!sidebarOpen} />
      <div className="flex-1 h-full flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
