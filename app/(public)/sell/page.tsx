import ValuationForm from '@/components/ValuationForm';

export default function SellPage() {
  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '48px 22px' }}>
      <p style={{ fontWeight: 700, fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
        Thinking of selling?
      </p>
      <h1 className="serif" style={{ fontSize: '2rem', margin: '6px 0 20px' }}>Find out what your home is really worth.</h1>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid var(--line)' }}>
        <ValuationForm />
      </div>
    </main>
  );
}
