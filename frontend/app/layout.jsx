import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'BiggBossPulse — Free Bigg Boss Fan Voting & Live Community',
  description:
    'Vote free for your favourite Bigg Boss contestant across Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi & Bangla. 1 vote per day per device, live rankings and instant fan chats.',
  openGraph: {
    title: 'BiggBossPulse — Live Bigg Boss Fan Polling & Evictions',
    description: 'Cast your daily fan vote for Bigg Boss Hindi, Tamil, Telugu, Kannada & more without any sign-up wall!',
    url: 'https://housepulse.in',
    siteName: 'BiggBossPulse',
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
      <body className="min-h-screen antialiased flex flex-col transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
