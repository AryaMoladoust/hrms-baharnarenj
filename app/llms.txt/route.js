import { SITE } from '@/lib/site';
import { CONTACT } from '@/lib/contact';
import { POLICIES } from '@/lib/policies';
import { rooms } from '@/lib/rooms';
import { faqItems } from '@/lib/seo/faq';

// A plain-text summary of the business for AI assistants (llms.txt). It is not an official standard and no search engine promises to use it;
// it costs nothing and the same facts are on the normal pages too.
export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `# ${SITE.fullName} (${SITE.nameEn})`,
    '',
    `> اقامتگاه سنتی بهارنارنج (بهار نارنج) در ${SITE.city}، ${SITE.street}. چهار اتاق فصلی (بهار، تابستان، پاییز، زمستان) و یک سوئیت با رزرو آنلاین.`,
    '',
    '## اطلاعات',
    `- آدرس: ${SITE.city}، ${SITE.street}`,
    `- تلفن: ${CONTACT.phone}`,
    `- کنسلی: ${POLICIES.cancellationPercent}٪ کسر؛ کمتر از ${POLICIES.lateCancellationHours} ساعت قبل از ورود ${POLICIES.lateCancellationPercent}٪ کسر`,
    '',
    '## صفحه‌ها',
    `- [صفحه‌ی اصلی و رزرو](${SITE.url}/)`,
    `- [اتاق‌ها](${SITE.url}/rooms)`,
    ...rooms.map((room) => `- [اتاق ${room.name}](${SITE.url}/rooms/${room.slug})`),
    `- [پشتیبانی](${SITE.url}/support)`,
    '',
    '## سؤال‌های پرتکرار',
    ...faqItems('fa').flatMap((item) => [`### ${item.q}`, item.a, '']),
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
