# Trader OS V1

Couche de renseignement financier construite autour de World Monitor. Cette version est volontairement limitée au **paper trading**.

## Fonctionnalités présentes

- adaptateur World Monitor avec clé optionnelle ;
- normalisation des événements ;
- scoring d'opportunité sur 100 ;
- moteur de risque indépendant ;
- seuil de risque par opération fixé à 0,5 % ;
- limites journalière et hebdomadaire ;
- API `POST /api/trader/analyse` ;
- tableau de bord de démonstration ;
- migration Supabase non destructive ;
- aucun courtier connecté et aucune exécution réelle.

## Lancer localement

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir ensuite `http://localhost:3000` et utiliser **Tester le moteur V1**.

## Exemple d'appel

```bash
curl -X POST http://localhost:3000/api/trader/analyse \
  -H 'Content-Type: application/json' \
  -d '{
    "signals": {
      "credibility": 90,
      "novelty": 75,
      "surprise": 70,
      "economicImpact": 80,
      "assetSensitivity": 85,
      "marketConfirmation": 65,
      "liquidity": 90,
      "rewardRisk": 75,
      "alreadyPriced": 25,
      "contradictions": 15
    },
    "trade": {
      "capital": 10000,
      "entry": 100,
      "stop": 96,
      "openCorrelatedPositions": 0,
      "dailyLossPct": 0,
      "weeklyLossPct": 0
    }
  }'
```

## Prochaines étapes

1. confirmer les outils World Monitor disponibles avec la clé du compte ;
2. implémenter un collecteur périodique et le dédoublonnage ;
3. ajouter le graphe événement → pays → secteur → actif ;
4. brancher Supabase après validation de la migration ;
5. ajouter Telegram et les validations humaines ;
6. construire le replay historique et le paper broker ;
7. ne considérer le trading réel qu'après une période de validation mesurée.

## Sécurité

Le fichier `lib/trader/config.js` verrouille le mode sur `paper`. La V1 ne contient aucune fonction d'envoi d'ordre réel.
