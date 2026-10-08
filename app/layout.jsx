import { cookies } from 'next/headers';
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

// The language lives in a cookie, so the server renders the right <html lang dir> and the right text from the first byte.
// No inline <script>, no flash of the wrong language, no server/client mismatch.
export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get('bn-lang')?.value === 'en' ? 'en' : 'fa';

  return (
    <html lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'} className={`${body.variable} ${displayFa.variable} ${displayEn.variable}`}>
      <body>
        <PreferencesProvider initialLang={lang}>
          {children}
          <BottomNav />
        </PreferencesProvider>
      </body>
    </html>
  );
}
