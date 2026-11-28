import { redirect } from 'next/navigation';
import FinanceView from '@/components/owner/views/FinanceView';
import { FINANCE_ENABLED } from '@/lib/owner/features';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'دخل و خرج | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  if (!FINANCE_ENABLED) redirect('/owner/dashboard'); // not part of this version (lib/owner/features.js)
  return <FinanceView />;
}
