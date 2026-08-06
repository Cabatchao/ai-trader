# World Monitor Trader OS — V1

Trader OS est une couche d'intelligence événementielle destinée à transformer des signaux de World Monitor en hypothèses de marché contrôlées.

## État de la V1

- paper trading uniquement ;
- aucun courtier connecté ;
- risque maximal par proposition : 0,5 % du capital ;
- score d'opportunité sur 100 ;
- blocage en cas de perte quotidienne, perte hebdomadaire ou corrélation excessive ;
- adaptateur World Monitor prêt à recevoir une clé API ;
- migration Supabase fournie mais non exécutée automatiquement ;
- build Next.js validé par GitHub Actions.

## Architecture

```text
World Monitor
    ↓
normalisation des événements
    ↓
scoring d'opportunité
    ↓
contrôle indépendant du risque
    ↓
paper trading
    ↓
validation humaine
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` et compléter uniquement les services utilisés.

```bash
TRADER_MODE=paper
WORLD_MONITOR_BASE_URL=https://worldmonitor.app
WORLD_MONITOR_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`TRADER_MODE` doit rester sur `paper`. Toute autre valeur bloque le moteur.

## Lancement local

```bash
npm install
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## Test de l'API

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

## Base de données

Le fichier `supabase/migrations/001_trader_os_v1.sql` prépare les tables de la V1. Il ne doit être appliqué à une base distante qu'après validation explicite.

## Déploiement

Le code compile correctement. Le projet Vercel historique possède toutefois une ancienne intégration de stockage qui échoue avant le build (`Provisioning integration failed`). Cette ressource doit être déconnectée du projet Vercel ou le projet doit être recréé proprement sans l'ancienne intégration.

## Étapes suivantes

1. connecter réellement World Monitor ;
2. enrichir le graphe événement → secteur → actif ;
3. stocker événements et hypothèses dans Supabase ;
4. ajouter le replay historique sans fuite de données futures ;
5. connecter un fournisseur de données de marché fiable ;
6. conserver l'exécution réelle désactivée jusqu'à validation statistique.
