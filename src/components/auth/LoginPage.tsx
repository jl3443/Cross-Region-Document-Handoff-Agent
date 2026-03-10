import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/data/types';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const DEMO_ACCOUNTS: { email: string; password: string; role: UserRole; label: string }[] = [
  { email: 'e.coordinator@docflow.io', password: 'Demo@2024', role: 'export-coordinator', label: 'Export Coordinator' },
  { email: 'import.team@docflow.io',   password: 'Demo@2024', role: 'import-team',        label: 'Import Team' },
  { email: 'broker@docflow.io',        password: 'Demo@2024', role: 'broker',             label: 'Broker' },
  { email: 'compliance@docflow.io',    password: 'Demo@2024', role: 'trade-compliance',   label: 'Trade Compliance' },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const match = DEMO_ACCOUNTS.find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password
    );

    if (!match) {
      setError('Invalid email or password.');
      return;
    }

    setLoading(true);
    setTimeout(() => onLogin(match.role), 600);
  };

  const fillAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: Branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-between px-10 py-12"
      >
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30">
              <Globe size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Operations Readiness Manager</p>
              <p className="text-slate-400 text-[10px]">AI-Powered Trade Intelligence</p>
            </div>
          </div>

          <div className="mt-16">
            <h1 className="text-3xl font-bold text-white leading-tight">
              Intelligent Document
              <br />
              <span className="text-blue-400">Exception Management</span>
            </h1>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              AI-powered platform for real-time shipment document validation,
              exception resolution, and customs compliance across global trade lanes.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {[
              'Real-time ISF & document matching',
              'AI-driven exception resolution',
              'Multi-party escalation workflows',
              'CBP / customs compliance tracking',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="text-slate-300 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700/60 pt-6">
          <p className="text-slate-500 text-xs">Demo environment · All data is fictitious</p>
          <p className="text-slate-600 text-[11px] mt-1">Operations Readiness Manager v2.4 · Powered by AI</p>
        </div>
      </motion.div>

      {/* ── Right panel: Login form ── */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@docflow.io"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5"
              >
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-600">{error}</span>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0000B3] hover:bg-blue-800
                         text-white text-sm font-semibold py-2.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Demo accounts — click to fill
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillAccount(acc)}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white
                             px-3.5 py-2.5 text-left hover:border-blue-300 hover:bg-blue-50/50 transition group"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{acc.label}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{acc.email}</p>
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono group-hover:text-blue-400">Demo@2024</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
