import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--emerald-deep)', color: 'var(--ivory)', textAlign: 'center', padding: 24, position: 'relative' }}>
      <Link href="/login" style={{ position: 'absolute', top: 20, right: 24, color: 'var(--gold-bright)', fontWeight: 600, fontSize: '.85rem' }}>Agent login →</Link>
      <div>
        <h1 className="serif" style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', maxWidth: '15ch', margin: '0 auto' }}>
          The Midrand estate belt, sold properly.
        </h1>
        <p style={{ opacity: 0.85, margin: '18px 0 28px' }}>
          The public homepage renders here — port the hero and listings from mcafful-website.html.
        </p>
        <Link href="/sell" className="btn-gold">What&apos;s my home worth?</Link>
      </div>
    </main>
  );
}
