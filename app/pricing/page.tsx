'use client';

import { useEffect } from 'react';

export default function PricingPage() {
  useEffect(() => {
    window.location.replace('/#pricing');
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#050816', color: '#e5edf9', padding: 24, textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.04em' }}>Pricing</h1>
        <p style={{ opacity: 0.75, maxWidth: 520, lineHeight: 1.6 }}>
          Redirecting to the pricing section.
        </p>
      </div>
    </main>
  );
}