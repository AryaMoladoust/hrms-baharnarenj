'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OwnerShell, { useOwner } from '@/components/owner/OwnerShell';
import { Button, Card, ErrorNote, Field, icon } from '@/components/owner/ui/Kit';
import { errorText } from '@/components/owner/format';
import { usePreferences } from '@/components/providers/Preferences';
import { ApiError, ownerFetch } from '@/lib/owner/client';
import styles from './AccountView.module.css';

function Body() {
  const { t, toggleLang } = usePreferences();
  const { owner, toast } = useOwner();
  const router = useRouter();
  const [form, setForm] = useState({ current: '', next: '', again: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);

  const change = async (event) => {
    event.preventDefault();
    setErrors({}); setProblem('');
    if (form.next !== form.again) { setErrors({ again: t('ownErrPassMismatch') }); return; }
    setBusy(true);
    try {
      await ownerFetch('password', { method: 'POST', body: { current: form.current, next: form.next } });
      toast(t('ownPassChanged'));
      setForm({ current: '', next: '', again: '' });
      router.refresh();
      setTimeout(() => window.location.reload(), 900); // reload so the "default password" reminder disappears
    } catch (e) {
      if (e instanceof ApiError && e.code === 'validation') setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k === 'next' ? 'next' : k, t(v)])));
      else setProblem(errorText(e, t));
    }
    setBusy(false);
  };

  const logout = async () => {
    await ownerFetch('logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/owner/login';
  };

  const type = show ? 'text' : 'password';
  return (
    <>
      <Card tone="night">
        <div className={styles.who}>
          <span className={styles.avatar}>{(owner?.displayName || '·').slice(0, 1).toUpperCase()}</span>
          <div><strong>{owner?.displayName}</strong><small dir="ltr">@{owner?.username}</small></div>
        </div>
      </Card>

      <Card title={t('ownChangePassword')} iconNode={icon(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>, 20)}>
        <form className={styles.form} onSubmit={change} noValidate>
          <Field label={t('ownCurrentPassword')} error={errors.current}><input type={type} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} autoComplete="current-password" dir="ltr" /></Field>
          <Field label={t('ownNewPassword')} error={errors.next} hint={t('ownPasswordRules')}><input type={type} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} autoComplete="new-password" dir="ltr" /></Field>
          <Field label={t('ownRepeatPassword')} error={errors.again}><input type={type} value={form.again} onChange={(e) => setForm({ ...form, again: e.target.value })} autoComplete="new-password" dir="ltr" /></Field>
          <label className={styles.show}><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> {t('ownShow')}</label>
          {problem && <ErrorNote>{problem}</ErrorNote>}
          <Button type="submit" variant="primary" busy={busy}>{t('ownChangePassword')}</Button>
          <p className={styles.note}>{t('ownSignOutOthers')}</p>
        </form>
      </Card>

      <Card>
        <div className={styles.buttons}>
          <Button variant="ghost" onClick={toggleLang}>{t('switchLang')}</Button>
          <Button variant="danger" onClick={logout}>{t('ownLogout')}</Button>
        </div>
      </Card>
    </>
  );
}

export default function AccountView() {
  const { t } = usePreferences();
  return <OwnerShell title={t('ownAccount')}><Body /></OwnerShell>;
}
