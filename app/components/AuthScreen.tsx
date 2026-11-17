'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { getAuthCopy, type AuthCopy } from '@/lib/auth-i18n';

export type AuthMode = 'register' | 'login' | 'forgot' | 'reset' | 'security';

interface MemberInfo {
  uid: string;
  email: string;
  verified: boolean;
  totpEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const inputClass =
  'w-full rounded-xl border border-white/12 bg-[#04060d]/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-cyan/50 focus:ring-2 focus:ring-cyan/15';

const labelClass = 'block text-[0.72rem] font-semibold tracking-[0.08em] text-ink-soft';

function Notice({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const palette =
    tone === 'error'
      ? 'border-rose-400/35 bg-rose-400/10 text-rose-200'
      : tone === 'success'
        ? 'border-mint/35 bg-mint/10 text-mint'
        : 'border-cyan/30 bg-cyan/10 text-cyan';
  return <p className={`rounded-xl border px-4 py-3 text-[0.8rem] leading-relaxed ${palette}`}>{children}</p>;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  copy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  copy: AuthCopy;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className={`${inputClass} pe-24`}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 end-3 my-auto h-6 text-[0.66rem] font-semibold text-cyan"
        >
          {visible ? copy.hideCode : copy.showCode}
        </button>
      </div>
    </div>
  );
}

export default function AuthScreen({ mode }: { mode: AuthMode }) {
  const { lang, href } = useI18n();
  const copy = useMemo(() => getAuthCopy(lang), [lang]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'verify' | 'sent' | 'done'>('form');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  // Session-backed security screen state
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    if (mode !== 'reset') return;
    const params = new URLSearchParams(window.location.search);
    setResetToken(params.get('token') ?? '');
    if (params.get('email')) setEmail(params.get('email') ?? '');
  }, [mode]);

