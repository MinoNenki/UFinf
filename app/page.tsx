'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import LandingPageLocalized from '@/components/LandingPageLocalized';

export default function Home() {
  const [currentPath, setCurrentPath] = useState('/');
  const [mounted, setMounted] = useState(false);
  const [abVariant, setAbVariant] = useState<'a' | 'b'>('a');

  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);

    const fromQuery = new URLSearchParams(window.location.search).get('ab');
    if (fromQuery === 'a' || fromQuery === 'b') {
      localStorage.setItem('usinf_ab_variant', fromQuery);
      setAbVariant(fromQuery);
    } else {
      const stored = localStorage.getItem('usinf_ab_variant');
      if (stored === 'a' || stored === 'b') {
        setAbVariant(stored);
      } else {
        const picked = Math.random() > 0.5 ? 'a' : 'b';
        localStorage.setItem('usinf_ab_variant', picked);
        setAbVariant(picked);
      }
    }

    const onPop = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#050816' }} />;
  if (currentPath.startsWith('/dashboard')) return <DashboardLayout />;
  return <LandingPageLocalized variant={abVariant} />;
}

