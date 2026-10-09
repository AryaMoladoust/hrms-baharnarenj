import webpush from 'web-push';
import * as repo from '@/lib/db/repo';

// Web Push (a notification on the owner's phone even when the site is closed). It stays off until you set the keys:
//   npx web-push generate-vapid-keys   ->   NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@example.com)
export const pushEnabled = () => Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

export async function sendPushToOwners(payload, { excludeUsername } = {}) {
  if (!pushEnabled()) return;
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    const subscriptions = (await repo.listPushSubscriptions()).filter((s) => s.username !== excludeUsername);
    await Promise.all(subscriptions.map(async (s) => {
      try {
        await webpush.sendNotification(s.subscription, JSON.stringify(payload));
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) await repo.removePushSubscription(s.endpoint); // the phone unsubscribed
      }
    }));
  } catch (error) {
    console.error('push failed', error); // a failed push must never break a booking
  }
}
