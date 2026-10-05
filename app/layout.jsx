import { Vazirmatn, Aref_Ruqaa, Cormorant_Garamond } from 'next/font/google';
import { PreferencesProvider } from '@/components/providers/Preferences';
import './globals.css';

const body = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-body', display: 'swap' });
const displayFa = Aref_Ruqaa({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-display-fa', display: 'swap' });
const displayEn = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display-en', display: 'swap' });

export const metadata = {
  title: 'بهارنارنج',
  description: 'سامانه رزرو اقامتگاه بهارنارنج',
};

// Runs before first paint so the saved theme/language never flashes.
const preferenceScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('bn-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t;if(localStorage.getItem('bn-lang')==='en'){d.lang='en';d.dir='ltr'}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={`${body.variable} ${displayFa.variable} ${displayEn.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
