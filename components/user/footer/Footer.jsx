'use client';

import Reveal from '@/components/ui/Reveal';
import { usePreferences } from '@/components/providers/Preferences';
import { SITE } from '@/lib/site';
import styles from './Footer.module.css';

// Bottom of the home page: brand line and the eNamad trust seal (code supplied by the eNamad panel, addresses in lib/site.js).
export default function Footer() {
  const { t } = usePreferences();

  return (
    <Reveal as="footer" className={styles.footer}>
      <strong>{t('brand')}</strong>
      <span>{t('footerTag')}</span>
      <a className={styles.seal} referrerPolicy="origin" target="_blank" rel="noopener" href={SITE.enamad.url}>
        {/* A plain <img> on purpose: the seal is served and tracked by enamad.ir, so it must load from there, not through next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img referrerPolicy="origin" src={SITE.enamad.logo} alt={t('enamadAlt')} loading="lazy" />
      </a>
    </Reveal>
  );
}
