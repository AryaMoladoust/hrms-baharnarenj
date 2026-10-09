export const metadata = { robots: { index: false, follow: false } }; // the owner panel must never show up in search engines

export default function OwnerLayout({ children }) {
  return children;
}
