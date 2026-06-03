'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Shield, Mail, FileText, Settings, LogOut,
  StickyNote, Building2, ListChecks, ChevronLeft, Rocket,
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/app/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partners', label: 'Partners', icon: Building2 },
  { href: '/partnerships', label: 'Display', icon: Shield },
  { href: '/email', label: 'Email', icon: Mail },
  { href: '/interactions', label: 'Interactions', icon: ListChecks },
  { href: '/staff-notes', label: 'Staff Notes', icon: StickyNote },
  { href: '/activity-log', label: 'Activity Log', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarOverlay({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  if (!sidebarOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 transition-opacity duration-300"
      onClick={() => setSidebarOpen(false)}
      aria-hidden="true"
    />
  );
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
    onClose();
  };

  const handleNavClick = () => {
    onClose();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <SidebarOverlay sidebarOpen={isOpen} setSidebarOpen={onClose} />

      <aside
        aria-label="Main navigation"
        className={clsx(
          'fixed top-0 left-0 z-50 h-full overflow-hidden',
          'sidebar-glass',
          'transition-all duration-300 ease-in-out',
          'flex flex-col',
          collapsed ? 'sidebar-collapsed' : 'w-72'
        )}
      >
        {/* ─── BRAND ─── */}
        <div className="sidebar-brand flex items-center gap-3">
          <div className="sidebar-brand-icon">
            <Rocket size={16} className="text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="sidebar-brand-name">Mission Control</span>
            <span className="sidebar-brand-sub">Launchpad</span>
          </div>
          <button
            onClick={() => setCollapsed(v => !v)}
            className="sidebar-collapse-btn"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeftClose size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ─── SECTION HEADER ─── */}
        <div className="sidebar-section-header">Navigation</div>

        {/* ─── NAVIGATION ─── */}
        <nav className="sidebar-nav">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  data-tooltip={collapsed ? item.label : undefined}
                  className={clsx('sidebar-link', active && 'active')}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={16} strokeWidth={active ? 2 : 1.5} />
                  </span>
                  <span className="sidebar-link-label">{item.label}</span>
                  {active && <span className="sidebar-link-indicator" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ─── FOOTER: User + Logout ─── */}
        <div className="sidebar-footer">
          <div className={clsx(
            'flex items-center gap-2.5 px-2 py-1.5 rounded-lg',
            !collapsed && 'px-2.5'
          )}>
            <div className="sidebar-user-avatar">
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info flex flex-col min-w-0 flex-1">
              <span className="sidebar-user-name">
                {user?.fullName || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="sidebar-user-email">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-logout-link"
            data-tooltip={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span className="sidebar-logout-label">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function SidebarTrigger({ onClick, visible }: { onClick: () => void; visible: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed top-6 left-0 z-30',
        'flex items-center justify-center',
        'w-11 h-14 rounded-r-xl',
        'bg-gradient-to-r from-emerald-600 to-emerald-500',
        'border-0',
        'text-primary-foreground shadow-lg shadow-emerald-500/25',
        'hover:shadow-xl hover:shadow-emerald-500/30 hover:brightness-110',
        'active:brightness-95',
        'transition-all duration-200',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-label="Open sidebar"
    >
      <PanelLeft size={18} strokeWidth={2} />
    </button>
  );
}
