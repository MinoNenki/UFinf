'use client';

import { useEffect, useState } from 'react';
import { Shield, LogIn } from 'lucide-react';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/admin/session').then(r => r.json()).then(d => {
      if (d?.isAdmin) setLoggedIn(true);
    }).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Niepoprawne dane logowania.');
        return;
      }
      setLoggedIn(true);
      window.location.href = '/dashboard/admin';
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  if (loggedIn) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#050816' }}>
        <div style={{ textAlign: 'center', color: '#e5edf9' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Zalogowano</h2>
          <p style={{ color: '#6b8099', marginBottom: 20 }}>Przekierowanie do panelu...</p>
          <a href="/dashboard/admin" style={{ background: 'linear-gradient(135deg,#22d3ee,#0ea5e9)', color: '#030d1a', padding: '10px 28px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Wejdź do panelu admina
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#050816', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 0 32px rgba(34,211,238,.35)'
          }}>
            <Shield size={26} color="#030d1a" strokeWidth={2.5} />
          </div>
          <h1 style={{ color: '#e5edf9', fontSize: 22, fontWeight: 800, margin: 0 }}>Panel admina</h1>
          <p style={{ color: '#6b8099', fontSize: 13, marginTop: 6 }}>UFInf — dostęp dla administratora</p>
        </div>

        {/* Card */}
        <form onSubmit={submit} style={{
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 24,
          padding: '32px 28px',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b8099', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@ufinf.com"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 12, color: '#e5edf9', fontSize: 15, padding: '11px 14px', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b8099', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Hasło
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 12, color: '#e5edf9', fontSize: 15, padding: '11px 14px', outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b8099', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
              Kod 2FA (TOTP)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 12, color: '#e5edf9', fontSize: 22, fontWeight: 700,
                padding: '11px 14px', outline: 'none', letterSpacing: '0.4em', textAlign: 'center',
              }}
            />
            <p style={{ fontSize: 11, color: '#4a6075', marginTop: 5 }}>
              6-cyfrowy kod z aplikacji uwierzytelniającej (np. Google Authenticator)
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 13,
              marginBottom: 16, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px 0',
              background: loading ? 'rgba(34,211,238,.4)' : 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
              color: '#030d1a', border: 'none', borderRadius: 14, fontWeight: 800,
              fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 6px 24px rgba(34,211,238,.3)',
              transition: 'all .2s',
            }}
          >
            <LogIn size={16} />
            {loading ? 'Logowanie...' : 'Zaloguj jako admin'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#2a3f52', fontSize: 12, marginTop: 20 }}>
          <a href="/" style={{ color: '#4a6075', textDecoration: 'none' }}>← Wróć do strony głównej</a>
        </p>
      </div>
    </main>
  );
}
