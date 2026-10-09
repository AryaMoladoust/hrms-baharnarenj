import PricingView from '@/components/owner/views/PricingView';
import { requireOwner } from '@/lib/owner/session';

export const metadata = { title: 'قیمت‌گذاری | بهارنارنج', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  await requireOwner(); // not signed in -> /owner/login
  return <PricingView />;
}
