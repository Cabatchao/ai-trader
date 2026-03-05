import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ce code va forcer la création de la table de mémoire
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
      message: "🎉 SUCCÈS TOTAL ! La table de mémoire a été créée parfaitement dans la base de données. Tu peux fermer cette page." 
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      erreur: "Aïe, il y a eu un problème : " + error.message 
    }, { status: 500 });
  }
}
