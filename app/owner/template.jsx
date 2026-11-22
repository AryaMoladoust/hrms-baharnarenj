import styles from '@/components/owner/OwnerShell.module.css';

// Unlike the layout, a template is created again on every navigation. That restarts the fade-in on the page content only.
export default function OwnerTemplate({ children }) {
  return <div className={styles.pageIn}>{children}</div>;
}
