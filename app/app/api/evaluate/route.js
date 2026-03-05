
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { sql } from '@vercel/postgres';
import yahooFinance from 'yahoo-finance2';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. On cherche le plus vieux trade "EN_COURS" dans la mémoire
    const oldTrade = await sql`SELECT * FROM journal_trading WHERE statut = 'EN_COURS' ORDER BY date_creation ASC LIMIT 1`;
    
    if (oldTrade.rows.length === 0) {
      return NextResponse.json({ message: "Aucun ancien trade à évaluer pour le moment." });
    }

    const trade = oldTrade.rows[0];
    const tickers = trade.actif_propose.split(',').map(t => t.trim().toUpperCase());

    // 2. On récupère les prix d'AUJOURD'HUI pour voir ce qu'il s'est passé
    let prixAujourdhui = "";
    for (const t of tickers) {
      try {
        const quote = await yahooFinance.quote(t);
        prixAujourdhui += `\n- ${t} vaut aujourd'hui ${quote.regularMarketPrice} $`;
      } catch (err) {}
    }

    // 3. L'IA fait son introspection (Deep Learning)
    const promptEval = `
      Tu es un Evaluateur de Hedge Fund quantitatif.
      Voici une recommandation que tu as faite dans le passé :
      "${trade.analyse_complete}"
      
      Aujourd'hui, voici les vrais prix de ces actions :
      ${prixAujourdhui}

      MISSION :
      1. Compare ton analyse avec les prix d'aujourd'hui. As-tu gagné ou perdu (Touché le Stop-Loss ou le Take Profit) ? Pourquoi ?
      2. Rédige UNE RÈGLE STRICTE ET COURTE (1 phrase) pour corriger ton algorithme et améliorer notre fiabilité vers 85%. (Ex: "Ne plus acheter d'actions tech si le marché est suracheté", etc.)
      RÉPONDS UNIQUEMENT PAR CETTE PHRASE DE LEÇON, rien d'autre.
    `;

    const chatEval = await groq.chat.completions.create({
      messages:[{ role: 'user', content: promptEval }],
      model: 'llama-3.3-70b-versatile',
    });

    const nouvelleLecon = chatEval.choices[0]?.message?.content;

    // 4. On met à jour la mémoire avec la leçon !
    await sql`
      UPDATE journal_trading 
      SET statut = 'CLOTURE', lecon_apprise = ${nouvelleLecon} 
      WHERE id = ${trade.id}
    `;

    return NextResponse.json({ message: "🧠 DEEP LEARNING TERMINÉ : Nouvelle leçon apprise -> " + nouvelleLecon });

  } catch (error) {
    return NextResponse.json({ message: "Erreur évaluation : " + error.message });
  }
}
