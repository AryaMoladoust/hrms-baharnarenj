import RoomsList from '@/components/rooms/list/RoomsList';
import JsonLd from '@/components/seo/JsonLd';
import { translate } from '@/lib/i18n';
import { roomsListSchema } from '@/lib/seo/schema';

export const metadata = {
  title: translate('fa', 'seoRoomsTitle'),
  description: translate('fa', 'seoRoomsDescription'),
  alternates: { canonical: '/rooms' },
};

export default function RoomsPage() {
  return (
    <>
      <JsonLd data={roomsListSchema()} />
      <RoomsList />
    </>
  );
}
