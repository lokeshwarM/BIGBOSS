import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'BIGBOSS Community — Free Fan Voting & Live Discussions',
  description:
    'Vote free for your favourite Bigg Boss contestant across Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi & Bangla. 1 vote per day per device, live rankings and instant fan chats.',
  openGraph: {
    title: 'BIGBOSS Community — Live Bigg Boss Fan Polling & Evictions',
    description: 'Cast your daily fan vote for Bigg Boss Hindi, Tamil, Telugu, Kannada & more without any sign-up wall!',
    url: 'https://bigboss.community',
    siteName: 'BIGBOSS Community',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        width: 800,
        height: 600,
        alt: 'Bigg Boss Fan Voting',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </head>
      <body className="min-h-screen antialiased flex flex-col transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
