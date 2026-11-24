'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bn-pending-payment';

function readPendingPayment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (
      !data ||
      typeof data.code !== 'string' ||
      typeof data.authority !== 'string' ||
      typeof data.paymentUrl !== 'string'
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Only allow the official ZarinPal payment hosts.
    const url = new URL(data.paymentUrl);
    const allowedHosts = ['www.zarinpal.com', 'sandbox.zarinpal.com'];

    if (url.protocol !== 'https:' || !allowedHosts.includes(url.hostname)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export default function PendingPaymentNotice({ lang = 'fa' }) {
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(() => {
    setPending(readPendingPayment());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('payment');

    // The gateway callback has already handled these outcomes.
    if (paymentResult === 'success' || paymentResult === 'cancelled') {
      localStorage.removeItem(STORAGE_KEY);
    }

    refresh();

    const handlePageShow = () => refresh();
    const handleFocus = () => refresh();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  const continuePayment = () => {
    if (!pending) return;

    // Validate again immediately before redirecting.
    try {
      const url = new URL(pending.paymentUrl);
      if (
        url.protocol !== 'https:' ||
        !['www.zarinpal.com', 'sandbox.zarinpal.com'].includes(url.hostname)
      ) {
        setMessage('لینک پرداخت معتبر نیست.');
        return;
      }

      window.location.href = url.toString();
    } catch {
      setMessage('لینک پرداخت معتبر نیست.');
    }
  };

  const cancelPayment = async () => {
    if (!pending || busy) return;

    const confirmed = window.confirm(
      'آیا مطمئن هستید؟ ابتدا وضعیت پرداخت از زرین‌پال بررسی می‌شود و فقط در صورت تأیید پرداخت‌نشدن، رزرو لغو خواهد شد.'
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/reservations/pending/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: pending.code,
          authority: pending.authority,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (data.status === 'paid') {
        localStorage.removeItem(STORAGE_KEY);
        setPending(null);
        setMessage('پرداخت شما تأیید شده و رزرو ثبت شده است.');
        return;
      }

      if (data.status === 'cancelled') {
        localStorage.removeItem(STORAGE_KEY);
        setPending(null);
        setMessage('رزرو لغو شد و اتاق آزاد شد.');
        return;
      }

      if (data.status === 'pending') {
        setMessage('وضعیت پرداخت هنوز مشخص نیست؛ رزرو فعلاً نگه داشته شده است. کمی بعد دوباره تلاش کنید.');
        return;
      }

      setMessage(
        data.error === 'payment_unconfirmed'
          ? 'زرین‌پال هنوز وضعیت پرداخت را تأیید نکرده است؛ رزرو فعلاً لغو نمی‌شود.'
          : 'بررسی پرداخت انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'
      );
    } catch {
      setMessage('ارتباط با سرور برقرار نشد. رزرو فعلاً نگه داشته شده است.');
    } finally {
      setBusy(false);
    }
  };

  const isEnglish = lang === 'en';

  if (!pending && !message) return null;

  const copy = isEnglish
    ? {
        title: 'You have an unfinished payment',
        description: 'Your reservation is being held temporarily. You can continue the payment or ask us to verify it before cancelling.',
        continue: 'Continue payment',
        cancel: 'Verify and cancel',
        checking: 'Checking…',
        close: 'Close',
      }
    : {
        title: 'یک پرداخت نیمه‌تمام دارید',
        description: 'رزرو شما موقتاً نگه داشته شده است. می‌توانید پرداخت را ادامه دهید یا پیش از لغو، وضعیت آن را بررسی کنید.',
        continue: 'ادامه پرداخت',
        cancel: 'بررسی و لغو رزرو',
        checking: 'در حال بررسی…',
        close: 'بستن',
      };

  return (
    <aside
      dir={isEnglish ? 'ltr' : 'rtl'}
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        zIndex: 1000,
        left: 'max(12px, env(safe-area-inset-left))',
        right: 'max(12px, env(safe-area-inset-right))',
        bottom: 'max(86px, calc(env(safe-area-inset-bottom) + 76px))',
        width: 'min(620px, calc(100% - 24px))',
        marginInline: 'auto',
        padding: '16px',
        border: '1px solid rgba(190, 157, 92, .55)',
        borderRadius: '16px',
        background: '#10251f',
        color: '#f7f1e5',
        boxShadow: '0 12px 36px rgba(0,0,0,.24)',
        fontFamily: 'inherit',
      }}
    >
      {pending ? (
        <>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{copy.title}</div>
          <div style={{ fontSize: 13, lineHeight: 1.9, opacity: 0.9 }}>
            {copy.description}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={continuePayment}
              style={{
                border: 0,
                borderRadius: 9,
                padding: '10px 14px',
                background: '#c5a66b',
                color: '#17231e',
                font: 'inherit',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {copy.continue}
            </button>
            <button
              type="button"
              onClick={cancelPayment}
              disabled={busy}
              style={{
                border: '1px solid rgba(247,241,229,.45)',
                borderRadius: 9,
                padding: '10px 14px',
                background: 'transparent',
                color: '#f7f1e5',
                font: 'inherit',
                cursor: busy ? 'wait' : 'pointer',
                opacity: busy ? 0.65 : 1,
              }}
            >
              {busy ? copy.checking : copy.cancel}
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.9 }}>{message}</div>
          <button
            type="button"
            onClick={() => setMessage('')}
            style={{
              border: '1px solid rgba(247,241,229,.4)',
              borderRadius: 8,
              padding: '7px 10px',
              background: 'transparent',
              color: '#f7f1e5',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            {copy.close}
          </button>
        </div>
      )}
    </aside>
  );
}
