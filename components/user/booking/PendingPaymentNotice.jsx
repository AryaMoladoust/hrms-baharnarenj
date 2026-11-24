'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'bn-pending-payment';
const DISMISSED_KEY = 'bn-pending-dismissed';
// The room is held for 20 minutes; the reminder stays a little longer, then removes itself so it can never stay on the screen forever.
const SHOW_MINUTES = 30;

function readPendingPayment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (
      !data ||
      typeof data.code !== 'string' ||
      typeof data.authority !== 'string' ||
      typeof data.paymentUrl !== 'string' ||
      typeof data.createdAt !== 'number'
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Too old to be worth showing: the hold is over and the bank session is gone.
    if (Date.now() - data.createdAt > SHOW_MINUTES * 60000) {
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

    // The guest closed the reminder in this browser session: do not show it again until the next visit.
    if (sessionStorage.getItem(DISMISSED_KEY) === data.code) return null;

    return data;
  } catch {
    return null;
  }
}

const COPY = {
  fa: {
    title: 'یک پرداخت نیمه‌تمام دارید',
    description: 'رزرو شما موقتاً نگه داشته شده است. می‌توانید پرداخت را ادامه دهید یا پیش از لغو، وضعیت آن را بررسی کنید.',
    continue: 'ادامه پرداخت',
    cancel: 'بررسی و لغو رزرو',
    checking: 'در حال بررسی…',
    close: 'بستن',
    confirmText: 'مطمئن هستید؟ ابتدا وضعیت پرداخت از زرین‌پال بررسی می‌شود و فقط اگر پرداخت انجام نشده باشد، رزرو لغو و اتاق آزاد می‌شود.',
    confirmYes: 'بله، بررسی و لغو',
    confirmNo: 'نه، برگرد',
    badLink: 'لینک پرداخت معتبر نیست.',
    paid: 'پرداخت شما تأیید شده و رزرو ثبت شده است.',
    cancelled: 'رزرو لغو شد و اتاق آزاد شد.',
    stillPending: 'وضعیت پرداخت هنوز مشخص نیست؛ رزرو فعلاً نگه داشته شده است. کمی بعد دوباره تلاش کنید.',
    unconfirmed: 'زرین‌پال هنوز وضعیت پرداخت را تأیید نکرده است؛ رزرو فعلاً لغو نمی‌شود.',
    tooMany: 'تعداد تلاش‌ها زیاد بود. کمی بعد دوباره امتحان کنید.',
    failed: 'بررسی پرداخت انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.',
    offline: 'ارتباط با سرور برقرار نشد. رزرو فعلاً نگه داشته شده است.',
    providerCode: 'کد زرین‌پال',
  },
  en: {
    title: 'You have an unfinished payment',
    description: 'Your reservation is being held temporarily. You can continue the payment or ask us to verify it before cancelling.',
    continue: 'Continue payment',
    cancel: 'Verify and cancel',
    checking: 'Checking…',
    close: 'Close',
    confirmText: 'Are you sure? We first ask ZarinPal about the payment. The booking is cancelled and the room released only if nothing was paid.',
    confirmYes: 'Yes, verify and cancel',
    confirmNo: 'No, go back',
    badLink: 'The payment link is not valid.',
    paid: 'Your payment is confirmed and the booking is made.',
    cancelled: 'The booking was cancelled and the room is free again.',
    stillPending: 'The payment status is not clear yet; the room is still held for you. Please try again in a moment.',
    unconfirmed: 'ZarinPal has not confirmed the payment status yet; the booking is not cancelled for now.',
    tooMany: 'Too many attempts. Please try again later.',
    failed: 'The payment could not be checked. Check your internet connection and try again.',
    offline: 'Could not reach the server. The room is still held for you.',
    providerCode: 'ZarinPal code',
  },
};

const buttonBase = {
  borderRadius: 9,
  padding: '10px 14px',
  font: 'inherit',
  cursor: 'pointer',
};

export default function PendingPaymentNotice({ lang = 'fa' }) {
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const copy = COPY[lang === 'en' ? 'en' : 'fa'];

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
    // Re-check every half minute so an old reminder removes itself.
    const timer = setInterval(refresh, 30000);

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
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
        setMessage(copy.badLink);
        return;
      }

      window.location.href = url.toString();
    } catch {
      setMessage(copy.badLink);
    }
  };

  // "Close" only hides the reminder in this browser session. It never cancels or changes the booking.
  const dismiss = () => {
    try {
      if (pending) sessionStorage.setItem(DISMISSED_KEY, pending.code);
    } catch { /* storage blocked: the reminder just comes back on the next check */ }
    setConfirming(false);
    setMessage('');
    setPending(null);
  };

  const cancelPayment = async () => {
    if (!pending || busy) return;

    setConfirming(false);
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
        setMessage(copy.paid);
        return;
      }

      if (data.status === 'cancelled') {
        localStorage.removeItem(STORAGE_KEY);
        setPending(null);
        setMessage(copy.cancelled);
        return;
      }

      const codeNote = typeof data.providerCode === 'number' ? ` (${copy.providerCode}: ${data.providerCode})` : '';

      if (data.status === 'pending' && data.error !== 'payment_unconfirmed') {
        setMessage(copy.stillPending);
      } else if (data.error === 'payment_unconfirmed') {
        setMessage(copy.unconfirmed + codeNote);
      } else if (response.status === 429 || data.error === 'too_many') {
        setMessage(copy.tooMany);
      } else {
        setMessage(copy.failed);
      }
    } catch {
      setMessage(copy.offline);
    } finally {
      setBusy(false);
    }
  };

  const isEnglish = lang === 'en';

  if (!pending && !message) return null;

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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{copy.title}</div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={copy.close}
              title={copy.close}
              style={{ flex: 'none', width: 32, height: 32, border: 0, borderRadius: 8, background: 'transparent', color: '#f7f1e5', fontSize: 22, lineHeight: 1, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.9, opacity: 0.9 }}>
            {copy.description}
          </div>

          {message && (
            <div style={{ marginTop: 10, padding: '9px 12px', borderRadius: 10, background: 'rgba(197, 166, 107, .16)', fontSize: 13, lineHeight: 1.9 }}>
              {message}
            </div>
          )}

          {confirming ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, lineHeight: 1.9 }}>{copy.confirmText}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={cancelPayment}
                  style={{ ...buttonBase, border: 0, background: '#c5a66b', color: '#17231e', fontWeight: 700 }}
                >
                  {copy.confirmYes}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  style={{ ...buttonBase, border: '1px solid rgba(247,241,229,.45)', background: 'transparent', color: '#f7f1e5' }}
                >
                  {copy.confirmNo}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={continuePayment}
                style={{ ...buttonBase, border: 0, background: '#c5a66b', color: '#17231e', fontWeight: 700 }}
              >
                {copy.continue}
              </button>
              <button
                type="button"
                onClick={() => { setMessage(''); setConfirming(true); }}
                disabled={busy}
                style={{
                  ...buttonBase,
                  border: '1px solid rgba(247,241,229,.45)',
                  background: 'transparent',
                  color: '#f7f1e5',
                  cursor: busy ? 'wait' : 'pointer',
                  opacity: busy ? 0.65 : 1,
                }}
              >
                {busy ? copy.checking : copy.cancel}
              </button>
            </div>
          )}
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
