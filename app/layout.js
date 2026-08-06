export const metadata = {
  title: 'World Monitor Trader OS',
  description: 'Analyse événementielle et paper trading avec gestion stricte du risque.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
