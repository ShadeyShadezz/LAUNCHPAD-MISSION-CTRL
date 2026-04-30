'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Mail, Settings, Shield, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/app/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partners', label: 'Partners', icon: Users },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/interactions', label: 'Interactions Log', icon: Mail },
  { href: '/email', label: 'Email Terminal', icon: Mail },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
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
    <aside className="w-64 min-h-screen flex flex-col bg-slate-700 border-r border-slate-600">
      {/* Logo */}
      <div className="p-4 border-b border-slate-600">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-md flex items-center justify-center font-semibold text-sm bg-cyan-500 text-white">
            LMC
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-sm text-white leading-tight">Launchpad</h1>
            <p className="text-xs text-slate-300 mt-0.5">Mission Control</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors font-medium',
                isActive
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:bg-slate-600 hover:text-cyan-400'
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-slate-600 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-slate-400">Staff</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-slate-600 text-slate-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

