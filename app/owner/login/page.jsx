import styles from './page.module.css';

export default function OwnerLoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>ورود مالک</h1>
        <p>ورود به پنل مدیریت بهارنارنج</p>
        <form className={styles.form}>
          <label>نام کاربری یا ایمیل<input autoComplete="username" /></label>
          <label>رمز عبور<input type="password" autoComplete="current-password" /></label>
          <button type="submit">ورود</button>
        </form>
      </section>
    </main>
  );
}
