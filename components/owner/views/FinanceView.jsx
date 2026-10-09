'use client';

import { useEffect, useMemo, useState } from 'react';
import OwnerShell from '@/components/owner/OwnerShell';
import ExpenseSheet, { CATEGORY_KEYS } from '@/components/owner/ExpenseSheet';
import DateButton from '@/components/owner/ui/DateButton';
import { Button, Card, Chip, Empty, ErrorNote, icon, Loading, RoomDot, Segmented } from '@/components/owner/ui/Kit';
import { useOwnerData } from '@/components/owner/useOwnerData';
import { day, download, money, range as dateRange, roomName, toCsv } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { monthTitle, partsOf } from '@/lib/calendar';
import { addDays, formatNumber, toInputDate } from '@/lib/dates';
import { jalaliMonthBounds, jalaliWeekBounds, recentJalaliMonths } from '@/lib/owner/dates';
import styles from './FinanceView.module.css';

const PRESETS = ['today', 'week', 'month', 'lastMonth', 'custom'];
const PRESET_KEYS = { today: 'ownToday', week: 'ownThisWeek', month: 'ownThisMonth', lastMonth: 'ownLastMonth', custom: 'ownCustomRange' };

function rangeFor(preset, today) {
  if (preset === 'today') return { from: today, to: today, group: 'day' };
  if (preset === 'week') { const w = jalaliWeekBounds(today); return { ...w, group: 'day' }; }
  if (preset === 'month') { const m = jalaliMonthBounds(today); return { from: m.from, to: m.to, group: 'day' }; }
  if (preset === 'lastMonth') { const m = recentJalaliMonths(2, today)[1]; return { from: m.from, to: m.to, group: 'day' }; }
  return null;
}

