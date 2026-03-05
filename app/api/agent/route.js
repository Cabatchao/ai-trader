import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import yahooFinance from 'yahoo-finance2';
import { sql } from '@vercel/postgres';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { capital, horizon, risque, objectif, typeActif } = await req.json();

    // 1. 🧠 LECTURE DE LA MÉMOIRE (On récupère les erreurs du passé)
    let leconsApprises = "Aucune leçon pour le moment.";
    try {
      const dbLecons = await sql`SELECT lecon_apprise FROM journal_trading WHERE lecon_apprise IS NOT NULL ORDER BY id DESC LIMIT 5`;
      if (dbLecons.rows.length > 0) {
        leconsApprises = dbLecons.rows.map(r => "- " + r.lecon_apprise).join("\n");
      }
    } catch (e) { console.log("Mémoire vide."); }

    // 2. 🕵️‍♂️ L'IA CHOISIT D'ABORD LES BONS TICKERS
    const promptTickers = `Tu es un expert financier. Donne-moi EXACTEMENT 3 symboles boursiers américains (Tickers) parfaits pour cet univers : ${typeActif} et horizon : ${horizon}.
    RÉPONDS UNIQUEMENT PAR LES 3 TICKERS SÉPARÉS PAR DES VIRGULES, sans aucun autre mot. Ex: AAPL,MSFT,TSLA`;

    const chat1 = await groq.chat.completions.create({
      messages:[{ role: 'user', content: promptTickers }],
      model: 'llama-3.3-70b-versatile',
    });
    const tickersBruts = chat1.choices[0]?.message?.content.trim();
    const listeTickers = tickersBruts.split(',').map(t => t.trim().toUpperCase());

    // 3. 📡 RÉCUPÉRATION DES VRAIS PRIX EN TEMPS RÉEL
    let vraisPrix = "";
    for (const ticker of listeTickers) {
      try {
        const quote = await yahooFinance.quote(ticker);
        vraisPrix += `\n- ${ticker} : VRAI PRIX ACTUEL EN DIRECT = ${quote.regularMarketPrice} $`;
      } catch (err) {
        vraisPrix += `\n- ${ticker} : (Prix direct indisponible, utilise ta meilleure estimation).`;
      }
    }

    // 4. 🧠 LE SUPER-PROMPT FINAL AVEC VRAIS PRIX ET MÉMOIRE
    const perteMaxEuros = ((capital * risque) / 100).toFixed(2);

    const promptFinal = `
      Tu es un gestionnaire de Hedge Fund IA. Objectif de réussite : 85%.
      
      ⚠️ TES RÈGLES D'APPRENTISSAGE (NE REFAIS JAMAIS CES ERREURS) :
      ${leconsApprises}

      PROFIL : Capital ${capital}€, Risque max ${perteMaxEuros}€, Horizon ${horizon}.
      
      📈 VRAIS PRIX DU MARCHÉ À LA SECONDE PRÈS :
      ${vraisPrix}

      MISSION :
      Fais ton analyse McKinsey/Goldman/Bridgewater sur ces 3 actifs.
      - Utilise OBLIGATOIREMENT les vrais prix que je viens de te donner pour calculer les entrées.
      - Calcule la taille de position exacte pour que la perte au Stop-Loss ne dépasse jamais ${perteMaxEuros}€.
    `;

    const chat2 = await groq.chat.completions.create({
      messages:[{ role: 'user', content: promptFinal }],
      model: 'llama-3.3-70b-versatile',
    });

    const reponseIA = chat2.choices[0]?.message?.content;

    // 5. 💾 SAUVEGARDE DU TRADE POUR LE FUTUR JUGEMENT
    try {
      await sql`INSERT INTO journal_trading (actif_propose, analyse_complete, statut) VALUES (${tickersBruts}, ${reponseIA}, 'EN_COURS')`;
    } catch (e) { console.log("Erreur sauvegarde."); }

    return NextResponse.json({ analyse: reponseIA });

  } catch (error) {
    return NextResponse.json({ analyse: "Erreur IA : " + error.message });
  }
}
