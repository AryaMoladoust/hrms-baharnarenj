'use client';

import { useEffect, useState } from 'react';
import Sheet from '@/components/owner/ui/Sheet';
import DateButton from '@/components/owner/ui/DateButton';
import { Button, ErrorNote, Field } from '@/components/owner/ui/Kit';
import { useOwner } from '@/components/owner/OwnerShell';
import { errorText } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { ApiError, ownerFetch } from '@/lib/owner/client';
import { formatNumber, toInputDate } from '@/lib/dates';
import { normalizeDigits } from '@/lib/booking/validation';
import { EXPENSE_CATEGORIES } from '@/lib/owner/constants';
import styles from './ExpenseSheet.module.css';

export const CATEGORY_KEYS = {
  groceries: 'ownCatGroceries', cleaning: 'ownCatCleaning', repairs: 'ownCatRepairs', utilities: 'ownCatUtilities',
  salary: 'ownCatSalary', supplies: 'ownCatSupplies', marketing: 'ownCatMarketing', other: 'ownCatOther',
};

// Add or edit one expense ("today I bought ..."). expense = null to add; an expense object to edit or delete.
export default function ExpenseSheet({ open, expense, defaultDate, onClose, onSaved }) {
  const { t, lang } = usePreferences();
  const { toast } = useOwner();
  const today = toInputDate(new Date());
  const [form, setForm] = useState({ date: today, amount: '', category: 'groceries', note: '' });
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(expense ? { date: expense.date, amount: String(expense.amount), category: expense.category, note: expense.note || '' } : { date: defaultDate || today, amount: '', category: 'groceries', note: '' });
    setErrors({}); setProblem(''); setConfirmDelete(false);
  }, [open, expense]); // eslint-disable-line react-hooks/exhaustive-deps

  const digits = normalizeDigits(form.amount).replace(/[^0-9]/g, '');
  const shown = digits ? formatNumber(Number(digits), lang) : '';

  const run = async (fn, doneKey) => {
    setBusy(true); setErrors({}); setProblem('');
    try {
      await fn();
      toast(t(doneKey));
      onSaved();
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.code === 'validation') setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k, t(v)])));
      else setProblem(errorText(e, t));
    }
    setBusy(false);
  };

  const save = () => run(() => ownerFetch(expense ? `expenses/${expense.id}` : 'expenses', { method: expense ? 'PUT' : 'POST', body: { ...form, amount: digits ? Number(digits) : 0 } }), 'ownSaved');
  const remove = () => run(() => ownerFetch(`expenses/${expense.id}`, { method: 'DELETE' }), 'ownDeleted');

  return (
    <Sheet open={open} title={expense ? t('ownEditExpense') : t('ownAddExpense')} onClose={onClose}
      footer={(
        <>
          <Button variant="primary" busy={busy} onClick={save}>{t('ownSave')}</Button>
          {expense && !confirmDelete && <Button variant="ghost" onClick={() => setConfirmDelete(true)}>{t('ownDelete')}</Button>}
          {expense && confirmDelete && <Button variant="danger" busy={busy} onClick={remove}>{t('ownConfirmDelete')}</Button>}
        </>
      )}>
      <DateButton label={t('ownDate')} value={form.date} max={today} onChange={(date) => setForm({ ...form, date })} error={errors.date} />
      <Field label={`${t('ownAmount')} (${t('currency')})`} error={errors.amount} hint={shown}>
        <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputMode="numeric" dir="ltr" autoFocus />
      </Field>
      <div>
        <p className={styles.label}>{t('ownCategory')}</p>
        <div className={styles.cats} role="radiogroup" aria-label={t('ownCategory')}>
          {EXPENSE_CATEGORIES.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={form.category === c} className={form.category === c ? styles.catOn : styles.cat} onClick={() => setForm({ ...form, category: c })}>{t(CATEGORY_KEYS[c])}</button>
          ))}
        </div>
        {errors.category && <ErrorNote>{errors.category}</ErrorNote>}
      </div>
      <Field label={t('ownNote')}><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={200} /></Field>
      {problem && <ErrorNote>{problem}</ErrorNote>}
    </Sheet>
  );
}
