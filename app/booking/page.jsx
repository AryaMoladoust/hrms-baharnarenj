import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/user/booking/BookingForm';
import { getRoomBySlug } from '@/lib/rooms';

// Booking forms are not for search engines (they depend on a chosen room and dates).
export const metadata = { title: 'تکمیل رزرو', robots: { index: false, follow: false } };

export default async function BookingPage({ searchParams }) {
  const { room } = await searchParams;
  if (!getRoomBySlug(room)) notFound();

  return (
    <Suspense fallback={null}>
      <BookingForm slug={room} />
    </Suspense>
  );
}
