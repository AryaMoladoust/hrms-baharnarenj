'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Reveal.module.css';

// Fades its children in (and up, or zoomed) the first time they scroll into view. delay = ms, for staggering.
export default function Reveal({ children, delay = 0, variant = 'up', as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setSeen(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect(); }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`${styles.reveal} ${styles[variant]} ${seen ? styles.seen : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
