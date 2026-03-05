import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 🛑 LA LIGNE MAGIQUE QUI CASSE LE CACHE (OBLIGATOIRE)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ordre de création de la table
    await sql`
      CREATE TABLE IF NOT EXISTS journal_trading (
          id SERIAL PRIMARY KEY,
          date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          actif_propose VARCHAR(100),
          analyse_complete TEXT,
          statut VARCHAR(50) DEFAULT 'EN_COURS',
          lecon_apprise TEXT
      );
    `;
    
    return NextResponse.json({ 
      message: "🚀 BINGO ! Le cache est vidé, la connexion est réussie et la mémoire est créée !" 
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      erreur: "Erreur en direct : " + error.message,
      astuce: "La base de données était peut-être endormie. Rafraîchis la page (F5) dans 10 secondes !"
    }, { status: 500 });
  }
}
