'use client';

import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import { byLanguage, useI18n } from '@/lib/i18n';

const COPY = {
  pl: {
    title: 'Dostęp zabezpieczony',
    subtitle: 'Dashboard UFInf wymaga zalogowania jako administrator.',
    loginPrompt: 'Zaloguj się aby kontynuować',
  },
  en: {
    title: 'Secure access required',
    subtitle: 'UFInf Dashboard requires administrator login.',
    loginPrompt: 'Sign in to continue',
  },
  es: {
    title: 'Acceso seguro requerido',
    subtitle: 'UFInf Dashboard requiere inicio de sesión de administrador.',
    loginPrompt: 'Inicia sesión para continuar',
  },
};

type Props = {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
};

export default function DashboardGuard({ children, onAuthSuccess }: Props) {
  const { language } = useI18n();
  const t = byLanguage(language, COPY);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(Boolean(data.isAdmin));
        setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
        {byLanguage(language, { pl: 'Ładowanie...', en: 'Loading...', es: 'Cargando...' })}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>{t.title}</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 24 }}>{t.subtitle}</p>
        <AdminLogin onSuccess={onAuthSuccess || (() => window.location.reload())} />
      </div>
    );
  }

  return <>{children}</>;
}
