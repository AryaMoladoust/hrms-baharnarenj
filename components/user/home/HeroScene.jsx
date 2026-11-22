'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/user/header/Header';
import { usePreferences } from '@/components/providers/Preferences';
import styles from './HeroScene.module.css';

// Falling bitter-orange (baharnarenj) petals. x = start across the stage (%), s = size (px), t = fall time (s),
// w = start delay (s), d = sideways drift (px). Fixed numbers, not Math.random(), so server and browser render the same HTML.
const PETALS = [
  { x: 6, s: 9, t: 11, w: 0, d: 40 },
  { x: 22, s: 12, t: 14, w: 3, d: -34 },
  { x: 38, s: 8, t: 10, w: 6, d: 28 },
  { x: 54, s: 11, t: 13, w: 1.5, d: -46 },
  { x: 70, s: 9, t: 12, w: 8, d: 36 },
  { x: 84, s: 13, t: 15, w: 4.5, d: -30 },
  { x: 14, s: 10, t: 12.5, w: 9.5, d: -26 },
  { x: 62, s: 8, t: 9.5, w: 11, d: 44 },
  { x: 92, s: 10, t: 13.5, w: 7, d: -38 },
];

/**
 * Home page hero: the guesthouse courtyard at night inside an arch. Motion, all CSS except the tilt:
 * - the arch floats gently and turns a few degrees towards the mouse (3D tilt, only with a mouse and without reduced motion);
 * - it has depth: a lantern glow behind, an offset roof-coloured outline, the photo, and petals in front that shift with the tilt;
 * - petals of the bitter orange (baharnarenj) fall beside it, a light glint crosses the glass now and then;
 * - the headline rises in line by line.
 */
export default function HeroScene() {
  const { t } = usePreferences();
  const host = useRef(null);
  const tilt = useRef(null);

  useEffect(() => {
    const section = host.current;
    const target = tilt.current;
    if (!section || !target) return undefined;
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mouse.matches || calm.matches) return undefined;

    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      target.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(apply); };
    const onMove = (event) => {
      const box = section.getBoundingClientRect();
      x = (event.clientX - box.left) / box.width - 0.5;
      y = (event.clientY - box.top) / box.height - 0.5;
      queue();
    };
    const onLeave = () => { x = 0; y = 0; queue(); };

    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={styles.hero} ref={host}>
      <Header />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1><small>{t('heroEyebrow')}</small>{t('heroTitle')}</h1>
          <p>{t('heroText')}</p>
          <p className={styles.long}>{t('heroTextLong')}</p>
        </div>

        <div className={styles.stage}>
          <div className={styles.float}>
            <div className={styles.tilt} ref={tilt}>
              <span className={styles.halo} aria-hidden="true" />
              <span className={styles.frameBack} aria-hidden="true" />

              <div className={styles.window}>
                <Image src="/images/home/hero.png" alt={t('altHero')} fill priority sizes="(min-width: 900px) 360px, 168px" />
                <span className={styles.glint} aria-hidden="true" />
                <span className={styles.ring} aria-hidden="true" />
              </div>

              <div className={styles.petals} aria-hidden="true">
                {PETALS.map((p, i) => (
                  <span key={i} className={styles.petal} style={{ '--x': `${p.x}%`, '--s': `${p.s}px`, '--t': `${p.t}s`, '--w': `${p.w}s`, '--d': `${p.d}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.eave} aria-hidden="true" />
    </section>
  );
}
