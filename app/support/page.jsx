import SupportPage from '@/components/user/support/SupportPage';
import { translate } from '@/lib/i18n';

export const metadata = {
  title: translate('fa', 'seoSupportTitle'),
  description: translate('fa', 'seoSupportDescription'),
  alternates: { canonical: '/support' },
};

export default function Support() {
  return <SupportPage />;
}
