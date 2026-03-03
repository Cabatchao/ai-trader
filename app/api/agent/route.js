import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { capital, horizon, risque, objectif, typeActif } = await req.json();

    const perteMaxEuros = ((capital * risque) / 100).toFixed(2);
    // On force l'IA à diviser le budget pour les 3 actions recommandées
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

      CONTRAINTES DE BUDGET OBLIGATOIRES (INTERDICTION ABSOLUE DE LES ENFREINDRE) :
      1. Le prix actuel d'une seule unité de l'actif (1 action ou 1 ETF) DOIT IMPÉRATIVEMENT être inférieur au capital total de ${capital} €. 
      2. Idéalement, le prix unitaire doit même être inférieur à ${budgetParActif} € pour pouvoir diversifier. 
      3. Si l'utilisateur a 100€, NE LUI PROPOSE JAMAIS une action classique qui coûte 150€ l'unité ! Dans ce cas, cherche des actions "abordables" (Small/Mid caps, Penny stocks) ou précise que l'achat se fait via des "fractions d'actions" (si le courtier le permet) ou des cryptos divisibles.
      4. Le montant total investi sur une seule position (Quantité d'actions multipliée par le Prix unitaire) ne doit JAMAIS dépasser ${capital} €.

      TA MISSION EN 3 ÉTAPES :
      
      1. ANALYSE MACRO (Façon McKinsey)
      Contexte actuel pour la catégorie "${typeActif}".

      2. SÉLECTION D'ACTIFS (Façon Goldman Sachs)
      Suggère 3 actifs de la catégorie "${typeActif}". 
      RAPPEL : Leurs prix unitaires DOIVENT ÊTRE COMPATIBLES avec le budget de l'utilisateur !

      3. RISK MANAGEMENT (Façon Bridgewater)
      Pour chacun des 3 actifs, donne un plan d'action STRICT :
      - Nom et Ticker.
      - Zone de Prix d'Entrée actuel exact (Prouve-moi que ce prix est inférieur à ${capital} €).
      - Objectif de Revente (Take Profit).
      - Niveau de Stop-Loss.
      - POSITION SIZING MATHÉMATIQUE (Obligatoire) : 
         * Formule : Quantité = ${perteMaxEuros} € / (Prix d'Entrée - Prix Stop-Loss).
         * Dis-moi exactement le NOMBRE d'unités à acheter.
         * Dis-moi le MONTANT TOTAL INVESTI (= Quantité * Prix d'Entrée). Ce montant doit être < ${capital} €.
         * Valide en écrivant : "Vérification du risque : Si le stop est touché, la perte sera de ${perteMaxEuros} €".
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
