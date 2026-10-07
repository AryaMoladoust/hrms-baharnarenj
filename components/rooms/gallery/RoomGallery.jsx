'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './RoomGallery.module.css';

// Swipeable photo slider (CSS scroll-snap). Works in RTL and LTR; shows a season-colored placeholder until a photo file exists.
// Photos go through next/image: resized per device, served as WebP/AVIF. Only the first photo is preloaded; the rest load lazily as the guest swipes.
export default function RoomGallery({ room }) {
  const { t, lang } = usePreferences();
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [missing, setMissing] = useState({});
  const last = room.images.length - 1;

  const onScroll = () => {
    const el = trackRef.current;
    if (el) setIndex(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  const goTo = (i) => {
    const el = trackRef.current;
    const dir = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    const target = Math.max(0, Math.min(last, i));
    el.scrollTo({ left: dir * target * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className={styles.gallery} data-room={room.slug} role="region" aria-label={t('gallery')}>
      <div className={styles.track} ref={trackRef} onScroll={onScroll}>
        {room.images.map((file, i) => (
          <div className={styles.slide} key={file} aria-label={t('photoOf', { i: i + 1, n: room.images.length })}>
            <svg className={styles.placeholder} viewBox="0 0 40 52" aria-hidden="true">
              <path d="M4 50V20C4 9 11 3 20 3s16 6 16 17v30z" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {!missing[file] && (
              <Image
                src={`${room.imageDir}/${file}`}
                alt={`${lang === 'fa' ? room.name : room.nameEn} (${i + 1}/${room.images.length})`}
                fill
                sizes="(min-width: 900px) 700px, 100vw"
                priority={i === 0}
                onError={() => setMissing((prev) => ({ ...prev, [file]: true }))}
              />
            )}
          </div>
        ))}
      </div>

      <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label={t('prevPhoto')} onClick={() => goTo(index - 1)} disabled={index === 0}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label={t('nextPhoto')} onClick={() => goTo(index + 1)} disabled={index === last}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>

      <div className={styles.dots}>
        {room.images.map((file, i) => (
          <button key={file} type="button" className={i === index ? styles.dotActive : styles.dot} aria-label={t('photoOf', { i: i + 1, n: room.images.length })} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}
