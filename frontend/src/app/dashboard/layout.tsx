'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UploadCloud, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/employees', label: 'Employee Directory', icon: Users },
  { href: '/dashboard/upload', label: 'Bulk Upload', icon: UploadCloud },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-80 border-r border-slate-800 bg-slate-950/95 p-6 backdrop-blur-xl">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> LIVE
          </div>
          <h1 className="text-2xl font-semibold">HR Intelligence</h1>
          <p className="mt-2 text-sm text-slate-400">Retention & decision support</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? 'bg-cyan-500/15 text-cyan-300 shadow-sm shadow-cyan-500/10' : 'text-slate-300 hover:bg-slate-800/80'}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quick insight</p>
          <p className="mt-3 text-sm text-slate-300">The platform syncs employee risk scoring with every save and CSV upload.</p>
        </div>
        <button
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
          onClick={() => localStorage.removeItem('token')}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 xl:p-10">{children}</main>
    </div>
  );
}
