'use client';

import { useEffect, useState } from 'react';
import OwnerShell, { useOwner } from '@/components/owner/OwnerShell';
import { Button, Card, Chip, ErrorNote, Field, icon, Loading, RoomDot, Segmented } from '@/components/owner/ui/Kit';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { day, errorText, money, roomName } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { ownerFetch } from '@/lib/owner/client';
import { formatNumber } from '@/lib/dates';
import { discounted } from '@/lib/pricing';
import { normalizeDigits } from '@/lib/booking/validation';
import styles from './PricingView.module.css';

const QUICK = [5, 10, 15, 20, 25, 30];

function Body() {
  const { t, lang } = usePreferences();
  const { toast } = useOwner();
  const { data, error, loading, reload } = useOwnerData('settings');
  const [mode, setMode] = useState('discount'); // discount | increase
  const [value, setValue] = useState('0');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    if (!data) return;
    setMode(data.discountPercent < 0 ? 'increase' : 'discount');
    setValue(String(Math.abs(data.discountPercent)));
  }, [data?.discountPercent]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorNote onRetry={reload} retryLabel={t('ownRetry')}>{t('ownErrServer')}</ErrorNote>;

  const number = Math.min(mode === 'discount' ? 90 : 100, Math.max(0, Number(normalizeDigits(value).replace(/[^0-9.]/g, '')) || 0));
  const percent = mode === 'discount' ? number : -number;
  const active = data.discountPercent;
  const changed = percent !== active;

  const save = async (next) => {
    setBusy(true); setProblem('');
    try {
      await ownerFetch('settings', { method: 'PUT', body: { percent: next } });
      toast(t('ownPricingSaved'));
      await reload();
    } catch (e) { setProblem(errorText(e, t)); }
    setBusy(false);
  };

  return (
    <>
      <Card tone="night" title={t('ownPricingNow')} iconNode={icon(<><path d="M20 12l-8 8-9-9V3h8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>, 20)}>
        <p className={styles.state}>
          {active === 0 ? t('ownPricingNormal') : active > 0 ? t('ownPricingDiscountOn', { n: formatNumber(active, lang) }) : t('ownPricingIncreaseOn', { n: formatNumber(-active, lang) })}
        </p>
        <p className={styles.note}>{t('ownPricingScope')}</p>
      </Card>

      <Card title={t('ownPricingChange')}>
        <Segmented value={mode} onChange={setMode} ariaLabel={t('ownPricingChange')} options={[{ value: 'discount', label: t('ownDiscount') }, { value: 'increase', label: t('ownIncrease') }]} />
        <div className={styles.quick}>
          {QUICK.map((q) => <button key={q} type="button" className={number === q ? styles.quickOn : styles.quickBtn} onClick={() => setValue(String(q))}>{formatNumber(q, lang)}٪</button>)}
        </div>
        <Field label={t('ownPercent')} hint={mode === 'discount' ? t('ownDiscountHint') : t('ownIncreaseHint')}>
          <input value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" dir="ltr" />
        </Field>
        {problem && <ErrorNote>{problem}</ErrorNote>}
        <div className={styles.buttons}>
          <Button variant="primary" busy={busy} disabled={!changed} onClick={() => save(percent)}>{t('ownApply')}</Button>
          {active !== 0 && <Button variant="ghost" busy={busy} onClick={() => save(0)}>{t('ownResetPrices')}</Button>}
        </div>
      </Card>

      <Card title={t('ownPricePreview')} action={<Chip tone="info">{t('ownPerNightStay')}</Chip>}>
        <ul className={styles.prices}>
          {data.prices.map((p) => {
            const preview = discounted(p.base, percent);
            return (
              <li key={p.slug}>
                <span><RoomDot slug={p.slug} /> <strong>{roomName(p.slug, lang)}</strong></span>
                <span className={styles.nums}>
                  {preview !== p.base && <s>{formatNumber(p.base, lang)}</s>}
                  <b data-up={preview > p.base}>{money(preview, lang, t)}</b>
                </span>
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>{t('ownAddonsUnchanged', { b: formatNumber(data.prices[0].breakfast, lang), h: formatNumber(data.prices[0].hygiene, lang) })}</p>
      </Card>

      {data.history.length > 0 && (
        <Card title={t('ownPricingHistory')}>
          <ul className={styles.history}>
            {data.history.map((h, i) => (
              <li key={i}>
                <span>{h.percent === 0 ? t('ownPricingNormal') : h.percent > 0 ? t('ownPricingDiscountOn', { n: formatNumber(h.percent, lang) }) : t('ownPricingIncreaseOn', { n: formatNumber(-h.percent, lang) })}</span>
                <small>{h.by} · {day(h.at.slice(0, 10), lang)}</small>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

export default function PricingView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownPricing')}><Body /></OwnerShell>;
}
