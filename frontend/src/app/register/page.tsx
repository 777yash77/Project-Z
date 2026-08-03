'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyRegister } from '../dashboard/api';
import { ThemeToggle } from '../theme-toggle';
import { useTheme } from '../theme-provider';
import { AuthGuard } from '../auth-guard';
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react';

type Step = 'form' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({ username: '', email: '', password: '', organizationName: '' });
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const panelBg      = isLight ? 'linear-gradient(135deg,#d4ede0 0%,#e8f6ee 50%,#c8e8d8 100%)' : 'linear-gradient(135deg,#001a0a 0%,#030e06 50%,#000 100%)';
  const headingColor = isLight ? '#0f172a' : '#ffffff';
  const subColor     = isLight ? '#1e293b' : '#cbd5e1';
  const cardBg       = isLight ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.30)';
  const cardBorder   = isLight ? 'rgba(0,135,74,0.25)' : 'rgba(0,255,136,0.20)';
  const dotColor     = isLight ? '#006b38' : '#00ff88';
  const accentText   = isLight ? '#046c38' : '#00ff88';
  const inputBg      = isLight ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.50)';
  const inputText    = isLight ? '#0f172a' : '#ffffff';
  const inputBorder  = isLight ? 'rgba(0,135,74,0.35)' : 'rgba(0,255,136,0.25)';
  const labelColor   = isLight ? '#046c38' : '#34d399';
  const dividerBg    = isLight ? 'rgba(0,135,74,0.25)' : 'rgba(0,255,136,0.20)';
  const dividerText  = isLight ? '#334155' : '#cbd5e1';
  const btnBg        = isLight ? '#00874a' : '#00ff88';
  const btnHoverBg   = isLight ? '#006b38' : '#00e07a';
  const footerText   = isLight ? '#334155' : '#cbd5e1';
  const otpBoxBg     = isLight ? '#ffffff' : '#000000';
  const otpBoxBorder = isLight ? 'rgba(0,135,74,0.30)' : 'rgba(0,255,136,0.20)';
  const otpFocusBorder = isLight ? '#00874a' : '#00ff88';

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await sendOtp({
        email: form.email,
        username: form.username,
        purpose: 'REGISTER',
      });
      setMaskedEmail(res.data.maskedEmail || '');
      setStep('otp');
      startResendCooldown();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP + create account ───────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setMessage('Please enter the full 6-digit code.'); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await verifyRegister({ ...form, otp: code });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentOrganization', res.data.organization || '');
      router.push('/dashboard');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box keyboard handling ─────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every(d => d !== '')) {
      const form = otpRefs.current[0]?.closest('form');
      form?.requestSubmit();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await sendOtp({ email: form.email, username: form.username, purpose: 'REGISTER' });
      setMaskedEmail(res.data.maskedEmail || '');
      setMessage('A new OTP has been sent.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startResendCooldown();
    } catch { setMessage('Failed to resend OTP.'); } finally { setLoading(false); }
  };

  const fields = [
    { id: 'register-username', label: 'Username', placeholder: 'your username', key: 'username', type: 'text' },
    { id: 'register-email', label: 'Email', placeholder: 'you@example.com', key: 'email', type: 'email' },
    { id: 'register-org', label: 'Organization', placeholder: 'Acme Corp', key: 'organizationName', type: 'text' },
    { id: 'register-password', label: 'Password', placeholder: 'choose a strong password', key: 'password', type: 'password' },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{ backgroundColor: 'var(--bg-base)' }}>
      <AuthGuard />
      <div className="fixed right-4 top-4 z-50"><ThemeToggle /></div>

      {/* Background */}
      <div className="absolute inset-0 dot-pattern" style={{ backgroundColor: 'var(--bg-base)' }} />
      <div className="absolute right-[-10%] top-[-5%] h-96 w-96 rounded-full blur-[100px]"
        style={{ backgroundColor: isLight ? 'rgba(0,135,74,0.12)' : 'rgba(0,255,136,0.05)' }} />
      <div className="absolute bottom-[-10%] left-[-5%] h-80 w-80 rounded-full blur-[80px]"
        style={{ backgroundColor: isLight ? 'rgba(0,135,74,0.08)' : 'rgba(0,255,136,0.04)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-5xl animate-fade-in overflow-hidden rounded-[2rem] backdrop-blur-xl"
        style={{
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: isLight ? '0 40px 100px rgba(0,100,50,0.12)' : '0 40px 100px rgba(0,0,0,0.60)',
        }}>
        <div className="grid lg:grid-cols-2">

          {/* Left — Form or OTP */}
          <div className="p-8 sm:p-10 lg:p-12" style={{ backgroundColor: 'var(--bg-surface)' }}>

            {/* ── STEP 1: Registration form ── */}
            {step === 'form' && (
              <>
                <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ border: `1px solid ${cardBorder}`, backgroundColor: isLight ? 'rgba(0,135,74,0.10)' : 'rgba(0,255,136,0.08)', color: accentText }}>
                  New account
                </div>
                <h1 className="mt-5 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Create account</h1>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Fill in your details — we'll send a code to verify your email.</p>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                  <span className="text-xs uppercase tracking-[0.3em]" style={{ color: dividerText }}>step 1 of 2</span>
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                </div>

                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  {fields.map(field => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: labelColor }}>{field.label}</label>
                      <input
                        id={field.id}
                        type={field.type}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                        style={{ border: `1px solid ${inputBorder}`, backgroundColor: inputBg, color: inputText }}
                        placeholder={field.placeholder}
                        value={(form as any)[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        required
                      />
                    </div>
                  ))}
                  <button
                    id="register-send-otp"
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: btnBg }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = btnHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = btnBg)}
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</> : <>Send Verification Code <Mail size={16} /></>}
                  </button>
                </form>

                {message && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{message}</div>
                )}
                <div className="mt-6 text-center text-sm" style={{ color: footerText }}>
                  Already have an account?{' '}
                  <a href="/login" className="font-semibold hover:underline" style={{ color: accentText }}>Sign in</a>
                </div>
              </>
            )}

            {/* ── STEP 2: OTP verification ── */}
            {step === 'otp' && (
              <>
                <button
                  onClick={() => { setStep('form'); setMessage(''); setOtp(['', '', '', '', '', '']); }}
                  className="mb-6 flex items-center gap-2 text-sm transition hover:opacity-70"
                  style={{ color: accentText }}
                >
                  <ArrowLeft size={15} /> Back
                </button>

                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ border: `1px solid ${cardBorder}`, backgroundColor: isLight ? 'rgba(0,135,74,0.10)' : 'rgba(0,255,136,0.08)', color: accentText }}>
                  <Mail size={10} /> Verify email
                </div>

                <h2 className="mt-5 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Check your inbox</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  We sent a 6-digit code to <strong style={{ color: accentText }}>{maskedEmail || form.email}</strong>.<br />
                  Enter it to complete registration.
                </p>

                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                  <span className="text-xs uppercase tracking-[0.3em]" style={{ color: dividerText }}>step 2 of 2</span>
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        id={`reg-otp-box-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="h-14 w-12 rounded-xl text-center text-xl font-bold outline-none transition"
                        style={{
                          border: `2px solid ${digit ? otpFocusBorder : otpBoxBorder}`,
                          backgroundColor: otpBoxBg,
                          color: isLight ? '#0d1f14' : '#00ff88',
                          boxShadow: digit ? `0 0 12px ${isLight ? 'rgba(0,135,74,0.25)' : 'rgba(0,255,136,0.20)'}` : 'none',
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = otpFocusBorder)}
                        onBlur={e => (e.currentTarget.style.borderColor = otp[i] ? otpFocusBorder : otpBoxBorder)}
                      />
                    ))}
                  </div>

                  <button
                    id="register-verify-otp"
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: btnBg }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = btnHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = btnBg)}
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Verify & Create Account'}
                  </button>
                </form>

                {message && (
                  <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${message.includes('sent') ? 'border-green-500/20 bg-green-500/10 text-green-600' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>
                    {message}
                  </div>
                )}

                <div className="mt-5 text-center">
                  <button onClick={handleResend} disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1.5 mx-auto text-sm transition disabled:opacity-40"
                    style={{ color: accentText }}>
                    <RefreshCw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Panel */}
          <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12" style={{ background: panelBg }}>
            <div className="absolute inset-0 dot-pattern opacity-30" />
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: isLight ? 'rgba(0,135,74,0.15)' : 'rgba(0,255,136,0.10)' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em]"
                style={{ border: `1px solid ${cardBorder}`, backgroundColor: cardBg, color: accentText }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                Join the team
              </div>
              <h2 className="mt-8 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: headingColor }}>
                Start your<br /><span style={{ color: accentText }}>journey.</span>
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: subColor }}>
                Create your workspace in minutes and gain immediate access to intelligent HR analytics.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  { label: 'Risk Scoring', desc: 'Automatic per employee' },
                  { label: 'CSV Import', desc: 'Batch upload ready' },
                  { label: 'Trade Window', desc: 'Cross-HR visibility' },
                  { label: 'Live Dashboard', desc: 'Real-time insights' },
                ].map(feat => (
                  <div key={feat.label} className="rounded-2xl p-4" style={{ border: `1px solid ${cardBorder}`, backgroundColor: cardBg }}>
                    <p className="text-sm font-semibold" style={{ color: headingColor }}>{feat.label}</p>
                    <p className="mt-1 text-xs" style={{ color: subColor }}>{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
