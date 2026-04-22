'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, Settings, BarChart3, Shield, Mail } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/partners', label: 'Partners Directory', icon: Users },
    { href: '/students', label: 'Students Directory', icon: Users },
    { href: '/interactions', label: 'Interactions Log', icon: LogOut },
    { href: '/email', label: 'Email Composer', icon: Mail },
    { href: '/integrations/gmail', label: 'Gmail AI', icon: Mail },

    { href: '/admin', label: 'Admin Controls', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="w-64 min-h-screen shadow-lg overflow-y-auto flex flex-col"
      style={{ backgroundColor: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{
              backgroundColor: "var(--sidebar-primary)",
              color: "var(--sidebar-primary-foreground)"
            }}
          >
            LMC
          </div>
          <div>
            <h1 className="font-bold text-lg" style={{ color: "var(--sidebar-foreground)" }}>
              Launchpad
            </h1>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Mission Control
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isActive ? "var(--sidebar-primary)" : "transparent",
                color: isActive ? "var(--sidebar-primary-foreground)" : "var(--sidebar-foreground)",
              }}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(14, 165, 164, 0.1)" }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">Welcome Sarah</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4">
        <Link
          href="/login"
          className="w-full px-4 py-2 rounded-lg font-medium text-center transition-all duration-200"
          style={{
            backgroundColor: "var(--destructive)",
            color: "var(--destructive-foreground)"
          }}
        >
          Logout
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
