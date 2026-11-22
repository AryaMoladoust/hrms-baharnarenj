'use client';

import Reveal from '@/components/ui/Reveal';
import { usePreferences } from '@/components/providers/Preferences';
import { faqItems } from '@/lib/seo/faq';
import styles from './FaqSection.module.css';

// Frequently asked questions, written as plain visible text (good for readers, search engines and AI answer engines). Native <details>: works without JavaScript.
export default function FaqSection() {
  const { t, lang } = usePreferences();
  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <Reveal as="h2" id="faq-title" className={styles.title}>{t('faqTitle')}</Reveal>
      <div className={styles.list}>
        {faqItems(lang).map((item, i) => (
          <Reveal key={item.q} delay={Math.min(i, 4) * 60}>
            <details className={styles.item}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
