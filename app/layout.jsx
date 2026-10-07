import Script from 'next/script';
import { Vazirmatn, Aref_Ruqaa, Cormorant_Garamond } from 'next/font/google';
import { PreferencesProvider } from '@/components/providers/Preferences';
import BottomNav from '@/components/user/nav/BottomNav';
import './globals.css';

const body = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-body', display: 'swap' });
const displayFa = Aref_Ruqaa({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-display-fa', display: 'swap' });
const displayEn = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display-en', display: 'swap' });

export const metadata = {
  title: 'بهارنارنج',
  description: 'سامانه رزرو اقامتگاه بهارنارنج',
};

// Runs before first paint so a saved English choice never flashes Persian first.
const preferenceScript = `(function(){try{if(localStorage.getItem('bn-lang')==='en'){var d=document.documentElement;d.lang='en';d.dir='ltr'}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${body.variable} ${displayFa.variable} ${displayEn.variable}`}>
      <body>
        <Script id="bn-lang" strategy="beforeInteractive">{preferenceScript}</Script>
        <PreferencesProvider>
          {children}
          <BottomNav />
        </PreferencesProvider>
      </body>
    </html>
  );
}
