'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeSupabaseCodeForSession } from '@/lib/auth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Potwierdzam konto i finalizuje logowanie...');

  useEffect(() => {
    const code = searchParams?.get('code');
    const errorDescription = searchParams?.get('error_description');

    if (errorDescription) {
      setMessage(errorDescription);
      return;
    }

    if (!code) {
      setMessage('Brak kodu weryfikacyjnego. Sprobuj zalogowac sie ponownie.');
      return;
    }

    exchangeSupabaseCodeForSession(code)
      .then(() => {
        router.replace('/dashboard');
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : 'Nie udalo sie potwierdzic konta.');
      });
  }, [router, searchParams]);

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050816 0%,#0a1628 100%)', color: '#e5edf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Autoryzacja UFInf</h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(229,237,249,.75)' }}>{message}</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#050816 0%,#0a1628 100%)', color: '#e5edf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}><div style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: 28 }}><h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Autoryzacja UFInf</h1><p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(229,237,249,.75)' }}>Laduje link aktywacyjny...</p></div></main>}>
      <AuthCallbackContent />
    </Suspense>
  );
}