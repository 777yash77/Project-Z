'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950/95 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 p-10 text-white">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.28),_transparent_45%)]"></div>
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/80">Employee retention</p>
              <h1 className="mt-6 text-4xl font-semibold">Welcome back</h1>
              <p className="mt-4 max-w-md text-base text-cyan-100/90">Login to your HR command center with a brighter, faster retention insight experience.</p>
              <div className="mt-10 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-xl">
                <p className="text-sm text-cyan-50/90">Track employee risk, import smart CSV data, and preview key metrics on a polished dashboard.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-950 p-10">
            <h2 className="text-3xl font-semibold text-white">Sign in</h2>
            <p className="mt-2 text-sm text-slate-400">Start your work session with secure access and instant insights.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Username</label>
                <input className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Password</label>
                <input className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-fuchsia-400" placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-violet-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Login</button>
            </form>
            {message && <p className="mt-4 rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{message}</p>}
            <div className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account? <a className="font-semibold text-cyan-300 hover:text-cyan-200" href="/register">Create one</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
