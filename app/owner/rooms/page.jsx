import RoomsView from '@/components/owner/views/RoomsView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'اتاق‌ها | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <RoomsView />;
}
