import FinanceView from '@/components/owner/views/FinanceView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'دخل و خرج | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <FinanceView />;
}
