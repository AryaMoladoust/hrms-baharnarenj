import BookingDone from '@/components/user/booking/BookingDone';

export const metadata = { title: 'ثبت رزرو | بهارنارنج', robots: { index: false } };

export default async function BookingDonePage({ searchParams }) {
  const { code = '', pending } = await searchParams;
  return <BookingDone code={String(code).slice(0, 30)} pending={Boolean(pending)} />;
}
