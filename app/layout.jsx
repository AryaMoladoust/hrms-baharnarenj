import { cookies } from 'next/headers';
import { Vazirmatn, Aref_Ruqaa, Cormorant_Garamond } from 'next/font/google';
import { PreferencesProvider } from '@/components/providers/Preferences';
import BottomNav from '@/components/user/nav/BottomNav';
import { SITE } from '@/lib/site';
import { translate } from '@/lib/i18n';
import './globals.css';

const body = Vazirmatn({ subsets: ['arabic', 'latin'], variable: '--font-body', display: 'swap' });
const displayFa = Aref_Ruqaa({ subsets: ['arabic', 'latin'], weight: ['400', '700'], variable: '--font-display-fa', display: 'swap' });
const displayEn = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display-en', display: 'swap' });

// Site-wide search / sharing information. Every page can override title, description and canonical (see app/page.jsx, app/rooms/...).
const verification = {};
if (process.env.GOOGLE_SITE_VERIFICATION) verification.google = process.env.GOOGLE_SITE_VERIFICATION;
if (process.env.BING_SITE_VERIFICATION) verification.other = { 'msvalidate.01': process.env.BING_SITE_VERIFICATION };

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: translate('fa', 'seoTitle'), template: `%s | ${SITE.fullName} ${SITE.city}` },
  description: translate('fa', 'seoDescription'),
  applicationName: SITE.name,
  keywords: ['اقامتگاه بهارنارنج', 'بهارنارنج رشت', 'اقامتگاه رشت', 'اقامتگاه سنتی رشت', 'رزرو اقامتگاه رشت', 'اقامتگاه میدان شهرداری رشت', 'بهار نارنج'],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: SITE.fullName,
    title: translate('fa', 'seoTitle'),
    description: translate('fa', 'seoDescription'),
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: translate('fa', 'altAbout2') }],
  },
  twitter: { card: 'summary_large_image', title: translate('fa', 'seoTitle'), description: translate('fa', 'seoDescription'), images: ['/og-image.jpg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: true },
  ...(Object.keys(verification).length ? { verification } : {}),
};

export const viewport = { themeColor: '#0f1e19', width: 'device-width', initialScale: 1 };


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
