import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Familjen_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const display = Big_Shoulders({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '800', '900'],
  variable: '--font-big-shoulders',
  display: 'swap',
});
const sans = Familjen_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-familjen',
  display: 'swap',
});
const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Planning Poker',
  description: 'Scrum estimation with friends. No sign-up, no server: open a room, share the link, deal the cards.',
  metadataBase: new URL('https://planning-poker.pngrtz.com'),
  applicationName: 'Planning Poker',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F1ECE0',
};

/** Sets the theme before first paint so there is no light/dark flash. */
const themeScript = `try{var p=JSON.parse(localStorage.getItem('pp:prefs')||'{}').state||{};if(p.theme==='light'||p.theme==='dark')document.documentElement.setAttribute('data-theme',p.theme);if(p.lang==='de')document.documentElement.lang='de'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
