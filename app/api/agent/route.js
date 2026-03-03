import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    // On récupère le profil et la NOUVELLE variable "typeActif"
    const { capital, horizon, risque, objectif, typeActif } = await req.json();

    const perteMaxEuros = (capital * risque) / 100;

    // Le Super-Prompt avec la nouvelle règle sur le Type d'Actif
    const prompt = `
      Tu es un gestionnaire de Hedge Fund IA composé de 3 agents institutionnels (McKinsey, Goldman Sachs, Bridgewater).
      
      PROFIL DE L'INVESTISSEUR :
      - Capital total disponible : ${capital} €
      - Horizon d'investissement : ${horizon}
      - Objectif financier : ${objectif}
      - Tolérance au risque : Perte stricte maximale de ${risque}% par trade (soit ${perteMaxEuros} € maximum).
      - UNIVERS D'INVESTISSEMENT CIBLÉ : ${typeActif}

      TA MISSION OBLIGATOIRE EN 3 ÉTAPES :
      
      1. ANALYSE MACRO (Façon McKinsey)
      Fais un point ultra-rapide sur l'économie. Quel est le contexte actuel pour la catégorie "${typeActif}" ?

      2. SÉLECTION D'ACTIFS (Façon Goldman Sachs)
      RÈGLE D'OR : Tu dois me suggérer 3 actifs qui appartiennent STRICTEMENT à la catégorie "${typeActif}". 
      (Si l'utilisateur a choisi "Tout sélectionner", fais un mix intelligent entre Actions, ETF, Crypto ou Matières Premières).
      Choisis des actifs avec une forte liquidité.

      3. RISK MANAGEMENT (Façon Bridgewater)
      Pour chacun des 3 actifs suggérés, tu dois me faire un plan d'action STRICT :
      - Nom de l'actif et Ticker (ex: AAPL, BTC, GLD).
      - Pourquoi ce choix correspond à mon objectif (${objectif}).
      - Zone de Prix d'Entrée idéal actuel.
      - Objectif de Revente (Take Profit).
      - Niveau de Stop-Loss (Prix d'invalidation).
      - POSITION SIZING OBLIGATOIRE : Dis-moi EXACTEMENT combien de pièces/actions je dois acheter. Calcule-le pour que si le Stop-Loss est touché, la perte ne dépasse JAMAIS les ${perteMaxEuros} € autorisés.

      Mets des titres clairs, des emojis, et sois tranchant. Ne fais pas de blabla inutile.
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
