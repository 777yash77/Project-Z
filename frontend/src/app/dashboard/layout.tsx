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
  Bell,
  Search,
  Menu,
  HelpCircle
} from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';

import { useEffect, useState } from 'react';
import { getMe } from './api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/feed', label: 'Feed', icon: Share2 },
  { href: '/dashboard/employees', label: 'Directory', icon: Users },
  { href: '/dashboard/org', label: 'Organisation', icon: Building2 },
  { href: '/dashboard/trading-window', label: 'Trading', icon: ArrowRightLeft },
  { href: '/dashboard/my-profile', label: 'Profile', icon: UserCheck },
  { href: '/dashboard/upload', label: 'Upload', icon: UploadCloud },
  { href: '/dashboard/hire', label: 'Recruitment', icon: BriefcaseBusiness },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageCircleMore },
  { href: '/dashboard/help', label: 'Help', icon: HelpCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-6" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-dashed" style={{ borderColor: 'var(--accent)' }} />
        <h2 className="text-lg font-bold">Session Verification</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active session found. Redirecting to sign in...</p>
        <a href="/login" className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-black transition hover:opacity-90" style={{ backgroundColor: 'var(--accent)' }}>
          Click here to Sign In
        </a>
      </div>
    );
  }

  const filteredNavItems = navItems.filter((item) => {
    const role = userInfo?.role;
    if (!role) return false;
    
    // Help is visible to everyone
    if (item.href === '/dashboard/help') return true;
    
    if (role === 'EMPLOYEE') {
      return ['/dashboard/feed', '/dashboard/my-profile', '/dashboard/messages', '/dashboard/trading-window'].includes(item.href);
    }
    if (role === 'HR') {
      return !['/dashboard/org', '/dashboard/my-profile'].includes(item.href);
    }
    if (role === 'ORGANISATION') {
      return !['/dashboard/my-profile'].includes(item.href);
    }
    return false;
  });

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Top Navigation Bar */}
      <header
        className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-4 md:px-8 shadow-sm backdrop-blur-md"
        style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)' }}
      >
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg shadow-[0_0_12px_var(--accent-glow)] transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span className="text-sm font-black text-black">EP</span>
            </div>
          </div>
          
          {/* Search bar (desktop) */}
          <div className="hidden lg:flex items-center bg-[var(--bg-card)] rounded-md px-3 py-1.5 border border-[var(--border-subtle)] focus-within:border-[var(--accent)] transition-colors w-64">
            <Search size={16} className="text-[var(--text-muted)] mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)] placeholder-[var(--text-faint)]"
            />
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center h-full gap-1 lg:gap-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="group relative flex flex-col items-center justify-center h-full px-3 lg:px-4 min-w-[70px] transition-colors"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                <div className="flex flex-col items-center gap-1 transition-transform group-hover:-translate-y-0.5">
                  <Icon size={20} className="transition-colors group-hover:text-[var(--text-primary)]" style={{ color: active ? 'var(--accent)' : 'inherit' }} />
                  <span className="text-[10px] font-medium hidden lg:block group-hover:text-[var(--text-primary)]" style={{ color: active ? 'var(--text-primary)' : 'inherit' }}>{item.label}</span>
                </div>
                {/* Active Indicator Line */}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-sm"
                    style={{ backgroundColor: 'var(--accent)', boxShadow: '0 -2px 8px var(--accent-glow)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Profile, Theme, Mobile Menu Toggle */}
        <div className="flex items-center gap-3 h-full">
          <ThemeToggle />
          
          {/* Divider */}
          <div className="hidden md:block h-8 w-px bg-[var(--border-subtle)] mx-1" />

          {/* User Profile Dropdown Toggle */}
          <div className="relative h-full flex items-center">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
              className="flex flex-col items-center justify-center gap-1 h-full px-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-7 w-7 rounded-full border-2 border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-center overflow-hidden">
                <UserCheck size={14} className="text-[var(--text-muted)]" />
              </div>
              <span className="text-[10px] font-medium text-[var(--text-muted)] hidden md:flex items-center gap-1">
                Me <span className="text-[8px]">▼</span>
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-0 w-64 rounded-bl-xl rounded-br-xl border border-[var(--border-subtle)] shadow-xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="p-4 border-b border-[var(--border-subtle)] flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-card)] flex items-center justify-center flex-shrink-0">
                    <UserCheck size={24} className="text-[var(--accent)]" />
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{userInfo?.username}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{userInfo?.email}</p>
                  </div>
                </div>
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-[var(--text-muted)] bg-[var(--bg-card)] rounded-md mb-2">
                    Role: <span className="font-semibold text-[var(--accent)]">{userInfo?.role || 'CONNECTED'}</span>
                  </div>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--bg-card)] hover:text-red-400"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-b border-[var(--border-subtle)] p-4 shadow-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <nav className="flex flex-col gap-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Page Header (optional, for context) */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Enterprise Platform</span>
          <span style={{ color: 'var(--text-faint)' }}>/</span>
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {pathname.replace('/dashboard/', '').replace('/dashboard', 'Overview')}
          </span>
        </div>
        
        {children}
      </main>
    </div>
  );
}
