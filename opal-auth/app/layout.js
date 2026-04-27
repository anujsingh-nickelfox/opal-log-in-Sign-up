import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Opal — Authentication System',
  description: 'Secure Login & Registration Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
