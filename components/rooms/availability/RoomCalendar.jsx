'use client';

import { useEffect, useMemo, useState } from 'react';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { usePreferences } from '@/components/providers/Preferences';
import { getRoomCalendar } from '@/lib/rooms/availability';
import { monthCells, monthTitle, partsOf, shiftMonth, systemFor, WEEKDAYS } from '@/lib/calendar';
import { addDays, formatDay, formatNumber } from '@/lib/dates';
import styles from './RoomCalendar.module.css';

const DAYS_AHEAD = 124; // about four months, the same window the API sends

const Chevron = ({ flip }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={flip ? styles.flip : undefined}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

// Same size as the real month grid (title row, week row, five weeks), so the card does not change height when the days arrive.
function CalendarSkeleton({ label }) {
  return (
    <SkeletonGroup label={label} className={styles.skeleton}>
      <div className={styles.skeletonNav}><Skeleton w={44} h={44} r={14} /><Skeleton w={150} h={24} r={12} /><Skeleton w={44} h={44} r={14} /></div>
      <div className={styles.grid}>
        {Array.from({ length: 7 }, (_, i) => <Skeleton key={`w${i}`} h={12} r={6} />)}
        {Array.from({ length: 35 }, (_, i) => <Skeleton key={i} h={46} r={12} />)}
      </div>
    </SkeletonGroup>
  );
}

/**
 * Availability calendar of ONE room, on its page. Free days are tinted, taken nights are hatched.
 * Tap a free day = check-in (a one-night stay is selected right away, so "Book" already works), then tap a later day = check-out.
 * The check-out can be the day a taken night starts (the guest leaves that morning), but not any day after it.
 * Also explains, above the grid, why the chosen dates do not work and offers the free stretches as one-tap suggestions.
 * Hidden when the server cannot tell which nights are taken, rather than showing every night as free.
 */
export default function RoomCalendar({ slug, range, info, shellClass, iconClass, icon }) {
  const { t, lang } = usePreferences();
  const system = systemFor(lang);
  const today = range.minCheckIn;
  const maxIso = addDays(today, DAYS_AHEAD - 1);
  const [busy, setBusy] = useState(null); // Set of taken nights, null while loading
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState(null);
  const [pending, setPending] = useState(null); // check-in picked, waiting for the check-out tap

  useEffect(() => {
    let cancelled = false;
    getRoomCalendar({ slug, from: today, days: DAYS_AHEAD }).then((result) => {
      if (cancelled) return;
      if (result.ok) setBusy(new Set(result.busy)); else setFailed(true);
    });
    return () => { cancelled = true; };
  }, [slug, today]);

  useEffect(() => {
    if (range.ready && !view) { const p = partsOf(range.checkIn, system); setView({ y: p.y, m: p.m }); }
  }, [range.ready, range.checkIn, system, view]);

  // If the dates are changed somewhere else (the date fields, a suggestion button), a half-finished pick no longer applies.
  useEffect(() => { if (pending && range.checkIn !== pending) setPending(null); }, [pending, range.checkIn]);

  // After the check-in, the first taken night is the last day that can still be the check-out.
  const blockedAt = useMemo(() => {
    if (!pending || !busy) return null;
    for (let d = pending, i = 0; i <= DAYS_AHEAD; d = addDays(d, 1), i += 1) if (busy.has(d)) return d;
    return null;
  }, [pending, busy]);

  const cells = useMemo(() => (view ? monthCells(system, view) : []), [system, view]);
  if (failed) return null;
  if (!range.ready || !view) {
    return (
      <section className={shellClass}>
        <h2><span className={iconClass}>{icon}</span>{t('roomCalendarTitle')}</h2>
        <CalendarSkeleton label={t('loadingLabel')} />
      </section>
    );
  }

  const todayParts = partsOf(today, system);
  const lastParts = partsOf(maxIso, system);
  const monthIndex = (p) => p.y * 12 + p.m;
  const atFirstMonth = monthIndex(view) <= monthIndex(todayParts);
  const atLastMonth = monthIndex(view) >= monthIndex(lastParts);

  const choose = (iso) => {
    if (!pending || iso < pending) { range.setRange(iso, addDays(iso, 1)); setPending(iso); return; }
    if (iso === pending) { setPending(null); return; }
    range.setRange(pending, iso);
    setPending(null);
  };

  const useRun = (run) => {
    range.setRange(run.from, run.to);
    setPending(null);
    const p = partsOf(run.from, system);
    setView({ y: p.y, m: p.m });
  };

  const partial = info?.status === 'partial';
  const booked = info?.status === 'booked';
  const suggestions = partial ? info.freeRuns || [] : booked && info.nextFree ? [info.nextFree] : [];
  const n = (value) => formatNumber(value, lang);

  return (
    <section className={shellClass}>
      <h2><span className={iconClass}>{icon}</span>{t('roomCalendarTitle')}</h2>

      {(partial || booked) && (
        <div className={styles.notice} role="status">
          <strong>{partial ? t('roomPartial') : t('roomBooked')}</strong>
          {suggestions.length > 0 && (
            <div className={styles.runs}>
              {suggestions.map((run) => (
                <button type="button" key={run.from} onClick={() => useRun(run)}>
                  {partial
                    ? t('freeRunLink', { from: formatDay(run.from, lang), to: formatDay(run.to, lang) })
                    : t('nextFreeNight', { date: formatDay(run.from, lang) })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!busy ? (
        <CalendarSkeleton label={t('loadingLabel')} />
      ) : (
        <>
          <p className={styles.hint} aria-live="polite">{pending ? t('calPickOut') : t('calPickIn')}</p>

          <div className={styles.nav}>
            <button type="button" aria-label={t('prevMonth')} disabled={atFirstMonth} onClick={() => setView(shiftMonth(view, -1))}><Chevron /></button>
            <h3>{monthTitle(system, view, lang)}</h3>
            <button type="button" aria-label={t('nextMonth')} disabled={atLastMonth} onClick={() => setView(shiftMonth(view, 1))}><Chevron flip /></button>
          </div>

          <div className={styles.week} aria-hidden="true">
            {WEEKDAYS[lang].map((label, i) => <span key={i}>{label}</span>)}
          </div>

          <div className={styles.grid}>
            {cells.map((cell, i) => {
              if (!cell) return <span key={`blank-${i}`} />;
              const iso = cell.iso;
              const taken = busy.has(iso);
              const past = iso < today;
              const beyond = iso > maxIso;
              let enabled;
              if (past || beyond) enabled = false;
              else if (!pending) enabled = !taken;
              else if (iso <= pending) enabled = !taken || iso === pending;
              else enabled = !blockedAt || iso <= blockedAt;

              const isIn = iso === range.checkIn;
              const isOut = !pending && iso === range.checkOut;
              const inside = iso > range.checkIn && iso < range.checkOut;
              const className = [
                styles.day,
                taken && styles.taken,
                taken && enabled && styles.leaveOk,
                !taken && !past && !beyond && enabled && styles.free,
                !enabled && !taken && styles.dim,
                inside && styles.inside,
                (isIn || isOut) && styles.edge,
                iso === today && styles.today,
              ].filter(Boolean).join(' ');
              return (
                <button key={iso} type="button" className={className} disabled={!enabled} aria-pressed={isIn || isOut}
                  aria-label={`${formatDay(iso, lang, true, 'persian')} · ${taken ? t('calDayBusy') : t('calDayFree')}`} onClick={() => choose(iso)}>
                  {n(cell.day)}
                </button>
              );
            })}
          </div>

          <ul className={styles.legend} aria-hidden="true">
            <li><i className={styles.keyFree} />{t('calLegendFree')}</li>
            <li><i className={styles.keyTaken} />{t('calLegendBusy')}</li>
            <li><i className={styles.keyYours} />{t('calLegendYours')}</li>
          </ul>
        </>
      )}
    </section>
  );
}
