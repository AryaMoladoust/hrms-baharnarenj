import HomePage from '@/components/user/home/HomePage';
import JsonLd from '@/components/seo/JsonLd';
import { faqSchema, lodgingSchema, websiteSchema } from '@/lib/seo/schema';

export const metadata = { alternates: { canonical: '/' } };

export default function Page() {
  return (
    <>
      <JsonLd data={[websiteSchema(), lodgingSchema(), faqSchema()]} />
      <HomePage />
    </>
  );
}
