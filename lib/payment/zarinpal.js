const isSandbox = () =>
  process.env.ZARINPAL_SANDBOX === '1' ||
  process.env.ZARINPAL_SANDBOX === 'true';

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
  if (!value) throw new Error('ZARINPAL_MERCHANT_ID is missing from the server environment.');
  return value;
}

function responseMessage(data) {
  const message = data?.errors?.message || data?.data?.message || data?.message;
  return typeof message === 'string' ? message : '';
}

async function postJson(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not connect to ZarinPal: ${message}`);
  }

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // Keep the response body out of logs; it may contain provider diagnostics.
  }

  if (!response.ok) {
    const message = responseMessage(data);
    throw new Error(`ZarinPal returned HTTP ${response.status}${message ? `: ${message}` : ''}.`);
  }

  if (!data || typeof data !== 'object') {
    throw new Error('ZarinPal returned an empty or invalid JSON response.');
  }

  return data;
}

// Project prices are stored in Toman. ZarinPal API v4 expects Rial.
export function tomanToRial(amount) {
  const value = Number(amount);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error('Invalid payment amount: expected a positive integer in Toman.');
  }

  const rial = value * 10;
  if (!Number.isSafeInteger(rial)) throw new Error('Payment amount is too large.');
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
  const code = Number(result?.data?.code ?? result?.errors?.code);
  const authority = result?.data?.authority;

  if (code !== 100 || !authority) {
    const message = responseMessage(result);
    throw new Error(`ZarinPal did not create a payment session (code: ${Number.isFinite(code) ? code : 'unknown'}).${message ? ` ${message}` : ''}`);
  }

  return {
    authority: String(authority),
    paymentUrl: `${urls.startPay}${encodeURIComponent(authority)}`,
    amountRial: amount,
  };
}

export async function verifyZarinpalPayment({ authority, amountToman }) {
  const urls = endpoints();
  const result = await postJson(urls.verify, {
    merchant_id: merchantId(),
    amount: tomanToRial(amountToman),
    authority,
  });

  const code = Number(result?.data?.code ?? result?.errors?.code);

  return {
    code,
    refId: result?.data?.ref_id == null ? '' : String(result.data.ref_id),
    message: responseMessage(result),
    success: code === 100 || code === 101,
  };
}
