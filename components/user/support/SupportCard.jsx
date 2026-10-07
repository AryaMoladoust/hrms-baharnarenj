'use client';

import { usePreferences } from '@/components/providers/Preferences';
import { CONTACT } from '@/lib/contact';
import { formatNumber } from '@/lib/dates';
import styles from './SupportCard.module.css';

const icon = (paths) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);
const ICONS = {
  headset: icon(<><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /><path d="M19 20a4 4 0 01-4 2h-2" /></>),
  pin: icon(<><path d="M12 21s-6-5.2-6-10a6 6 0 0112 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></>),
  phone: icon(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />),
  clock: icon(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>),
};

// Support block. variant "light" sits on the page (bottom of the home page), "night" sits inside the dark side menu.
export default function SupportCard({ variant = 'light' }) {
  const { t, lang } = usePreferences();
  const digits = (value) => (lang === 'fa' ? value.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]) : value);
  const { phone } = CONTACT;
  const shownPhone = digits(`${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`);

  return (
    <section className={`${styles.card} ${styles[variant]}`} aria-label={t('supportTitle')}>
      <h3 className={styles.title}>
        <span className={styles.titleIcon}>{ICONS.headset}</span>
        <span>{t('supportTitle')}<small>{t('supportPlace')}</small></span>
      </h3>

      <ul className={styles.list}>
        <li><span className={styles.icon}>{ICONS.pin}</span><span>{t('supportAddress')}</span></li>
        <li>
          <span className={styles.icon}>{ICONS.phone}</span>
          <span className={styles.phoneLine}>
            <span>{t('supportContact')}</span>
            <a href={`tel:${CONTACT.tel}`} dir="ltr">{shownPhone}</a>
          </span>
        </li>
        <li><span className={styles.icon}>{ICONS.clock}</span><span>{t('supportHours', { from: formatNumber(CONTACT.hoursFrom, lang), to: formatNumber(CONTACT.hoursTo, lang) })}</span></li>
      </ul>

      <a className={styles.call} href={`tel:${CONTACT.tel}`}>
        {ICONS.phone}
        <span>{t('supportCall')}</span>
      </a>
    </section>
  );
}
