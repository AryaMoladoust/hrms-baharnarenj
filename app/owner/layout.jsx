import OwnerShell from '@/components/owner/OwnerShell';

export const metadata = { robots: { index: false, follow: false } }; // the owner panel must never show up in search engines

// The frame (top bar + bottom navigation) is mounted once here and kept while the owner moves between pages.
export default function OwnerLayout({ children }) {
  return <OwnerShell>{children}</OwnerShell>;
}
