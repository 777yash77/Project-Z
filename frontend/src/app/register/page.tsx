'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/auth/register', form);
      router.push('/login');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950/95 shadow-2xl shadow-fuchsia-500/10 ring-1 ring-white/10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 p-10 text-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_40%)]"></div>
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-[0.3em] text-white/80">Join the team</p>
              <h1 className="mt-6 text-4xl font-semibold">Create your access</h1>
              <p className="mt-4 max-w-md text-base text-white/90">Sign up to manage employees, review risk scoring, and import CSV data with confidence.</p>
              <div className="mt-10 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-xl">
                <p className="text-sm text-white/90">Fast onboarding, secure auth, and a bright HR analytics workspace.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 p-10">
            <h2 className="text-3xl font-semibold text-white">Create account</h2>
            <p className="mt-2 text-sm text-slate-400">Register and start tracking employee retention risk.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Username</label>
                <input className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-fuchsia-400" placeholder="your username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Email</label>
                <input className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Password</label>
                <input className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400" placeholder="choose a strong password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="w-full rounded-3xl bg-gradient-to-r from-fuchsia-500 to-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Register</button>
            </form>
            {message && <p className="mt-4 rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</p>}
            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account? <a className="font-semibold text-cyan-300 hover:text-cyan-200" href="/login">Sign in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
