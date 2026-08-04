'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  LogOut,
  ArrowRightLeft,
  BriefcaseBusiness,
  MessageCircleMore,
  UserCheck,
  Building2,
  Share2,
  FileText,
  Bell
} from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

import { useEffect, useState } from 'react';
import { getMe } from './api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/feed', label: 'LinkedIn Feed', icon: Share2 },
  { href: '/dashboard/employees', label: 'Employee Directory', icon: Users },
  { href: '/dashboard/org', label: 'Organisation Portal', icon: Building2 },
  { href: '/dashboard/trading-window', label: 'Talent Trading Window', icon: ArrowRightLeft },
  { href: '/dashboard/my-profile', label: 'My Enterprise Profile', icon: UserCheck },
  { href: '/dashboard/upload', label: 'Bulk Upload', icon: UploadCloud },
  { href: '/dashboard/hire', label: 'Recruitment Hub', icon: BriefcaseBusiness },
  { href: '/dashboard/messages', label: 'Direct Messages', icon: MessageCircleMore },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    getMe()
      .then((res) => {
        setAuthenticated(true);
        setUserInfo(res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/login');
      });
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-dashed" style={{ borderColor: 'var(--accent)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Verifying session & redirecting...</p>
        <a href="/login" className="text-xs font-bold underline" style={{ color: 'var(--accent)' }}>Click here to return to Login</a>
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
        <div
          className="pointer-events-none absolute left-0 top-0 h-48 w-full"
          style={{ background: 'linear-gradient(to bottom, var(--accent-glow), transparent)' }}
        />

        {/* Logo & Platform Title */}
        <div className="relative mb-8 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_18px_var(--accent-glow)]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <span className="text-base font-black text-black">EP</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Enterprise HCM</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full shadow-[0_0_5px_var(--accent)]"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--text-faint)' }}>
                {userInfo?.role || 'CONNECTED'}
              </span>
            </div>
          </div>
        </div>

        {/* User Info Capsule */}
        {userInfo && (
          <div className="mb-6 rounded-xl p-3 text-xs" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'color-mix(in srgb, var(--accent) 4%, transparent)' }}>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{userInfo.username}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{userInfo.email}</p>
            <p className="mt-1 text-[10px] font-medium" style={{ color: 'var(--accent)' }}>{userInfo.organization || 'Independent Enterprise'}</p>
          </div>
        )}

        {/* Nav label */}
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--text-faint)' }}>Platform Modules</p>

        {/* Nav Items */}
        <nav className="space-y-1 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: active ? 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent)' : 'none',
                }}
              >
                <Icon size={16} style={{ color: active ? 'var(--accent)' : 'var(--text-faint)' }} />
                <span>{item.label}</span>
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
        <div className="my-4 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

        {/* Sign out */}
        <button
          id="sidebar-signout"
          className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition hover:text-red-400"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Enterprise Platform</span>
            <span style={{ color: 'var(--text-faint)' }}>/</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              {pathname.replace('/dashboard/', '').replace('/dashboard', 'Overview')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
