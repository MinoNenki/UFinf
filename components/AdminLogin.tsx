'use client';

import { useState } from 'react';
import { byLanguage, useI18n } from '@/lib/i18n';

type Props = {
  onSuccess: () => void;
};

export default function AdminLogin({ onSuccess }: Props) {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: {
      title: 'Dostep administratora',
      intro: 'Panel admina UFInf. Zaloguj sie kontem administratora.',
      email: 'Email admina',
      password: 'Haslo admina',
      otp: 'Kod 2FA (TOTP)',
      invalid: 'Niepoprawne dane logowania admina.',
      loginError: 'Blad logowania.',
      loading: 'Logowanie...',
      submit: 'Zaloguj jako admin',
    },
    en: {
      title: 'Administrator access',
      intro: 'UFInf admin panel. Sign in with the administrator account.',
      email: 'Admin email',
      password: 'Admin password',
      otp: '2FA code (TOTP)',
      invalid: 'Invalid administrator credentials.',
      loginError: 'Login error.',
      loading: 'Signing in...',
      submit: 'Sign in as admin',
    },
    es: {
      title: 'Acceso de administrador',
      intro: 'Panel de administrador de UFInf. Inicia sesion con la cuenta de administrador.',
      email: 'Correo del admin',
      password: 'Contrasena del admin',
      otp: 'Codigo 2FA (TOTP)',
      invalid: 'Credenciales de administrador no validas.',
      loginError: 'Error de inicio de sesion.',
      loading: 'Iniciando sesion...',
      submit: 'Entrar como admin',
    },
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      if (!res.ok) throw new Error(copy.invalid);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.loginError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '60px auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{copy.title}</h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
        {copy.intro}
      </p>
      <div className="form-group">
        <label className="form-label">{copy.email}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ufinf.com" />
      </div>
      <div className="form-group">
        <label className="form-label">{copy.password}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div className="form-group">
        <label className="form-label">{copy.otp}</label>
        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} />
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>}
      <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>
        {loading ? copy.loading : copy.submit}
      </button>
    </div>
  );
}
