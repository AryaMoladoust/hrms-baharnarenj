import styles from './page.module.css';

const rooms = ['بهار', 'تابستان', 'پاییز', 'زمستان', 'سوئیت'];

export default function RoomsPage() {
  return (
    <main className={styles.page}>
      <h1>اتاق‌ها</h1>
      <div className={styles.grid}>
        {rooms.map((room) => (
          <article key={room}>{room}</article>
        ))}
      </div>
    </main>
  );
}