function Body() {
  const { t, lang } = usePreferences();
  const today = toInputDate(new Date());
  const [tab, setTab] = useState('report');
  const [preset, setPreset] = useState('month');
  const [from, setFrom] = useState(() => rangeFor('month', today).from);
  const [to, setTo] = useState(() => rangeFor('month', today).to);
  const [group, setGroup] = useState('day');
  const [sheet, setSheet] = useState({ open: false, expense: null });

  useEffect(() => { if (new URLSearchParams(window.location.search).get('add')) { setTab('expenses'); setSheet({ open: true, expense: null }); } }, []);

  const choose = (p) => {
    setPreset(p);
    const r = rangeFor(p, today);
    if (r) { setFrom(r.from); setTo(r.to); setGroup(p === 'today' ? 'day' : group); }
  };
  const setDates = (nextFrom, nextTo) => { setPreset('custom'); setFrom(nextFrom); setTo(nextTo < nextFrom ? nextFrom : nextTo); };

  const report = useOwnerData(`reports?from=${from}&to=${to}&group=${group}`);
  const expenses = useOwnerData(tab === 'expenses' ? `expenses?from=${from}&to=${to}` : null);
  const monthly = useOwnerData('reports/monthly?months=12');
  const data = report.data;

  const peak = useMemo(() => Math.max(1, ...(data?.series || []).map((s) => Math.max(s.income, s.expense))), [data]);
  const label = (s) => {
    if (data.group === 'month') { const p = partsOf(s.from, 'jalali'); return monthTitle('jalali', p, lang); }
    if (data.group === 'week') return dateRange(s.from, s.to, lang);
    return day(s.from, lang, true);
  };

  const exportCsv = () => {
    const rows = [[t('ownPeriod'), t('ownIncome'), t('ownExpense'), t('ownNet')], ...data.series.map((s) => [`${s.from}${s.to !== s.from ? `..${s.to}` : ''}`, s.income, s.expense, s.net]), [t('total'), data.totals.income, data.totals.expense, data.totals.net]];
    download(`baharnarenj-${from}_${to}.csv`, toCsv(rows));
  };

  return (
    <>
      <Card>
        <Segmented value={preset} onChange={choose} ariaLabel={t('ownPeriod')} options={PRESETS.map((p) => ({ value: p, label: t(PRESET_KEYS[p]) }))} />
        <div className={styles.dates}>
          <DateButton label={t('ownFrom')} value={from} max={addDays(today, 0)} onChange={(v) => setDates(v, to)} />
          <DateButton label={t('ownTo')} value={to} onChange={(v) => setDates(from, v)} />
        </div>
        <Segmented value={tab} onChange={setTab} ariaLabel={t('ownNavFinance')} options={[{ value: 'report', label: t('ownReport') }, { value: 'expenses', label: t('ownExpenses') }]} />
      </Card>

      {report.loading && !data && <Loading />}
      {report.error && !data && <ErrorNote onRetry={report.reload} retryLabel={t('ownRetry')}>{report.error.code === 'bad_range' ? t('ownErrRange') : t('ownErrServer')}</ErrorNote>}

      {data && tab === 'report' && (
        <>
          <Card tone="night">
            <dl className={styles.totals}>
              <div><dt>{t('ownIncome')}</dt><dd>{money(data.totals.income, lang, t)}</dd></div>
              <div><dt>{t('ownExpense')}</dt><dd>{money(data.totals.expense, lang, t)}</dd></div>
              <div className={styles.net}><dt>{t('ownNet')}</dt><dd data-negative={data.totals.net < 0}>{money(data.totals.net, lang, t)}</dd></div>
            </dl>
            <p className={styles.sub}>{t('ownBookingsCount', { n: formatNumber(data.totals.bookings, lang) })}</p>
          </Card>

          <Card title={t('ownBreakdown')} iconNode={icon(<path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />, 20)}
            action={<Segmented value={group} onChange={setGroup} ariaLabel={t('ownGroupBy')} options={[{ value: 'day', label: t('ownByDay') }, { value: 'week', label: t('ownByWeek') }, { value: 'month', label: t('ownByMonth') }]} />}>
            <ul className={styles.series}>
              {data.series.map((s) => (
                <li key={s.key}>
                  <div className={styles.seriesHead}><span>{label(s)}</span><b data-negative={s.net < 0}>{money(s.net, lang, t)}</b></div>
                  <div className={styles.bars} aria-hidden="true">
                    <i className={styles.in} style={{ width: `${(Math.max(s.income, 0) / peak) * 100}%` }} />
                    <i className={styles.out} style={{ width: `${(s.expense / peak) * 100}%` }} />
                  </div>
                  {(s.income !== 0 || s.expense !== 0) && <small>{t('ownIncome')} {formatNumber(s.income, lang)} · {t('ownExpense')} {formatNumber(s.expense, lang)}</small>}
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={exportCsv}>{icon(<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />, 18)} {t('ownExportCsv')}</Button>
          </Card>

          <Card title={t('ownExpensesByCategory')}>
            {data.expensesByCategory.length === 0 ? <Empty>{t('ownNoExpenses')}</Empty> : (
              <ul className={styles.cats}>
                {data.expensesByCategory.map((c) => (
                  <li key={c.category}>
                    <div><span>{t(CATEGORY_KEYS[c.category])}</span><b>{money(c.amount, lang, t)}</b></div>
                    <i style={{ width: `${Math.max(3, c.share * 100)}%` }} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {data.incomeByRoom.length > 0 && (
            <Card title={t('ownIncomeByRoom')}>
              <ul className={styles.cats}>
                {data.incomeByRoom.map((r) => (
                  <li key={r.slug}>
                    <div><span><RoomDot slug={r.slug} /> {roomName(r.slug, lang)}</span><b>{money(r.amount, lang, t)}</b></div>
                    <i className={styles.green} style={{ width: `${Math.max(3, (r.amount / Math.max(1, data.incomeByRoom[0].amount)) * 100)}%` }} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title={t('ownMonthlyReports')}>
            {monthly.data ? (
              <ul className={styles.months}>
                {monthly.data.months.map((m) => (
                  <li key={`${m.y}-${m.m}`}>
                    <button type="button" onClick={() => { setPreset('custom'); setFrom(m.from); setTo(m.to); setGroup('day'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <span>{monthTitle('jalali', { y: m.y, m: m.m }, lang)}</span>
                      <span className={styles.monthNums}><small>{formatNumber(m.income, lang)} − {formatNumber(m.expense, lang)}</small><b data-negative={m.net < 0}>{money(m.net, lang, t)}</b></span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <Loading />}
          </Card>
        </>
      )}

      {tab === 'expenses' && (
        <>
          {expenses.loading && !expenses.data && <Loading />}
          {expenses.data && (
            <Card title={t('ownExpenses')} action={<Chip tone="bad">{money(expenses.data.total, lang, t)}</Chip>}>
              {expenses.data.expenses.length === 0 ? <Empty>{t('ownNoExpenses')}</Empty> : (
                <ul className={styles.expenseList}>
                  {expenses.data.expenses.map((e) => (
                    <li key={e.id}>
                      <button type="button" onClick={() => setSheet({ open: true, expense: e })}>
                        <span><strong>{t(CATEGORY_KEYS[e.category])}</strong><small>{day(e.date, lang)}{e.note ? ` · ${e.note}` : ''}{e.createdBy ? ` · ${e.createdBy}` : ''}</small></span>
                        <b>{money(e.amount, lang, t)}</b>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
          <button type="button" className={styles.fab} onClick={() => setSheet({ open: true, expense: null })} aria-label={t('ownAddExpense')}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </>
      )}

      <ExpenseSheet open={sheet.open} expense={sheet.expense} onClose={() => setSheet({ open: false, expense: null })} onSaved={() => { report.reload(); expenses.reload(); monthly.reload(); }} />
    </>
  );
}

export default function FinanceView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownNavFinance')}><Body /></OwnerShell>;
}
