'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Mail, Settings, Shield, LogOut, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/app/context/AuthContext';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partners', label: 'Partners', icon: Users },
  { href: '/interactions', label: 'Interactions Log', icon: Mail },
  { href: '/email', label: 'Email Terminal', icon: Mail },
  { href: '/activity-log', label: 'Activity Log', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className="sidebar fixed md:relative md:translate-x-0 h-screen z-40"
        style={{
          backgroundColor: 'var(--sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header - Logo */}
          <div
            className="sidebar-header"
            style={{
              borderBottom: '1px solid var(--sidebar-border)',
            }}
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
            >
              <div
                className="sidebar-logo flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                }}
              >
                LMC
              </div>
              <div className="sidebar-title min-w-0">
                <h1 className="font-semibold text-sm leading-tight" style={{ color: 'var(--sidebar-foreground)' }}>
                  Launchpad
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Mission Control
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}

                  className={clsx(
                    'nav-item flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all'
                  )}
                  style={{
                    backgroundColor: isActive ? 'var(--sidebar-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--sidebar-foreground)',
                    boxShadow: isActive ? '0 2px 8px rgba(14, 165, 164, 0.2)' : 'none',
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer - User */}
          <div
            className="sidebar-footer p-3 space-y-3"
            style={{
              borderTop: '1px solid var(--sidebar-border)',
            }}
          >
            <div
              className="user-card flex items-center gap-3 p-3 rounded-md"
              style={{
                backgroundColor: 'var(--sidebar-hover)',
              }}
            >
              <div
                className="user-avatar flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                }}
              >
                {user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info flex-1 min-w-0">
                <p className="text-sm font-medium m-0 truncate" style={{ color: 'var(--sidebar-foreground)' }}>
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs m-0 mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Staff
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: 'var(--hover-bg)',
                color: 'var(--sidebar-foreground)',
                border: '1px solid var(--sidebar-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                e.currentTarget.style.color = 'var(--sidebar-foreground)';
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};

export default Sidebar;

