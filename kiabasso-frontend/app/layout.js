import './globals.css';

export const metadata = {
  title: 'Kiabasso - Marketplace Digital',
  description: 'Compra e venda com proteção. O marketplace social de Angola.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-AO">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
