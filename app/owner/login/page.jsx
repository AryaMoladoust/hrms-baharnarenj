import { redirect } from 'next/navigation';
import LoginView from '@/components/owner/views/LoginView';
import { getSession } from '@/lib/owner/session';

export const metadata = { title: 'ورود مالک | بهارنارنج', robots: { index: false } };

export default async function OwnerLoginPage() {
  if (await getSession()) redirect('/owner/dashboard'); // already signed in
  return <LoginView />;
}
