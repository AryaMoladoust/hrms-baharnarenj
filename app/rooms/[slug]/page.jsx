import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoomDetail from '@/components/rooms/detail/RoomDetail';
import { getRoomBySlug } from '@/lib/rooms';

export default async function RoomPage({ params }) {
  const { slug } = await params;
  if (!getRoomBySlug(slug)) notFound();

  // RoomDetail reads ?checkIn&checkOut from the URL, so it needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <RoomDetail slug={slug} />
    </Suspense>
  );
}
