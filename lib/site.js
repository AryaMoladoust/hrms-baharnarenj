import { CONTACT } from '@/lib/contact';

// Facts about the business used for search engines (page titles, structured data, sitemap). Change them here only.
export const SITE = {
  // Set NEXT_PUBLIC_SITE_URL to the final domain (for example https://baharnarenj.ir) as soon as you buy one.
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://hrms-baharnarenj.vercel.app').replace(/\/$/, ''),
  name: 'بهارنارنج',
  fullName: 'اقامتگاه بهارنارنج',
  nameEn: 'Baharnarenj Guesthouse',
  // Guests type the name in several ways; naming them all helps search engines connect them to this one business.
  alternateNames: ['اقامتگاه بهارنارنج', 'اقامتگاه بهار نارنج', 'بهار نارنج رشت', 'بهارنارنج رشت', 'Baharnarenj Guesthouse', 'Baharnarenj Rasht'],
  city: 'رشت',
  region: 'گیلان',
  country: 'IR',
  street: 'میدان شهرداری',
  tel: CONTACT.tel,
  // Fill these in when you have them; they are added to the structured data automatically.
  social: [],     // e.g. ['https://www.instagram.com/your_page']
  geo: null,      // e.g. { lat: 37.28, lng: 49.58 }  (the guesthouse's exact point on the map)
  mapUrl: null,   // the Google Maps share link of the guesthouse
};
