import DashboardView from '@/components/owner/views/DashboardView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'پنل مالک | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <DashboardView />;
}
