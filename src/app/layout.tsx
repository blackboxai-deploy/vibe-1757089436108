import './globals.css';

export const metadata = {
  title: 'Crypto Trends Dashboard',
  description: 'Track, subscribe, and get notifications for your favorite cryptocurrencies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}