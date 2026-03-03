import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    // On récupère le profil que l'utilisateur a tapé dans le formulaire
    const { capital, horizon, risque, objectif } = await req.json();

    const perteMaxEuros = (capital * risque) / 100;

    // Le Super-Prompt dynamique
    const prompt = `
      Tu es un gestionnaire de Hedge Fund IA composé de 3 agents institutionnels (McKinsey, Goldman Sachs, Bridgewater).
      
      PROFIL DE L'INVESTISSEUR :
      - Capital total disponible : ${capital} €
      - Horizon d'investissement visé : ${horizon}
      - Objectif financier : ${objectif}
      - Tolérance au risque : Perte stricte maximale de ${risque}% par trade (soit ${perteMaxEuros} € maximum de perte si le trade échoue).

      TA MISSION OBLIGATOIRE EN 3 ÉTAPES :
      
      1. ANALYSE MACRO (Façon McKinsey)
      Fais un point ultra-rapide sur le contexte économique actuel. Dis-moi quels sont les 2 secteurs d'activité qui vont surperformer sur mon horizon de temps (${horizon}).

      2. SÉLECTION D'ACTIONS (Façon Goldman Sachs)
      Ne me demande pas quelle action analyser. C'est À TOI de chercher et de me SUGGÉRER 3 actions (Tickers) précises qui sont parfaites pour mon horizon de temps et la macro actuelle. Choisi des actifs liquides.

      3. RISK MANAGEMENT (Façon Bridgewater)
      Pour chacune des 3 actions suggérées, tu dois me faire un plan d'action STRICT :
      - Nom de l'entreprise et Ticker.
      - Pourquoi ce choix correspond à mon profil.
      - Zone de Prix d'Entrée idéal.
      - Objectif de Revente (Take Profit).
      - Niveau de Stop-Loss (Prix d'invalidation).
      - POSITION SIZING OBLIGATOIRE : Dis-moi EXACTEMENT combien d'actions je dois acheter. Calcule-le pour que si le Stop-Loss est touché, ma perte ne dépasse JAMAIS les ${perteMaxEuros} € autorisés.

      Mets des titres clairs, des emojis, et sois tranchant comme un vrai trader pro de Wall Street. Ne fais pas de blabla inutile.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages:[{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });

    const reponseIA = chatCompletion.choices[0]?.message?.content;

    return NextResponse.json({ analyse: reponseIA });

  } catch (error) {
    return NextResponse.json({ analyse: "Erreur du serveur IA : " + error.message });
  }
}
