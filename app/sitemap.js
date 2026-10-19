import { SITE } from '@/lib/site';
import { rooms } from '@/lib/rooms';

// The pages we want in Google. (No lastModified on purpose: a wrong date is worse than none.)
export default function sitemap() {
  return [
    { url: `${SITE.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/rooms`, changeFrequency: 'weekly', priority: 0.9 },
    ...rooms.map((room) => ({ url: `${SITE.url}/rooms/${room.slug}`, changeFrequency: 'weekly', priority: 0.8 })),
    { url: `${SITE.url}/support`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
