import { CONTACT } from '@/lib/contact';
import { POLICIES } from '@/lib/policies';
import { formatNumber } from '@/lib/dates';
import { translate } from '@/lib/i18n';

export const FAQ_COUNT = 8;

// The question/answer pairs shown on the home page and (in Persian) in the structured data. One source, so they never disagree.
export function faqItems(lang) {
  const vars = {
    n: formatNumber(POLICIES.cancellationPercent, lang),
    hours: formatNumber(POLICIES.lateCancellationHours, lang),
    late: formatNumber(POLICIES.lateCancellationPercent, lang),
    phone: CONTACT.phone,
    from: formatNumber(CONTACT.hoursFrom, lang),
    to: formatNumber(CONTACT.hoursTo > 12 ? CONTACT.hoursTo - 12 : CONTACT.hoursTo, lang),
  };
  return Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: translate(lang, `faq${i + 1}q`, vars),
    a: translate(lang, `faq${i + 1}a`, vars),
  }));
}
