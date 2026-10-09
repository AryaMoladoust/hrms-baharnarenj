import AccountView from '@/components/owner/views/AccountView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'حساب کاربری | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <AccountView />;
}
