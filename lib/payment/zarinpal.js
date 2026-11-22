const isSandbox = () => process.env.ZARINPAL_SANDBOX === '1' || process.env.ZARINPAL_SANDBOX === 'true';

function endpoints() {
  if (isSandbox()) {
    return {
      request: 'https://sandbox.zarinpal.com/pg/v4/payment/request.json',
      verify: 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json',
      startPay: 'https://sandbox.zarinpal.com/pg/StartPay/',
    };
  }
  return {
    request: 'https://api.zarinpal.com/pg/v4/payment/request.json',
    verify: 'https://api.zarinpal.com/pg/v4/payment/verify.json',
    startPay: 'https://www.zarinpal.com/pg/StartPay/',
  };
}

function merchantId() {
  const value = process.env.ZARINPAL_MERCHANT_ID?.trim();
  if (!value) throw new Error('ZARINPAL_MERCHANT_ID is not configured');
  return value;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(`ZarinPal HTTP ${response.status}`);
  return data;
}

// Project prices are stored in Toman. ZarinPal API v4 expects Rial.
export function tomanToRial(amount) {
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error('Invalid payment amount');
  const rial = value * 10;
  if (!Number.isSafeInteger(rial)) throw new Error('Payment amount is too large');
  return rial;
}

export async function createZarinpalPayment({ amountToman, callbackUrl, description, mobile }) {
  const urls = endpoints();
  const amount = tomanToRial(amountToman);
  const payload = {
    merchant_id: merchantId(),
    amount,
    callback_url: callbackUrl,
    description: String(description || 'پرداخت رزرو اقامتگاه بهارنارنج').slice(0, 500),
    metadata: mobile ? { mobile: String(mobile) } : {},
  };
  const result = await postJson(urls.request, payload);
  const code = Number(result?.data?.code);
  const authority = result?.data?.authority;
  if (code !== 100 || !authority) {
    const message = result?.errors?.message || result?.data?.message || `ZarinPal request failed (${code})`;
    throw new Error(message);
  }
  return { authority, paymentUrl: `${urls.startPay}${encodeURIComponent(authority)}`, amountRial: amount };
}

export async function verifyZarinpalPayment({ authority, amountToman }) {
  const urls = endpoints();
  const result = await postJson(urls.verify, {
    merchant_id: merchantId(),
    amount: tomanToRial(amountToman),
    authority,
  });
  const code = Number(result?.data?.code);
  return {
    code,
    refId: result?.data?.ref_id == null ? '' : String(result.data.ref_id),
    message: result?.data?.message || result?.errors?.message || '',
    success: code === 100 || code === 101,
  };
}
