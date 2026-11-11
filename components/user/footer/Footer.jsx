'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/ui/Reveal';
import { usePreferences } from '@/components/providers/Preferences';
import { SITE } from '@/lib/site';
import styles from './Footer.module.css';

// Bottom of the home page: brand line and the eNamad trust seal (code supplied by the eNamad panel, addresses in lib/site.js).
export default function Footer() {
  const { t } = usePreferences();
  const imgRef = useRef(null);
  const [failed, setFailed] = useState(false);

  // The official seal is served by enamad.ir and can fail to load (application not approved yet, domain mismatch, blocked by an
  // extension). Then our own copy of the seal (public/images/enamad.png) is shown inside the same link to the validation page.
  // onError misses a failure that happened before React attached, so the image is also checked once after mount.
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <Reveal as="footer" className={styles.footer}>
      <strong>{t('brand')}</strong>
      <span>{t('footerTag')}</span>
      <a className={styles.seal} referrerPolicy="origin" target="_blank" rel="noopener" href={SITE.enamad.url}>
        {/* Plain <img> on purpose: the official seal is served and tracked by enamad.ir, so it must load from there, not through next/image. */}
        {/* eslint-disable @next/next/no-img-element */}
        {failed
          ? <img src="/images/enamad.png" width="125" height="136" alt={t('enamadAlt')} />
          : <img ref={imgRef} referrerPolicy="origin" src={SITE.enamad.logo} alt={t('enamadAlt')} onError={() => setFailed(true)} />}
        {/* eslint-enable @next/next/no-img-element */}
      </a>
    </Reveal>
  );
}
