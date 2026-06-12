'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, resendVerification, emailVerificationAvailable, authMode, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await signUp(email, password, displayName);
      if (result.needsEmailVerification) {
        setSuccess(`Wyslalem link aktywacyjny na ${email}. Otworz mail i kliknij link, aby aktywowac konto.`);
        return;
      }

      if (result.warning) {
        setSuccess(result.warning);
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSuccess('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google registration failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050816 0%,#0a1628 100%)', color: '#e5edf9' }}>
      <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#22d3ee,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>
            U
          </div>
          UFInf
        </div>
        <LanguageSwitcher compact />
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(34,211,238,.05)', borderRight: '1px solid rgba(255,255,255,.1)' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.3, marginBottom: 20, letterSpacing: '-0.03em' }}>
            Create your UFInf account and scale your creator business.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(229,237,249,.7)', lineHeight: 1.7, marginBottom: 32 }}>
            Join thousands of creators who publish smarter, earn bigger, and automate their content strategy across TikTok, YouTube, Instagram, Facebook, and X.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              '✓ One Click Publish to all platforms',
              '✓ AI Content Brain with trend analysis',
              '✓ Free tier - no credit card required',
              '✓ Multi-language support',
            ].map((item) => (
              <div key={item} style={{ fontSize: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#22d3ee' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Account</h2>
            <p style={{ fontSize: 13, color: 'rgba(229,237,249,.6)', marginBottom: 32 }}>Start for free — upgrade later.</p>

            <div style={{ background: emailVerificationAvailable ? 'rgba(34,211,238,.1)' : 'rgba(245,158,11,.12)', border: `1px solid ${emailVerificationAvailable ? 'rgba(34,211,238,.25)' : 'rgba(245,158,11,.28)'}`, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: emailVerificationAvailable ? '#b6f4ff' : '#fcd34d', marginBottom: 18 }}>
              {emailVerificationAvailable
                ? 'Po rejestracji wysylamy mail aktywacyjny. Dopiero po kliknieciu w link konto jest w pelni zweryfikowane.'
                : 'Na tym deployu brakuje konfiguracji Supabase Auth w Vercel, wiec prawdziwy mail aktywacyjny nie moze zostac wyslany. Dopiero po dodaniu env wlaczy sie realna weryfikacja email i Google OAuth.'}
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{ width: '100%', marginBottom: 16, background: 'rgba(255,255,255,.04)', color: '#e5edf9', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: googleLoading ? 'not-allowed' : 'pointer' }}
            >
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(229,237,249,.7)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, color: 'rgba(34,211,238,.6)' }} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,.07)',
                      border: '1px solid rgba(255,255,255,.15)',
                      borderRadius: 10,
                      color: '#e5edf9',
                      padding: '11px 14px 11px 40px',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all .2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(34,211,238,.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(229,237,249,.7)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                  Email
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, color: 'rgba(34,211,238,.6)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,.07)',
                      border: '1px solid rgba(255,255,255,.15)',
                      borderRadius: 10,
                      color: '#e5edf9',
                      padding: '11px 14px 11px 40px',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all .2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(34,211,238,.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(229,237,249,.7)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, color: 'rgba(34,211,238,.6)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,.07)',
                      border: '1px solid rgba(255,255,255,.15)',
                      borderRadius: 10,
                      color: '#e5edf9',
                      padding: '11px 14px 11px 40px',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all .2s',
                      paddingRight: 40,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(34,211,238,.5)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, background: 'none', border: 'none', color: 'rgba(34,211,238,.6)', cursor: 'pointer', padding: 4 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(229,237,249,.5)', marginTop: 6 }}>Min. 6 characters</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.28)', borderRadius: 8, padding: '10px 14px', color: '#bbf7d0', fontSize: 13 }}>
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'rgba(34,211,238,.4)' : 'linear-gradient(135deg,#22d3ee,#0ea5e9)',
                  color: '#030d1a',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 20px',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all .2s',
                  marginTop: 8,
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(34,211,238,.3)',
                }}
              >
                {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24 }}>
              <p style={{ fontSize: 13, color: 'rgba(229,237,249,.7)' }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Log in
                </a>
              </p>
              {emailVerificationAvailable && email ? (
                <button
                  type="button"
                  onClick={() => resendVerification(email).then(() => setSuccess(`Ponowilem wysylke linku aktywacyjnego na ${email}.`)).catch((err) => setError(err instanceof Error ? err.message : 'Could not resend verification email'))}
                  style={{ marginTop: 12, background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                >
                  Resend verification email
                </button>
              ) : null}
              {authMode === 'local' ? (
                <p style={{ fontSize: 12, color: 'rgba(229,237,249,.45)', marginTop: 10 }}>
                  Fallback local mode aktywny do czasu dodania env Supabase na webie.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
