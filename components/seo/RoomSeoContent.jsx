import Link from 'next/link';
import styles from './RoomSeoContent.module.css';

// Real text for the room page that is already in the HTML the server sends (search engines and slow phones see it before any JavaScript runs).
// The interactive page replaces it as soon as it loads.
export default function RoomSeoContent({ room }) {
  return (
    <main className={styles.page}>
      <h1>اتاق {room.name} | اقامتگاه بهارنارنج رشت</h1>
      {room.tag && <p>{room.tag}</p>}
      <ul>{room.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <p>قیمت هر شب و وضعیت خالی بودن این اتاق برای تاریخ شما در همین صفحه نمایش داده می‌شود.</p>
      <Link href="/rooms">همه‌ی اتاق‌های اقامتگاه بهارنارنج</Link>
    </main>
  );
}
