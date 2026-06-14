'use client';

import { useEffect, useState } from 'react';
import { Languages, DollarSign, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { byLanguage, useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/authContext';
import LanguageSwitcher from './LanguageSwitcher';

type TopUpPack = {
  id: 'boost_25' | 'boost_75' | 'boost_200';
  label: string;
  priceUsd: number;
  generations: number;
  bonusLabel?: string;
};

const COPY = {
  pl: {
    title: 'Moje konto',
    subtitle: 'Rejestracja, język i zarządzanie generacjami.',
    signupTitle: 'Szybka rejestracja',
    signupText: 'Utwórz konto UFInf bez karty kredytowej i publikuj natychmiast na wszystkich platformach.',
    name: 'Imię i nazwisko',
    email: 'Email',
    register: 'Zarejestruj się',
    registered: 'Konto założone — możesz już publikować!',
    languageTitle: 'Wybór języka',
    languageText: 'Zmiana działa globalnie dla całego panelu.',
    languageSaved: 'Preferencja jezyka zapisana dla tego uzytkownika przegladarki.',
    topupTitle: 'Dokup generacji',
    topupText: 'Wyczerpałeś limit? Dokup teraz bez abonamentu.',
    remaining: 'Pozostało generacji: ',
    userTitle: 'Profil zalogowanego',
    logoutBtn: 'Wyloguj się',
    buy: 'Kup pakiet',
  },
  en: {
    title: 'My account',
    subtitle: 'Registration, language, and generation management.',
    signupTitle: 'Quick registration',
    signupText: 'Create your UFInf account with no credit card and start publishing instantly across all platforms.',
    name: 'Full name',
    email: 'Email',
    register: 'Register',
    registered: 'Account created — you can publish now!',
    languageTitle: 'Language',
    languageText: 'Changes apply globally across the entire panel.',
    languageSaved: 'Language preference is saved for this browser user profile.',
    topupTitle: 'Buy more generations',
    topupText: 'Hit your limit? Buy now, no subscription needed.',
    remaining: 'Generations remaining: ',
    userTitle: 'Logged-in profile',
    logoutBtn: 'Log out',
    buy: 'Buy pack',
  },
  es: {
    title: 'Mi cuenta',
    subtitle: 'Registro, idioma y gestión de generaciones.',
    signupTitle: 'Registro rápido',
    signupText: 'Crea tu cuenta de UFInf sin tarjeta de crédito y publica al instante en todas las plataformas.',
    name: 'Nombre completo',
    email: 'Correo electrónico',
    register: 'Registrarse',
    registered: '¡Cuenta creada — ya puedes publicar!',
    languageTitle: 'Idioma',
    languageText: 'Los cambios se aplican globalmente en todo el panel.',
    languageSaved: 'La preferencia de idioma se guarda para este perfil de navegador.',
    topupTitle: 'Compra más generaciones',
    topupText: '¿Alcanzaste tu límite? Compra ahora, sin suscripción.',
    remaining: 'Generaciones restantes: ',
    userTitle: 'Perfil de usuario conectado',
    logoutBtn: 'Cerrar sesión',
    buy: 'Comprar paquete',
  },
};

export default function AccountPanel() {
  const { language, lastSavedAt } = useI18n();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const t = byLanguage(language, COPY);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const [packs, setPacks] = useState<TopUpPack[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [topUpMessage, setTopUpMessage] = useState('');
  const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    let active = true;
    const savedEmail = localStorage.getItem('usinf_signup_email') || '';
    const effectiveEmail = user?.email || savedEmail;
    const topupUrl = effectiveEmail ? `/api/usage/topup?email=${encodeURIComponent(effectiveEmail)}` : '/api/usage/topup';

    fetch(topupUrl)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setPacks(Array.isArray(data.packs) ? data.packs : []);
        setRemaining(Number(data?.usage?.topUpGenerationsRemaining || 0));
      })
      .catch(() => {
        if (!active) return;
        setPacks([]);
      });

    const savedName = localStorage.getItem('usinf_signup_name') || '';
    if (savedName) setSignupName(savedName);
    if (savedEmail) setSignupEmail(savedEmail);

    const payment = new URLSearchParams(window.location.search).get('payment');
    const kind = new URLSearchParams(window.location.search).get('kind');
    if (payment === 'success') {
      setPaymentMessage(language === 'pl'
        ? 'Płatność przyjęta. Generacje dodane do konta.'
        : language === 'es'
          ? 'Pago recibido. Generaciones añadidas.'
          : 'Payment received. Generations added.');
    } else if (payment === 'cancelled') {
      setPaymentMessage(language === 'pl' ? 'Płatność anulowana.' : language === 'es' ? 'Pago cancelado.' : 'Payment cancelled.');
    }

    return () => {
      active = false;
    };
  }, [language, user?.email]);

  function quickRegister() {
    const name = signupName.trim();
    const email = signupEmail.trim();

    if (!name || !email.includes('@')) {
      setSignupMessage(language === 'pl' ? 'Podaj imię i email.' : language === 'es' ? 'Introduce nombre y email.' : 'Provide name and email.');
      return;
    }

    localStorage.setItem('usinf_signup_name', name);
    localStorage.setItem('usinf_signup_email', email);
    setSignupMessage(t.registered);
  }

  async function buyTopUp(packId: TopUpPack['id']) {
    setTopUpLoadingId(packId);
    setTopUpMessage('');
    try {
      const customerEmail = user?.email || localStorage.getItem('usinf_signup_email') || '';
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'topup', packId, customerEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTopUpMessage(data?.error || (language === 'pl' ? 'Błąd checkout.' : language === 'es' ? 'Error de pago.' : 'Checkout error.'));
      } else if (data.checkoutMode === 'stripe' && data.url) {
        window.location.assign(data.url);
      } else {
        setTopUpMessage(language === 'pl' ? 'Błąd systemu.' : language === 'es' ? 'Error del sistema.' : 'System error.');
      }
    } catch {
      setTopUpMessage(language === 'pl' ? 'Błąd połączenia.' : language === 'es' ? 'Error de conexión.' : 'Connection error.');
    } finally {
      setTopUpLoadingId(null);
    }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      {user && (
        <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg,rgba(34,211,238,.1),rgba(34,211,238,.05))', borderColor: 'rgba(34,211,238,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t.userTitle}</h3>
              <p style={{ fontSize: 14, color: '#e5edf9', marginBottom: 2 }}>👤 {user.displayName}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>📧 {user.email}</p>
            </div>
            <button
              className="btn btn-danger btn-sm"
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
            >
              <LogOut size={13} /> {t.logoutBtn}
            </button>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 16 }}>
        {paymentMessage ? <div className="alert alert-info" style={{ gridColumn: '1 / -1' }}>{paymentMessage}</div> : null}

        {!user && <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              💌
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.signupTitle}</h3>
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>{t.signupText}</p>
          <div style={{ display: 'grid', gap: 10 }}>
            <input
              type="text"
              placeholder={t.name}
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: '#fff', fontSize: 13 }}
            />
            <input
              type="email"
              placeholder={t.email}
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: '#fff', fontSize: 13 }}
            />
            <button className="btn btn-primary btn-sm btn-full" onClick={quickRegister}>
              {t.register}
            </button>
            {signupMessage && <div className="alert alert-info">{signupMessage}</div>}
          </div>
        </div>}

        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,211,238,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Languages size={18} color="var(--cyan)" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.languageTitle}</h3>
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>{t.languageText}</p>
          <LanguageSwitcher compact={false} />
          <p style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 10 }}>{t.languageSaved} · {lastSavedAt}</p>
        </div>
      </div>

      {packs.length > 0 && (
        <div>
          <div style={{ marginTop: 24, marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{t.topupTitle}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{t.topupText}</p>
            {remaining > 0 && <p style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 600, marginTop: 8 }}>{t.remaining}{remaining}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {packs.map((pack) => (
              <div key={pack.id} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{pack.label}</h4>
                <p style={{ color: 'var(--cyan)', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>${pack.priceUsd}</p>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>{pack.generations} generations</p>
                {pack.bonusLabel && <p style={{ color: 'var(--green)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>{pack.bonusLabel}</p>}
                <button
                  className="btn btn-primary btn-sm btn-full"
                  onClick={() => buyTopUp(pack.id)}
                  disabled={topUpLoadingId === pack.id}
                >
                  {topUpLoadingId === pack.id ? '⏳' : t.buy}
                </button>
              </div>
            ))}
          </div>
          {topUpMessage && <div className="alert alert-error" style={{ marginTop: 12 }}>{topUpMessage}</div>}
        </div>
      )}
    </div>
  );
}
