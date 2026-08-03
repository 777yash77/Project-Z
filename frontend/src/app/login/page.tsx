'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyLogin } from '../dashboard/api';
import { ThemeToggle } from '../theme-toggle';
import { useTheme } from '../theme-provider';
import { AuthGuard } from '../auth-guard';
import { ArrowLeft, Loader2, Mail, RefreshCw } from 'lucide-react';

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [step, setStep] = useState<Step>('credentials');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const email = usernameOrEmail.includes('@') ? usernameOrEmail : '';
      const res = await sendOtp({
        email: email || usernameOrEmail,
        usernameOrEmail,
        password,
        purpose: 'LOGIN',
      });
      setMaskedEmail(res.data.maskedEmail || '');
      setStep('otp');
      startResendCooldown();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to send OTP. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP + login ────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setMessage('Please enter the full 6-digit code.'); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await verifyLogin({ usernameOrEmail, password, otp: code });
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
      // Auto-submit
      const form = otpRefs.current[0]?.closest('form');
      form?.requestSubmit();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Resend cooldown ────────────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await sendOtp({ email: usernameOrEmail, usernameOrEmail, password, purpose: 'LOGIN' });
      setMaskedEmail(res.data.maskedEmail || '');
      setMessage('A new OTP has been sent to your email.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      startResendCooldown();
    } catch (err: any) {
      setMessage('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
      style={{ backgroundColor: 'var(--bg-base)' }}>
      <AuthGuard />

      {/* Theme toggle */}
      <div className="fixed right-4 top-4 z-50"><ThemeToggle /></div>

      {/* Background */}
      <div className="absolute inset-0 dot-pattern" style={{ backgroundColor: 'var(--bg-base)' }} />
      <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full blur-[100px]"
        style={{ backgroundColor: isLight ? 'rgba(0,135,74,0.12)' : 'rgba(0,255,136,0.05)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] h-80 w-80 rounded-full blur-[80px]"
        style={{ backgroundColor: isLight ? 'rgba(0,135,74,0.08)' : 'rgba(0,255,136,0.04)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-5xl animate-fade-in overflow-hidden rounded-[2rem] backdrop-blur-xl"
        style={{
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: isLight ? '0 40px 100px rgba(0,100,50,0.12)' : '0 40px 100px rgba(0,0,0,0.60)',
        }}>
        <div className="grid lg:grid-cols-2">

          {/* Left Panel */}
          <div className="relative overflow-hidden p-8 sm:p-10 lg:p-12" style={{ background: panelBg }}>
            <div className="absolute inset-0 dot-pattern opacity-30" />
            <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: isLight ? 'rgba(0,135,74,0.15)' : 'rgba(0,255,136,0.10)' }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em]"
                style={{ border: `1px solid ${cardBorder}`, backgroundColor: cardBg, color: accentText }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                HR Intelligence
              </div>
              <h1 className="mt-8 text-4xl font-bold leading-tight sm:text-5xl" style={{ color: headingColor }}>
                Welcome<br /><span style={{ color: accentText }}>back.</span>
              </h1>
              <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: subColor }}>
                Sign in securely with your credentials and a one-time verification code.
              </p>
              <div className="mt-10 space-y-3">
                {[
                  { title: 'Live risk analytics', desc: 'Track risk trends and team health instantly.' },
                  { title: 'Smart CSV uploads', desc: 'Import data and score it in seconds.' },
                  { title: 'Cross-HR messaging', desc: 'Coordinate with partner HR teams in real time.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl p-4 backdrop-blur-sm"
                    style={{ border: `1px solid ${cardBorder}`, backgroundColor: cardBg }}>
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: headingColor }}>{item.title}</p>
                      <p className="mt-0.5 text-xs" style={{ color: subColor }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="p-8 sm:p-10 lg:p-12" style={{ backgroundColor: 'var(--bg-surface)' }}>

            {/* ── STEP 1: Credentials ── */}
            {step === 'credentials' && (
              <>
                <div className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ border: `1px solid ${cardBorder}`, backgroundColor: isLight ? 'rgba(0,135,74,0.10)' : 'rgba(0,255,136,0.08)', color: accentText }}>
                  Secure access
                </div>
                <h2 className="mt-5 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Sign in</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Enter your credentials — we'll email you a verification code.</p>

                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                  <span className="text-xs uppercase tracking-[0.3em]" style={{ color: dividerText }}>step 1 of 2</span>
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: labelColor }}>Username or Email</label>
                    <input
                      id="login-username"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                      style={{ border: `1px solid ${inputBorder}`, backgroundColor: inputBg, color: inputText }}
                      placeholder="Enter your username or email"
                      value={usernameOrEmail}
                      onChange={e => setUsernameOrEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: labelColor }}>Password</label>
                    <input
                      id="login-password"
                      type="password"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                      style={{ border: `1px solid ${inputBorder}`, backgroundColor: inputBg, color: inputText }}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    id="login-send-otp"
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: btnBg }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = btnHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = btnBg)}
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</> : <>Continue — Send OTP <Mail size={16} /></>}
                  </button>
                </form>

                {message && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{message}</div>
                )}
                <div className="mt-7 text-center text-sm" style={{ color: footerText }}>
                  Don&apos;t have an account?{' '}
                  <a href="/register" className="font-semibold hover:underline" style={{ color: accentText }}>Create one</a>
                </div>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <>
                <button
                  onClick={() => { setStep('credentials'); setMessage(''); setOtp(['', '', '', '', '', '']); }}
                  className="mb-6 flex items-center gap-2 text-sm transition hover:opacity-70"
                  style={{ color: accentText }}
                >
                  <ArrowLeft size={15} /> Back
                </button>

                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ border: `1px solid ${cardBorder}`, backgroundColor: isLight ? 'rgba(0,135,74,0.10)' : 'rgba(0,255,136,0.08)', color: accentText }}>
                  <Mail size={10} /> OTP sent
                </div>

                <h2 className="mt-5 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  We sent a 6-digit code to <strong style={{ color: accentText }}>{maskedEmail || 'your email'}</strong>.<br />
                  Enter it below to sign in.
                </p>

                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                  <span className="text-xs uppercase tracking-[0.3em]" style={{ color: dividerText }}>step 2 of 2</span>
                  <div className="h-px flex-1" style={{ backgroundColor: dividerBg }} />
                </div>

                <form onSubmit={handleVerifyOtp}>
                  {/* 6-box OTP input */}
                  <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        id={`otp-box-${i}`}
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
                    id="login-verify-otp"
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: btnBg }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = btnHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = btnBg)}
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify & Sign in'}
                  </button>
                </form>

                {message && (
                  <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${message.includes('sent') ? 'border-green-500/20 bg-green-500/10 text-green-600' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>
                    {message}
                  </div>
                )}

                <div className="mt-5 text-center">
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1.5 mx-auto text-sm transition disabled:opacity-40"
                    style={{ color: accentText }}
                  >
                    <RefreshCw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
