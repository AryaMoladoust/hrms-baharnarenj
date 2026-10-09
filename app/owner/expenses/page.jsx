import { redirect } from 'next/navigation';

// Expenses and reports now live together on one page.
export default function Page() {
  redirect('/owner/finance');
}
