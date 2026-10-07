'use client';

import { useEffect, useState } from 'react';
import { usePreferences } from '@/components/providers/Preferences';
import { POLICIES } from '@/lib/policies';
import { formatNumber } from '@/lib/dates';
import styles from './TermsModal.module.css';

/**
 * Shown right before payment. The guest must tick the checkbox to enable the confirm button.
 * Rule texts reuse the same i18n keys and POLICIES numbers as the "Terms and rules" section on the home page,
 * so changing a rule in one place updates it everywhere.
 */
export default function TermsModal({ open, onClose, onAccept }) {
  const { t, lang } = usePreferences();
  const [accepted, setAccepted] = useState(false);
  const n = (value) => formatNumber(value, lang);

  // Start unchecked every time the popup opens.
  useEffect(() => {
    if (open) setAccepted(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const rules = [
    { title: t('cancelTitle'), text: t('cancelGeneral', { n: n(POLICIES.cancellationPercent) }) },
    { text: t('cancelLate', { hours: n(POLICIES.lateCancellationHours), n: n(POLICIES.lateCancellationPercent) }) },
    { title: t('parkingTitle'), text: t('parkingNo') },
    { text: t('parkingPublic') },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="terms-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="terms-title">{t('termsTitle')}</h2>
        <p className={styles.intro}>{t('termsIntro')}</p>

        <ul className={styles.rules}>
          {rules.map((rule, i) => (
            <li key={i}>
              {rule.title && <strong>{rule.title}</strong>}
              <span>{rule.text}</span>
            </li>
          ))}
        </ul>

        <label className={styles.accept}>
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} autoFocus />
          <span>{t('termsAccept')}</span>
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.confirm} disabled={!accepted} onClick={onAccept}>{t('termsConfirm')}</button>
          <button type="button" className={styles.back} onClick={onClose}>{t('termsBack')}</button>
        </div>
      </div>
    </div>
  );
}
