'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, UserCircle2, Languages, LogIn, LogOut, KeyRound, Settings, LayoutDashboard } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

type Props = {
  isAdmin: boolean;
  role?: string;
  onLogin: () => void;
  onLogout: () => Promise<void>;
};

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
    subtitle: 'Centrum konta, sesji administratora i ustawien jezyka aplikacji.',
    profileTitle: 'Profil workspace',
    profileText: 'USInf.com Growth Workspace. Tutaj masz szybki dostep do jezyka, sesji admina i kolejnych krokow konfiguracji.',
    statusTitle: 'Status sesji',
    statusAdmin: 'Zalogowano jako administrator',
    statusGuest: 'Brak aktywnej sesji administratora',
    role: 'Rola',
    security: '2FA',
    enabled: 'aktywne',
    login: 'Logowanie',
    logout: 'Wylogowanie',
    openAdmin: 'Przejdz do panelu admina',
    openSettings: 'Przejdz do ustawien',
    languageTitle: 'Wybor jezyka',
    languageText: 'Zmiana jezyka dziala globalnie dla landing page, dashboardu i paneli narzedzi.',
    languageSaved: 'Preferencja jezyka zapisana dla tego uzytkownika przegladarki.',
    languageSavedAt: 'Ostatni zapis',
    adminTitle: 'Jak zalogowac sie do panelu admina',
    oauthTitle: 'Google OAuth (mobile app)',
    oauthText: 'Logowanie przez Google jest teraz aktywne w aplikacji mobilnej Expo (przycisk "Continue with Google"). W panelu web zostaje szybka rejestracja MVP.',
    adminSteps: [
      '1. Otworz panel Moje konto albo widok Admin Panel.',
      '2. Podaj email z ADMIN_EMAIL oraz haslo z ADMIN_PASSWORD.',
      '3. Wpisz 6-cyfrowy kod TOTP z aplikacji 2FA skonfigurowanej dla ADMIN_TOTP_SECRET.',
      '4. Po zalogowaniu przejdz do Ustawien, uzupelnij klucze API i zweryfikuj feature flags.',
      '5. Na koniec sprawdz Admin Panel: audit log, publish queue, alerty i retry DLQ.',
    ],
  },
  en: {
    title: 'My account',
    subtitle: 'Account hub for admin session, language settings, and next setup steps.',
    profileTitle: 'Workspace profile',
    profileText: 'USInf.com Growth Workspace. This area gives you quick access to language, admin session, and the next configuration steps.',
    statusTitle: 'Session status',
    statusAdmin: 'Administrator session is active',
    statusGuest: 'No active administrator session',
    role: 'Role',
    security: '2FA',
    enabled: 'enabled',
    login: 'Login',
    logout: 'Logout',
    openAdmin: 'Open admin panel',
    openSettings: 'Open settings',
    languageTitle: 'Language selection',
    languageText: 'Language changes apply globally to the landing page, dashboard, and tool panels.',
    languageSaved: 'Language preference is saved for this browser user profile.',
    languageSavedAt: 'Last saved',
    adminTitle: 'How to sign in to the admin panel',
    oauthTitle: 'Google OAuth (mobile app)',
    oauthText: 'Google sign-in is currently enabled in the Expo mobile app ("Continue with Google" button). The web panel keeps the lightweight MVP registration flow.',
    adminSteps: [
      '1. Open My Account or the Admin Panel view.',
      '2. Enter the email from ADMIN_EMAIL and the password from ADMIN_PASSWORD.',
      '3. Enter the 6-digit TOTP code from the 2FA app configured for ADMIN_TOTP_SECRET.',
      '4. After signing in, go to Settings, fill in API keys, and verify feature flags.',
      '5. Then review the Admin Panel: audit log, publish queue, alerts, and DLQ retries.',
    ],
  },
  es: {
    title: 'Mi cuenta',
    subtitle: 'Centro de cuenta para la sesion de administrador, idioma y siguientes pasos de configuracion.',
    profileTitle: 'Perfil del workspace',
    profileText: 'USInf.com Growth Workspace. Aqui tienes acceso rapido al idioma, la sesion de administrador y los siguientes pasos de configuracion.',
    statusTitle: 'Estado de la sesion',
    statusAdmin: 'La sesion de administrador esta activa',
    statusGuest: 'No hay una sesion de administrador activa',
    role: 'Rol',
    security: '2FA',
    enabled: 'activo',
    login: 'Iniciar sesion',
    logout: 'Cerrar sesion',
    openAdmin: 'Abrir panel de admin',
    openSettings: 'Abrir ajustes',
    languageTitle: 'Seleccion de idioma',
    languageText: 'El cambio de idioma se aplica globalmente a la landing page, el dashboard y los paneles de herramientas.',
    languageSaved: 'La preferencia de idioma se guarda para este perfil de navegador.',
    languageSavedAt: 'Ultimo guardado',
    adminTitle: 'Como iniciar sesion en el panel admin',
    oauthTitle: 'Google OAuth (app movil)',
    oauthText: 'El inicio de sesion con Google esta activo en la app movil Expo (boton "Continue with Google"). En web se mantiene el flujo ligero de registro MVP.',
    adminSteps: [
      '1. Abre Mi cuenta o la vista Admin Panel.',
      '2. Introduce el correo de ADMIN_EMAIL y la contrasena de ADMIN_PASSWORD.',
      '3. Introduce el codigo TOTP de 6 digitos desde la app 2FA configurada para ADMIN_TOTP_SECRET.',
      '4. Despues de iniciar sesion, entra en Ajustes, completa las claves API y verifica las feature flags.',
      '5. Luego revisa el Admin Panel: audit log, publish queue, alertas y reintentos DLQ.',
    ],
  },
};

