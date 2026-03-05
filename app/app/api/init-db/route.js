import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// On interdit formellement au site de garder cette page en mémoire (pas de cache)
export const dynamic = 'force-dynamic';

export async function GET() {
  // 1ère étape : Le site vérifie s'il possède bien les clés secrètes de Vercel
  if (!process.env.POSTGRES_URL) {
    return NextResponse.json({ 
      STATUT: "❌ ÉCHEC",
      RAISON: "Le site n'a pas reçu la clé 'POSTGRES_URL'.",
      SOLUTION: "Sur Vercel, va dans l'onglet 'Storage', clique sur ta base de données, et assure-toi qu'elle est bien connectée au projet 'ai-trader'."
    }, { status: 500 });
  }

  // 2ème étape : Si les clés sont là, on crée les tiroirs de la mémoire
  try {
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
      STATUT: "✅ VICTOIRE !",
      MESSAGE: "La base de données est parfaitement connectée et la table mémoire a été créée. Le Deep Learning peut commencer." 
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ 
      STATUT: "⚠️ ERREUR DE CONNEXION",
      MESSAGE: error.message
    }, { status: 500 });
  }
}
