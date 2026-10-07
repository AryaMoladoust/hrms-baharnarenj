'use client';

import Reveal from '@/components/ui/Reveal';
import { usePreferences } from '@/components/providers/Preferences';
import SupportCard from '@/components/user/support/SupportCard';
import { POLICIES } from '@/lib/policies';
import { formatNumber } from '@/lib/dates';
import styles from './AboutSection.module.css';

const icon = (paths) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);
const ICONS = {
  cancel: icon(<><rect x="3.5" y="5" width="14" height="14" rx="3" /><path d="M7.5 3v4M13.5 3v4M3.5 10h14" /><circle cx="17.5" cy="17.5" r="4" fill="var(--surface)" /><path d="M16 16l3 3M19 16l-3 3" /></>),
  clock: icon(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>),
  parking: icon(<><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M10 16V8h3a2.5 2.5 0 010 5h-3" /></>),
  pin: icon(<><path d="M12 21s-6-5.2-6-10a6 6 0 0112 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></>),
};

function Rule({ title, text, iconKey, delay }) {
  return (
    <Reveal className={styles.rule} delay={delay}>
      <span className={styles.ruleIcon}>{ICONS[iconKey]}</span>
      <div>
        {title && <h3>{title}</h3>}
        <p>{text}</p>
      </div>
    </Reveal>
  );
}

// "About us" + terms below the room tiles. Photos live in public/images/about/. Each block fades in when scrolled into view.
export default function AboutSection() {
  const { t, lang } = usePreferences();
  const n = (value) => formatNumber(value, lang);

  return (
    <section className={styles.about}>
      <Reveal as="h2" className={styles.title}>{t('aboutTitle')}</Reveal>

      <div className={styles.mosaic}>
        <Reveal variant="zoom" className={`${styles.photo} ${styles.big}`}><img src="/images/about/room-arch.jpg" alt="" loading="lazy" /></Reveal>
        <Reveal variant="zoom" delay={150} className={`${styles.photo} ${styles.small}`}><img src="/images/about/room-niche.jpg" alt="" loading="lazy" /></Reveal>
        <Reveal variant="zoom" delay={300} className={`${styles.photo} ${styles.small}`}><img src="/images/about/door-glass.jpg" alt="" loading="lazy" /></Reveal>
      </div>

      <Reveal as="p" className={styles.lead} delay={100}>{t('aboutText')}</Reveal>
      <Reveal as="p" className={styles.slogan}>{t('slogan')}</Reveal>

      <Reveal as="h2" className={styles.title}>{t('rulesTitle')}</Reveal>
      <div className={styles.rules}>
        <Rule iconKey="cancel" title={t('cancelTitle')} text={t('cancelGeneral', { n: n(POLICIES.cancellationPercent) })} />
        <Rule iconKey="clock" delay={120} text={t('cancelLate', { hours: n(POLICIES.lateCancellationHours), n: n(POLICIES.lateCancellationPercent) })} />
      </div>

      <div className={styles.parking}>
        <Reveal variant="zoom" className={styles.doorPhoto}><img src="/images/about/door.jpg" alt="" loading="lazy" /></Reveal>
        <div className={styles.parkingRules}>
          <Rule iconKey="parking" title={t('parkingTitle')} text={t('parkingNo')} />
          <Rule iconKey="pin" delay={120} text={t('parkingPublic')} />
        </div>
      </div>

      <Reveal as="p" className={styles.thanks}>{t('thanks')}</Reveal>
      <Reveal className={styles.support}><SupportCard /></Reveal>

      <Reveal as="footer" className={styles.footer}>
        <strong>{t('brand')}</strong>
        <span>{t('footerTag')}</span>
      </Reveal>
    </section>
  );
}
