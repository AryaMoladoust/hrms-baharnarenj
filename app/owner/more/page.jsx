import MoreView from '@/components/owner/views/MoreView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'بیشتر | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <MoreView />;
}
