'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UploadCloud, LogOut, ArrowRightLeft, BriefcaseBusiness, MessageCircleMore, UserCheck } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

import { useEffect, useState } from 'react';
import { getMe } from './api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/employees', label: 'Employee Directory', icon: Users },
  { href: '/dashboard/profile', label: 'HR Profile', icon: UserCheck },
  { href: '/dashboard/upload', label: 'Bulk Upload', icon: UploadCloud },
  { href: '/dashboard/trade', label: 'Trade Window', icon: ArrowRightLeft },
  { href: '/dashboard/hire', label: 'Hire View', icon: BriefcaseBusiness },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageCircleMore },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    getMe()
      .then(() => setAuthenticated(true))
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/login');
      });
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dashed" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <aside
        className="relative flex w-72 flex-shrink-0 flex-col px-5 py-7"
        style={{ borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Top glow */}
        <div className="pointer-events-none absolute left-0 top-0 h-48 w-full"
          style={{ background: 'linear-gradient(to bottom, var(--accent-glow), transparent)' }} />

        {/* Logo */}
        <div className="relative mb-8 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_0_16px_var(--accent-glow)]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <span className="text-sm font-black text-black">HR</span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>HR Intelligence</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_5px_var(--accent)]"
                style={{ backgroundColor: 'var(--accent)' }} />
              <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>Live</span>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--text-faint)' }}>Navigation</p>

        {/* Nav Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: active ? 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent)' : 'none',
                }}
              >
                <Icon size={17} style={{ color: active ? 'var(--accent)' : 'var(--text-faint)' }} />
                {item.label}
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-6 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Info box */}
        <div
          className="rounded-2xl p-4"
          style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-faint)' }}>Quick Insight</p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Risk scores sync automatically with every employee update, CSV import, and trade event.
          </p>
        </div>

        {/* Sign out */}
        <button
          id="sidebar-signout"
          className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:text-red-400"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          onClick={handleSignOut}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Top bar with theme toggle */}
        <header
          className="flex items-center justify-end px-6 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          <ThemeToggle />
        </header>

        <main className="flex-1 p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
