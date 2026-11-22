import MyReservations from '@/components/user/reservations/MyReservations';

// Private page: never in search results.
export const metadata = { title: 'رزروهای من', robots: { index: false, follow: false } };

export default function MyReservationsPage() {
  return <MyReservations />;
}
