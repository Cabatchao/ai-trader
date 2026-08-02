'use client';

import { useState } from 'react';

const initialSignals = {
  credibility: 90,
  novelty: 75,
  surprise: 70,
  economicImpact: 80,
  assetSensitivity: 85,
  marketConfirmation: 65,
  liquidity: 90,
  rewardRisk: 75,
  alreadyPriced: 25,
  contradictions: 15,
};

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runDemo() {
    setLoading(true);
    try {
      const response = await fetch('/api/trader/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signals: initialSignals,
          trade: { capital: 10000, entry: 100, stop: 96, openCorrelatedPositions: 0, dailyLossPct: 0, weeklyLossPct: 0 },
        }),
      });
      setResult(await response.json());
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#071018', color: '#eef6ff', padding: 32, fontFamily: 'Arial, sans-serif' }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ color: '#63d5ff', fontWeight: 700 }}>WORLD MONITOR × TRADER OS</p>
        <h1 style={{ fontSize: 48, marginBottom: 12 }}>Intelligence événementielle pour le paper trading</h1>
        <p style={{ color: '#a9bac8', lineHeight: 1.6 }}>
          V1 sécurisée : scoring des événements, validation indépendante du risque et aucune exécution réelle.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '28px 0' }}>
          {[
            ['Mode', 'Paper trading uniquement'],
            ['Risque/trade', '0,5 % maximum'],
            ['Source', 'Adaptateur World Monitor'],
            ['Courtier', 'Non connecté'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#0e1b26', border: '1px solid #1e3445', borderRadius: 12, padding: 18 }}>
              <small style={{ color: '#7e96a8' }}>{label}</small>
              <div style={{ marginTop: 8, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <button onClick={runDemo} disabled={loading} style={{ padding: '14px 20px', border: 0, borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>
          {loading ? 'Analyse…' : 'Tester le moteur V1'}
        </button>

        {result && (
          <pre style={{ marginTop: 24, padding: 20, borderRadius: 12, overflow: 'auto', background: '#02070b', border: '1px solid #1e3445' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
