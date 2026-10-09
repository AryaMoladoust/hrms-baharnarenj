import ReservationsView from '@/components/owner/views/ReservationsView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'رزروها | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <ReservationsView />;
}