  useEffect(() => {
    if (mode !== 'security') return;
    let cancelled = false;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as { member?: MemberInfo };
        if (!cancelled) setMember(response.ok ? (payload.member ?? null) : null);
      })
      .catch(() => {
        if (!cancelled) setMember(null);
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const post = useCallback(async (url: string, body: unknown) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return { ok: response.ok, status: response.status, payload };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if ((mode === 'register' || mode === 'reset' || mode === 'security') && password !== confirm && mode !== 'security') {
      setError('Passwords do not match');
      return;
    }
    if (mode === 'security') {
      if (currentPassword === newPassword) {
        setError('Choose a different new password');
        return;
      }
      if (newPassword.length < 8) {
        setError(copy.passwordHint);
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        const result = await post('/api/auth/register', { email, password });
        if (!result.ok) {
          setError(String(result.payload.error ?? copy.error));
        } else {
          setStep('verify');
          setDevCode(typeof result.payload.verificationCode === 'string' ? result.payload.verificationCode : null);
        }
      } else if (mode === 'login') {
        const result = await post('/api/auth/login', { email, password, code: code || undefined });
        if (!result.ok) {
          setError(String(result.payload.error ?? copy.error));
        } else {
          setSuccess(copy.done);
          window.location.href = href('/dashboard/security');
        }
      } else if (mode === 'forgot') {
        const result = await post('/api/auth/forgot', { email });
        if (!result.ok) {
          setError(String(result.payload.error ?? copy.error));
        } else {
          setStep('sent');
          setDevToken(typeof result.payload.resetToken === 'string' ? result.payload.resetToken : null);
        }
      } else if (mode === 'reset') {
        const result = await post('/api/auth/reset', { token: resetToken, password });
        if (!result.ok) {
          setError(String(result.payload.error ?? copy.error));
        } else {
          setStep('done');
          setSuccess(copy.resetDoneBody);
        }
      } else {
        const result = await post('/api/auth/session', {
          action: 'change-password',
          currentPassword,
          nextPassword: newPassword,
        });
        if (!result.ok) {
          setError(String(result.payload.error ?? copy.error));
        } else {
          setSuccess(copy.resetDoneBody);
          setCurrentPassword('');
          setNewPassword('');
          setMember(null);
        }
      }
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const result = await post('/api/auth/verify', { email, code });
      if (!result.ok) {
        setError(String(result.payload.error ?? copy.error));
      } else {
        setStep('done');
        setSuccess(copy.verifiedBody);
      }
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);
    try {
      const result = await post('/api/auth/verify', { email, resend: true });
      if (!result.ok) setError(String(result.payload.error ?? copy.error));
      else if (typeof result.payload.verificationCode === 'string') setDevCode(result.payload.verificationCode);
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    setMember(null);
    window.location.href = href('/login');
  }

  async function beginTotp() {
    setError(null);
    setBusy(true);
    try {
      const result = await post('/api/auth/2fa', { action: 'begin' });
      if (!result.ok) setError(String(result.payload.error ?? copy.error));
      else {
        setTotpSecret(typeof result.payload.secret === 'string' ? result.payload.secret : null);
        setOtpauth(typeof result.payload.otpauth === 'string' ? result.payload.otpauth : null);
      }
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  }

  async function confirmTwoFactor() {
    setError(null);
    setBusy(true);
    try {
      const result = await post('/api/auth/2fa', { action: 'confirm', code: totpCode });
      if (!result.ok) setError(String(result.payload.error ?? copy.error));
      else {
        setRecoveryCodes(Array.isArray(result.payload.recoveryCodes) ? (result.payload.recoveryCodes as string[]) : []);
        setTotpSecret(null);
        setOtpauth(null);
        setTotpCode('');
        setMember((current) => (current ? { ...current, totpEnabled: true } : current));
      }
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  }

  async function disableTwoFactor() {
    setError(null);
    setBusy(true);
    try {
      const result = await post('/api/auth/2fa', { action: 'disable', password: currentPassword });
      if (!result.ok) setError(String(result.payload.error ?? copy.error));
      else {
        setMember((current) => (current ? { ...current, totpEnabled: false } : current));
        setRecoveryCodes(null);
      }
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<AuthMode, { title: string; lead: string }> = {
    register: { title: copy.registerTitle, lead: copy.registerLead },
    login: { title: copy.loginTitle, lead: copy.loginLead },
    forgot: { title: copy.forgotTitle, lead: copy.forgotLead },
    reset: { title: copy.resetTitle, lead: copy.resetLead },
    security: { title: copy.securityTitle, lead: copy.securityLead },
  };

  /* ---------------------------------------------------------- Security */
  if (mode === 'security') {
    return (
      <div className="mx-auto max-w-3xl px-1 py-4">
        <header className="max-w-xl">
          <p className="mx-eyebrow">{copy.securityTitle}</p>
          <h1 className="mx-section-title mt-4">{copy.securityTitle}</h1>
          <p className="mx-lede mt-4">{copy.securityLead}</p>
        </header>

        {!sessionChecked ? (
          <p className="mt-8 text-sm text-ink-faint">{copy.working}</p>
        ) : !member ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#080d18] p-6">
            <p className="text-sm text-ink-mute">{copy.loginLead}</p>
            <Link href={href('/login')} className="mx-btn mt-5 inline-flex">
              {copy.signIn}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            <section className="rounded-2xl border border-white/10 bg-[#080d18] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] tracking-[0.14em] text-ink-faint uppercase">{copy.accountEmail}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{member.email}</p>
                </div>
                <span className="mx-chip">
                  {copy.status}: {copy.active}
                </span>
                <button type="button" onClick={signOut} className="mx-btn-quiet">
                  {copy.signOut}
                </button>
              </div>
              <dl className="mt-5 grid gap-3 text-[0.78rem] text-ink-mute sm:grid-cols-2">
                <div>
                  <dt className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.memberSince}</dt>
                  <dd className="mt-1">{new Date(member.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}</dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.lastLogin}</dt>
                  <dd className="mt-1">
                    {member.lastLoginAt
                      ? new Date(member.lastLoginAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')
                      : '—'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#080d18] p-6">
              <h2 className="text-sm font-semibold text-ink">{copy.twoFactorTitle}</h2>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-mute">{copy.twoFactorBody}</p>

              {member.totpEnabled ? (
                <div className="mt-4 space-y-3">
                  <Notice tone="success">{copy.verifiedTitle}</Notice>
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder={copy.currentPassword}
                      className={`${inputClass} max-w-xs`}
                    />
                    <button type="button" disabled={busy} onClick={disableTwoFactor} className="mx-btn-quiet">
                      {copy.disableTwoFactor}
                    </button>
                  </div>
                </div>
              ) : totpSecret ? (
                <div className="mt-4 space-y-3">
                  <p className="text-[0.78rem] text-ink-soft">{copy.twoFactorBody}</p>
                  <code className="block break-all rounded-xl border border-amber/25 bg-amber/[0.06] px-4 py-3 text-[0.78rem] text-amber">
                    {totpSecret}
                  </code>
                  {otpauth ? (
                    <Link href={otpauth} className="text-[0.72rem] text-cyan underline">
                      google authenticator
                    </Link>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <input
                      value={totpCode}
                      onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder={copy.code}
                      inputMode="numeric"
                      className={`${inputClass} max-w-[12rem]`}
                    />
                    <button type="button" disabled={busy} onClick={confirmTwoFactor} className="mx-btn">
                      {copy.confirmTwoFactor}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" disabled={busy} onClick={beginTotp} className="mx-btn mt-4">
                  {copy.enableTwoFactor}
                </button>
              )}

              {recoveryCodes ? (
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-[0.78rem] font-semibold text-amber">{copy.recoveryTitle}</h3>
                  <p className="mt-1 text-[0.7rem] text-ink-faint">{copy.recoveryBody}</p>
                  <ul className="mt-3 grid grid-cols-2 gap-2 text-[0.76rem] sm:grid-cols-4">
                    {recoveryCodes.map((item) => (
                      <li key={item} className="rounded-lg border border-white/10 px-2 py-1 font-mono text-ink-soft">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#080d18] p-6">
              <h2 className="text-sm font-semibold text-ink">{copy.resetTitle}</h2>
              <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="current-password" className={labelClass}>
                    {copy.currentPassword}
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className={`${inputClass} mt-2`}
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className={labelClass}>
                    {copy.newPassword}
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className={`${inputClass} mt-2`}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={busy} className="mx-btn">
                    {busy ? copy.working : copy.savePassword}
                  </button>
                  <span className="text-[0.68rem] text-ink-faint">{copy.lockoutNote}</span>
                </div>
              </form>
              {error ? <div className="mt-4"><Notice tone="error">{error}</Notice></div> : null}
              {success ? <div className="mt-4"><Notice tone="success">{success}</Notice></div> : null}
              <p className="mt-4 text-[0.68rem] text-ink-faint">{copy.secureNote}</p>
            </section>
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------ Form screens */
  const isDone = step === 'done';
  const isSent = step === 'sent';

  return (
    <div className="mx-auto grid max-w-5xl gap-10 py-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      <section className="rounded-[1.5rem] border border-white/10 bg-[#080d18] p-6 sm:p-8">
        <p className="mx-eyebrow">{titles[mode].title}</p>
        <h1 className="mx-title mt-4">{titles[mode].title}</h1>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-ink-mute">{titles[mode].lead}</p>

        {isDone || isSent ? (
          <div className="mt-7 space-y-4">
            <Notice tone="success">{success ?? copy.resetSentBody}</Notice>
            {isSent ? (
              <div className="space-y-3">
                <p className="text-[0.8rem] text-ink-mute">{copy.resetSentBody}</p>
                {devToken ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[0.66rem] tracking-[0.12em] text-ink-faint uppercase">{copy.resetTokenLabel}</p>
                    <code className="mt-2 block break-all text-[0.74rem] text-cyan">{devToken}</code>
                    <Link href={href(`/reset-password?token=${encodeURIComponent(devToken)}`)} className="mx-btn mt-3 inline-flex">
                      {copy.openReset}
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
            <Link href={href('/login')} className="mx-btn inline-flex">
              {copy.signIn}
            </Link>
          </div>
        ) : step === 'verify' ? (
          <div className="mt-7 space-y-4">
            <h2 className="text-sm font-semibold text-ink">{copy.verifyEmail}</h2>
            {devCode ? (
              <Notice tone="info">
                {copy.emailCodeNote} <strong className="mx-numeric ms-1">{devCode}</strong>
              </Notice>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={copy.code}
                inputMode="numeric"
                className={`${inputClass} max-w-[12rem]`}
              />
              <button type="button" onClick={verify} disabled={busy} className="mx-btn">
                {busy ? copy.working : copy.verify}
              </button>
            </div>
            <button type="button" onClick={resend} disabled={busy} className="text-[0.74rem] font-semibold text-cyan underline">
              {copy.resend}
            </button>
            {error ? <Notice tone="error">{error}</Notice> : null}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            {(mode === 'register' || mode === 'login' || mode === 'forgot') && (
              <div>
                <label htmlFor="auth-email" className={labelClass}>
                  {copy.email}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className={`${inputClass} mt-2`}
                  required
                />
              </div>
            )}

            {mode === 'reset' && (
              <div>
                <label htmlFor="auth-token" className={labelClass}>
                  {copy.resetTokenLabel}
                </label>
                <input
                  id="auth-token"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  className={`${inputClass} mt-2 font-mono text-[0.74rem]`}
                  required
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <PasswordField
                id="auth-password"
                label={mode === 'reset' ? copy.newPassword : copy.password}
                value={password}
                onChange={setPassword}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                copy={copy}
              />
            )}

            {(mode === 'register' || mode === 'reset') && (
              <PasswordField
                id="auth-confirm"
                label={copy.confirmPassword}
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                copy={copy}
              />
            )}

            {mode === 'login' && (
              <div>
                <label htmlFor="auth-code" className={labelClass}>
                  {copy.twoFactorTitle} <span className="text-ink-faint">(optional)</span>
                </label>
                <input
                  id="auth-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  className={`${inputClass} mt-2 max-w-[12rem]`}
                />
              </div>
            )}

            {(mode === 'register' || mode === 'reset') ? (
              <p className="text-[0.7rem] text-ink-faint">{copy.passwordHint}</p>
            ) : null}

            {error ? <Notice tone="error">{error}</Notice> : null}

            <button type="submit" disabled={busy} className="mx-btn w-full justify-center">
              {busy
                ? copy.working
                : mode === 'register'
                  ? copy.createAccount
                  : mode === 'login'
                    ? copy.signIn
                    : mode === 'forgot'
                      ? copy.sendReset
                      : copy.savePassword}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[0.76rem] text-ink-mute">
              {mode === 'login' ? (
                <>
                  <Link href={href('/forgot-password')} className="text-cyan hover:underline">
                    {copy.forgotLink}
                  </Link>
                  <span>
                    {copy.noAccount}{' '}
                    <Link href={href('/register')} className="font-semibold text-amber hover:underline">
                      {copy.createAccount}
                    </Link>
                  </span>
                </>
              ) : (
                <span>
                  {copy.haveAccount}{' '}
                  <Link href={href('/login')} className="font-semibold text-cyan hover:underline">
                    {copy.signIn}
                  </Link>
                </span>
              )}
            </div>
          </form>
        )}
      </section>

      <aside className="relative hidden overflow-hidden rounded-[1.5rem] border border-amber/25 bg-[linear-gradient(150deg,rgba(212,175,55,0.16),rgba(4,6,13,0.9))] p-8 lg:block">
        <div className="absolute -top-16 -end-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.4),transparent_70%)] blur-2xl" aria-hidden />
        <p className="mx-numeric text-[0.66rem] tracking-[0.22em] text-amber uppercase">MineAI</p>
        <h2 className="mt-5 text-2xl font-bold text-ink">{copy.registerTitle}</h2>
        <ul className="mt-6 space-y-3 text-[0.82rem] text-ink-soft">
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />{copy.registerLead}</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />{copy.lockoutNote}</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber" aria-hidden />{copy.secureNote}</li>
        </ul>
        <Link href={href('/mining')} className="mx-btn-quiet mt-8 inline-flex">
          {copy.backToLogin}
        </Link>
      </aside>
    </div>
  );
}
