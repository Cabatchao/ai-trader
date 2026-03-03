import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import YahooFinance from 'yahoo-finance2';

// Initialisation des outils (C'est ici que se trouve la correction !)
const yahooFinance = new YahooFinance();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { ticker } = await req.json();

    // 1. Récupération des vrais prix sur internet
    const quote = await yahooFinance.quote(ticker);
    const prixActuel = quote.regularMarketPrice;

    // 2. Le Super-Prompt (Nos 3 agents réunis)
    const prompt = `
      Tu es un Comité d'Investissement composé de 3 experts :
      1. Agent Macro (McKinsey)
      2. Agent Technique (Citadel)
      3. Risk Manager (Bridgewater)

      L'action demandée est ${ticker}. Le prix actuel sur le marché est de ${prixActuel} $.
      L'utilisateur a un capital virtuel de 10 000 $ et refuse de perdre plus de 2% (soit 200 $) sur ce trade.

      MISSION :
      Rédige un rapport structuré avec :
      - Tendance Macro (rapide)
      - Analyse Technique (donne un prix d'entrée idéal, un stop-loss mathématique et un take-profit).
      - Risk Management : Calcule exactement combien d'actions l'utilisateur peut acheter au maximum pour ne pas dépasser 200 $ de perte si le stop-loss est touché.
      
      Sois précis, professionnel, et direct.
    `;

    // 3. Appel à Llama-3 (Groq)
    const chatCompletion = await groq.chat.completions.create({
      messages:[{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
    });

    const reponseIA = chatCompletion.choices[0]?.message?.content;

    return NextResponse.json({ analyse: reponseIA });

  } catch (error) {
    return NextResponse.json({ analyse: "Oups, une erreur s'est produite : " + error.message });
  }
}
