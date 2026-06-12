'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Shield, Mail, FileText, Settings, LogOut,
  StickyNote, Building2, ListChecks, Users,
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/app/context/AuthContext';

const navGroups = [
  {
    label: 'Command',
    items: [
      { href: '/dashboard', label: 'Overview', description: 'Workspace pulse', icon: LayoutDashboard },
      { href: '/search', label: 'Global Search', description: 'Find records fast', icon: FileText },
    ],
  },
  {
    label: 'Relationships',
    items: [
      { href: '/partners', label: 'Partner Directory', description: 'Organizations', icon: Building2 },
      { href: '/partnerships', label: 'Partnership Display', description: 'Public profiles', icon: Shield },
      { href: '/interactions', label: 'Interactions', description: 'Outreach history', icon: ListChecks },
      { href: '/email', label: 'Email Studio', description: 'Partner outreach', icon: Mail },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/staff-notes', label: 'Staff Notes', description: 'Shared context', icon: StickyNote },
      { href: '/staff', label: 'Team Access', description: 'Members & roles', icon: Users },
      { href: '/activity-log', label: 'Audit Log', description: 'System events', icon: FileText },
      { href: '/settings', label: 'Settings', description: 'Preferences', icon: Settings },
    ],
  },
];

export function SidebarOverlay({ sidebarOpen, onClose }: { sidebarOpen: boolean; onClose: () => void }) {
  if (!sidebarOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

export default function Sidebar({
  isOpen,
  onClose,
  desktopClosed = false,
  onCloseDesktop,
}: {
  isOpen: boolean;
  onClose: () => void;
  desktopClosed?: boolean;
  onCloseDesktop?: () => void;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setCollapsed(false);
      }
    };

    if (mediaQuery.matches) {
      setCollapsed(false);
    }

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

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
      <SidebarOverlay sidebarOpen={isOpen} onClose={onClose} />

      <aside
        aria-label="Main navigation"
        className={clsx(
          'fixed inset-y-0 left-0 z-50 h-screen overflow-hidden',
          'sidebar-glass',
          'transition-transform duration-300 ease-in-out',
          'flex flex-col',
          'w-[var(--sidebar-width)]',
          desktopClosed && 'sidebar-desktop-closed',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          desktopClosed
            ? 'lg:hidden'
            : 'lg:sticky lg:top-0 lg:z-30 lg:translate-x-0',
          collapsed && 'sidebar-collapsed'
        )}
      >
        {/* ─── BRAND ─── */}
        <div className="sidebar-brand flex items-center gap-3">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <Image
              src="/launchpad-logo.webp"
              alt=""
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="sidebar-brand-name">Mission Control</span>
            <span className="sidebar-brand-sub">Launchpad</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onCloseDesktop?.();
              setCollapsed(false);
            }}
            className="sidebar-collapse-btn hidden lg:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ─── SECTION HEADER ─── */}
        {/* ─── NAVIGATION ─── */}
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="sidebar-nav-group">
              <div className="sidebar-section-header">{group.label}</div>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      data-tooltip={collapsed ? item.label : undefined}
                      className={clsx('sidebar-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30', active && 'active')}
                    >
                      <span className="sidebar-link-icon">
                        <Icon size={16} strokeWidth={active ? 2.2 : 1.7} />
                      </span>
                      <span className="sidebar-link-copy">
                        <span className="sidebar-link-label">{item.label}</span>
                        <span className="sidebar-link-description">{item.description}</span>
                      </span>
                      {active && <span className="sidebar-link-indicator" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ─── FOOTER: User + Logout ─── */}
        <div className="sidebar-footer">
          <div className={clsx(
            'flex items-center gap-3 px-2 py-1.5 rounded-lg',
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
            className="sidebar-logout-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
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

export function SidebarTrigger({
  onClick,
  visible,
  desktopVisible = false,
}: {
  onClick: () => void;
  visible: boolean;
  desktopVisible?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed left-3 top-3 z-30',
        'flex items-center justify-center',
        'h-11 w-11 rounded-xl',
        'bg-card',
        'border border-border',
        'text-foreground shadow-sm',
        'hover:bg-muted hover:border-primary/40',
        'active:translate-y-px',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'transition-all duration-200',
        desktopVisible && 'sidebar-trigger-desktop-visible',
        visible
          ? 'opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none'
          : 'opacity-0 pointer-events-none',
        desktopVisible && 'lg:opacity-100 lg:pointer-events-auto'
      )}
      aria-label="Open sidebar"
    >
      <PanelLeft size={20} strokeWidth={2} />
    </button>
  );
}
