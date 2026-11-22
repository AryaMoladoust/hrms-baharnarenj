import { SITE } from '@/lib/site';

// What search engines and AI crawlers may read. Everything public is open (so the site can be found and cited in answers);
// the owner panel, the API and private booking pages are closed.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/owner', '/api/', '/booking', '/my-reservations'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
