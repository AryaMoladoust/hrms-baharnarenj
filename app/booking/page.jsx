import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/user/booking/BookingForm';
import { getRoomBySlug } from '@/lib/rooms';

export default async function BookingPage({ searchParams }) {
  const { room } = await searchParams;
  if (!getRoomBySlug(room)) notFound();

  return (
    <Suspense fallback={null}>
      <BookingForm slug={room} />
    </Suspense>
  );
}
