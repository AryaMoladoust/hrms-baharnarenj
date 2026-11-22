import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoomDetail from '@/components/rooms/detail/RoomDetail';
import RoomSeoContent from '@/components/seo/RoomSeoContent';
import JsonLd from '@/components/seo/JsonLd';
import { translate } from '@/lib/i18n';
import { getRoomBySlug, rooms } from '@/lib/rooms';
import { breadcrumbSchema, roomImageUrl, roomSchema } from '@/lib/seo/schema';

export function generateStaticParams() {
  return rooms.map((room) => ({ slug: room.slug }));
}

// One page per room. The canonical address ignores ?checkIn=&checkOut=, so every date combination counts as the same page.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) return {};
  const title = `اتاق ${room.name}`;
  const description = translate('fa', 'seoRoomDescription', { name: room.name, features: [room.tag && `اتاق ${room.tag}`, ...room.features].filter(Boolean).join('، ') });
  const image = roomImageUrl(room);
  return {
    title,
    description,
    alternates: { canonical: `/rooms/${slug}` },
    openGraph: { title: `${title} | اقامتگاه بهارنارنج رشت`, description, url: `/rooms/${slug}`, ...(image ? { images: [{ url: image, alt: translate('fa', 'altRoom', { name: room.name }) }] } : {}) },
  };
}

export default async function RoomPage({ params }) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  // RoomDetail reads ?checkIn&checkOut from the URL, so it needs a Suspense boundary. The fallback is real text, not an empty page.
  return (
    <>
      <JsonLd data={[roomSchema(slug), breadcrumbSchema([{ name: 'خانه', path: '/' }, { name: 'اتاق‌ها', path: '/rooms' }, { name: `اتاق ${room.name}`, path: `/rooms/${slug}` }])]} />
      <Suspense fallback={<RoomSeoContent room={room} />}>
        <RoomDetail slug={slug} />
      </Suspense>
    </>
  );
}