export default function AccountPanel({ isAdmin, role, onLogin, onLogout }: Props) {
  const { language, lastSavedAt } = useI18n();
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
    fetch('/api/usage/topup')
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
    const savedEmail = localStorage.getItem('usinf_signup_email') || '';
    if (savedName) setSignupName(savedName);
    if (savedEmail) setSignupEmail(savedEmail);

    const payment = new URLSearchParams(window.location.search).get('payment');
    const kind = new URLSearchParams(window.location.search).get('kind');
    if (payment === 'success') {
      setPaymentMessage(language === 'pl'
        ? kind === 'topup'
          ? 'Platnosc przyjeta. Finalizujemy pakiet i zapis entitlementu.'
          : 'Platnosc przyjeta. Finalizujemy status subskrypcji.'
        : language === 'es'
          ? kind === 'topup'
            ? 'Pago recibido. Estamos finalizando el paquete y el entitlement.'
            : 'Pago recibido. Estamos finalizando el estado de la suscripcion.'
          : kind === 'topup'
            ? 'Payment received. We are finalizing your pack entitlement.'
            : 'Payment received. We are finalizing your subscription status.');
    } else if (payment === 'cancelled') {
      setPaymentMessage(language === 'pl' ? 'Płatność anulowana.' : language === 'es' ? 'Pago cancelado.' : 'Payment cancelled.');
    }

    return () => {
      active = false;
    };
  }, []);

  function quickRegister() {
    const name = signupName.trim();
    const email = signupEmail.trim();

    if (!name || !email.includes('@')) {
      setSignupMessage(language === 'pl' ? 'Podaj poprawne imie i email.' : language === 'es' ? 'Introduce nombre y email correctos.' : 'Provide valid name and email.');
      return;
    }

    localStorage.setItem('usinf_signup_name', name);
    localStorage.setItem('usinf_signup_email', email);
    setSignupMessage(language === 'pl' ? 'Konto utworzone (MVP) dla tego profilu przegladarki.' : language === 'es' ? 'Cuenta creada (MVP) para este perfil del navegador.' : 'Account created (MVP) for this browser profile.');
  }

  async function buyTopUp(packId: TopUpPack['id']) {
    setTopUpLoadingId(packId);
    setTopUpMessage('');
    try {
      const customerEmail = localStorage.getItem('usinf_signup_email') || '';
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'topup', packId, customerEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTopUpMessage(data?.error || 'Nie udalo sie dokupic pakietu.');
      } else if (data.checkoutMode === 'stripe' && data.url) {
        window.location.assign(data.url);
      } else {
        setTopUpMessage(language === 'pl' ? 'Nie udalo sie uruchomic Stripe Checkout.' : language === 'es' ? 'No se pudo iniciar Stripe Checkout.' : 'Could not start Stripe Checkout.');
      }
    } catch {
      setTopUpMessage('Blad polaczenia z API.');
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

      <div className="grid-2" style={{ gap: 16 }}>
        {paymentMessage ? <div className="alert alert-info" style={{ gridColumn: '1 / -1' }}>{paymentMessage}</div> : null}

        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <UserCircle2 size={16} color="var(--cyan)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.profileTitle}</h3>
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{t.profileText}</p>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            <input
              type="text"
              placeholder={language === 'pl' ? 'Imie i nazwisko' : language === 'es' ? 'Nombre y apellido' : 'Full name'}
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={quickRegister}>
              {language === 'pl' ? 'Zarejestruj sie' : language === 'es' ? 'Registrarme' : 'Register'}
            </button>
            {signupMessage ? <div className="alert alert-info">{signupMessage}</div> : null}
          </div>

          <div className="alert alert-warning" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.oauthTitle}</div>
            <div>{t.oauthText}</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <ShieldCheck size={16} color="var(--green)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.statusTitle}</h3>
          </div>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            {isAdmin ? t.statusAdmin : t.statusGuest}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
            <div>{t.role}: <strong style={{ color: 'var(--text)' }}>{role || '-'}</strong></div>
            <div>{t.security}: <strong style={{ color: 'var(--text)' }}>{isAdmin ? t.enabled : '-'}</strong></div>
          </div>
          <div className="flex items-center gap-8" style={{ gap: 8, flexWrap: 'wrap' }}>
            {!isAdmin && <button className="btn btn-primary btn-sm" onClick={onLogin}><LogIn size={14} /> {t.login}</button>}
            {isAdmin && <button className="btn btn-danger btn-sm" onClick={onLogout}><LogOut size={14} /> {t.logout}</button>}
            {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => window.dispatchEvent(new CustomEvent('usinf:navigate', { detail: '/dashboard/admin' }))}><LayoutDashboard size={14} /> {t.openAdmin}</button>}
            {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => window.dispatchEvent(new CustomEvent('usinf:navigate', { detail: '/dashboard/settings' }))}><Settings size={14} /> {t.openSettings}</button>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <Languages size={16} color="var(--violet)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.languageTitle}</h3>
          </div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{t.languageText}</p>
          <div style={{ marginTop: 14, marginBottom: 12 }}>
            <LanguageSwitcher />
          </div>
          <div className="alert alert-info">
            <div>
              <div>{t.languageSaved}</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                {t.languageSavedAt}: {lastSavedAt || '-'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <KeyRound size={16} color="var(--yellow)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.adminTitle}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
            {t.adminSteps.map((step) => <div key={step}>{step}</div>)}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <ShieldCheck size={16} color="var(--cyan)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>
              {language === 'pl' ? 'Jednorazowe dokupienie kredytow contentu' : language === 'es' ? 'Compra unica de creditos de contenido' : 'One-time content credit top-up'}
            </h3>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
            {language === 'pl'
              ? 'Gdy wyczerpiesz dzienny limit planu, system automatycznie zuzyje najpierw dokupione kredyty contentu.'
              : language === 'es'
                ? 'Cuando se agota el limite diario del plan, el sistema usa primero los creditos de contenido comprados.'
                : 'When your daily plan limit is exhausted, the system automatically consumes purchased content credits first.'}
          </p>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            {language === 'pl' ? 'Pozostale kredyty contentu' : language === 'es' ? 'Creditos de contenido restantes' : 'Remaining content credits'}: <strong>{remaining}</strong>
          </div>
          <div className="grid-3" style={{ gap: 12 }}>
            {packs.map((pack) => (
              <div className="card" key={pack.id} style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong>{pack.label}</strong>
                  <span className="badge badge-cyan" style={{ fontSize: 11 }}>{pack.generations} gen</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>${pack.priceUsd}</div>
                <button className="btn btn-primary btn-sm" disabled={topUpLoadingId === pack.id} onClick={() => buyTopUp(pack.id)}>
                  {topUpLoadingId === pack.id
                    ? (language === 'pl' ? 'Przetwarzanie...' : language === 'es' ? 'Procesando...' : 'Processing...')
                    : (language === 'pl' ? 'Dokup teraz' : language === 'es' ? 'Comprar ahora' : 'Buy now')}
                </button>
                {pack.bonusLabel ? <div style={{ marginTop: 8, color: 'var(--cyan)', fontSize: 12 }}>{pack.bonusLabel}</div> : null}
              </div>
            ))}
          </div>
          {topUpMessage ? <div className="alert alert-info" style={{ marginTop: 12 }}>{topUpMessage}</div> : null}
        </div>
      </div>
    </div>
  );
}
