'use client';
import { useState } from 'react';

export default function Home() {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const lancerAnalyse = async () => {
    setLoading(true);
    setResult("Les 3 agents analysent le marché... Patiente un instant.");
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase() })
      });
      const data = await res.json();
      setResult(data.analyse || "Erreur lors de l'analyse.");
    } catch (error) {
      setResult("Erreur de connexion.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', backgroundColor: '#111', color: '#fff', minHeight: '100vh' }}>
      <h1>🤖 AI Hedge Fund Manager</h1>
      <p>Entre le symbole d'une action (ex: AAPL pour Apple, TSLA pour Tesla, MSFT pour Microsoft) :</p>
      
      <input 
        value={ticker} 
        onChange={(e) => setTicker(e.target.value)} 
        placeholder="Ex: TSLA"
        style={{ padding: '10px', fontSize: '18px', width: '200px', marginRight: '10px', color: 'black' }}
      />
      
      <button onClick={lancerAnalyse} disabled={loading} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
        {loading ? 'Analyse en cours...' : 'Analyser'}
      </button>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#222', borderRadius: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
        {result}
      </div>
    </div>
  );
}
