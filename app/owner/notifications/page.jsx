import NotificationsView from '@/components/owner/views/NotificationsView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'اعلان‌ها | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <NotificationsView />;
}
