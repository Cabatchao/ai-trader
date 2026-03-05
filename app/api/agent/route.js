import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { sql } from '@vercel/postgres'; // L'outil qui connecte à ta mémoire !

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { capital, horizon, risque, objectif, typeActif } = await req.json();

    const perteMaxEuros = ((capital * risque) / 100).toFixed(2);
    const budgetParActif = (capital / 3).toFixed(2); 

    const prompt = `
      Tu es un gestionnaire de Hedge Fund IA composé de 3 agents institutionnels (McKinsey, Goldman Sachs, Bridgewater).
      
      PROFIL DE L'INVESTISSEUR :
      - Capital total disponible : ${capital} €
      - Budget maximum alloué par actif : environ ${budgetParActif} € (car on divise le capital sur 3 positions).
      - Horizon d'investissement : ${horizon}
      - Objectif financier : ${objectif}
      - Tolérance au risque : Perte stricte maximale de ${risque}% par trade (soit ${perteMaxEuros} € maximum).
      - UNIVERS D'INVESTISSEMENT CIBLÉ : ${typeActif}

      CONTRAINTES DE BUDGET OBLIGATOIRES :
      1. Le prix unitaire de l'actif DOIT être inférieur à ${capital} €. 
      2. Le montant total investi sur une seule position ne doit JAMAIS dépasser ${capital} €.

      TA MISSION EN 3 ÉTAPES :
      1. ANALYSE MACRO (Façon McKinsey)
      2. SÉLECTION D'ACTIFS (Façon Goldman Sachs) : Suggère 3 actifs de la catégorie "${typeActif}".
      3. RISK MANAGEMENT (Façon Bridgewater) : Pour chaque actif, donne un plan STRICT (Entrée, Take Profit, Stop-Loss, et Quantité exacte à acheter).

      Mets des titres clairs, des emojis, et sois tranchant.
    `;

    // 1. L'IA réfléchit et génère son rapport
    const chatCompletion = await groq.chat.completions.create({
      messages:[{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });

    const reponseIA = chatCompletion.choices[0]?.message?.content;

    // 2. 🧠 LA SAUVEGARDE DANS LA MÉMOIRE (DEEP LEARNING)
    try {
      // On insère l'analyse de l'IA dans la base de données Postgres
      await sql`
        INSERT INTO journal_trading (actif_propose, analyse_complete, statut)
        VALUES (${typeActif}, ${reponseIA}, 'EN_COURS')
      `;
    } catch (dbError) {
      console.log("Erreur de sauvegarde DB, mais on continue :", dbError);
    }

    // 3. On affiche la réponse à l'utilisateur sur le site
    return NextResponse.json({ analyse: reponseIA });

  } catch (error) {
    return NextResponse.json({ analyse: "Erreur du serveur IA : " + error.message });
  }
}
