export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#050816', color: '#e5edf9', padding: 24, textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: 28, marginBottom: 12, letterSpacing: '-0.04em' }}>UFInf Pricing</h1>
        <p style={{ opacity: 0.75, maxWidth: 520, lineHeight: 1.6 }}>
          Choose the best UFInf plan for your growth engine and scale across all platforms.
        </p>
        <a href="/#pricing" style={{ display: 'inline-block', marginTop: 16, color: '#22d3ee', textDecoration: 'none', fontWeight: 700 }}>
          Open full pricing comparison
        </a>
      </div>
    </main>
  );
}