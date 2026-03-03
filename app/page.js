'use client';
import { useState } from 'react';

export default function Home() {
  const [capital, setCapital] = useState(10000);
  const[horizon, setHorizon] = useState('Semaine (Swing Trading)');
  const [risque, setRisque] = useState('2');
  const [objectif, setObjectif] = useState('Croissance agressive (Gros potentiel de gain)');
  const [typeActif, setTypeActif] = useState('Tout sélectionner (Mix Diversifié)');
  
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const lancerScreener = async () => {
    setLoading(true);
    setResult(`L'Agent recherche les meilleures opportunités en ${typeActif}... Patiente environ 10 secondes.`);
    
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capital, horizon, risque, objectif, typeActif })
      });
      const data = await res.json();
      setResult(data.analyse || "Erreur lors de l'analyse.");
    } catch (error) {
      setResult("Erreur de connexion avec le serveur.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', backgroundColor: '#0a0a0a', color: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#0070f3' }}>🤖 AI Hedge Fund - Création de Portefeuille</h1>
      <p>Sélectionne tes préférences. L'IA te suggérera les meilleurs actifs adaptés à tes règles.</p>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', maxWidth: '600px', marginBottom: '30px' }}>
        
        <div style={{ marginBottom: '15px' }}>
          <label>💰 Capital à investir (€) : </label>
          <input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px', color: 'black', borderRadius: '5px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>⏳ Horizon de Trading : </label>
          <select value={horizon} onChange={(e) => setHorizon(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px', color: 'black', borderRadius: '5px' }}>
            <option>Jour (Day Trading)</option>
            <option>Semaine (Swing Trading)</option>
            <option>Mois (Position Trading)</option>
            <option>Année et plus (Investissement Long Terme)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>🛡️ Risque Max par trade : </label>
          <select value={risque} onChange={(e) => setRisque(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px', color: 'black', borderRadius: '5px' }}>
            <option value="1">1% - Très Prudent (Institutionnel)</option>
            <option value="2">2% - Équilibré (Recommandé)</option>
            <option value="5">5% - Dynamique (Haut Risque)</option>
            <option value="10">10% - Kamikaze (Spéculation extrême)</option>
          </select>
          <small style={{ color: '#888' }}>Soit une perte maximale de {(capital * risque) / 100} € par position.</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>🎯 Objectif principal : </label>
          <select value={objectif} onChange={(e) => setObjectif(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px', color: 'black', borderRadius: '5px' }}>
            <option>Croissance agressive (Gros potentiel de gain)</option>
            <option>Rendement régulier (Dividendes & Sécurité)</option>
            <option>Préservation du capital (Risque minimum)</option>
            <option>Spéculation pure (Volatilité maximale)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>💎 Type d'Actif préféré : </label>
          <select value={typeActif} onChange={(e) => setTypeActif(e.target.value)} style={{ padding: '8px', width: '100%', marginTop: '5px', color: 'black', borderRadius: '5px', border: '2px solid #0070f3' }}>
            <option>Tout sélectionner (Mix Diversifié)</option>
            <option>Actions (Entreprises cotées en Bourse)</option>
            <option>ETF (Fonds indiciels)</option>
            <option>Cryptomonnaies (Bitcoin, Ethereum, etc.)</option>
            <option>Matières Premières (Or, Pétrole, Argent, etc.)</option>
          </select>
        </div>

        <button onClick={lancerScreener} disabled={loading} style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Recherche en cours...' : 'Générer mon Portefeuille sur-mesure'}
        </button>
      </div>

      {result && (
        <div style={{ padding: '25px', backgroundColor: '#111', borderRadius: '10px', border: '1px solid #333', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>
          {result}
        </div>
      )}
    </div>
  );
}
