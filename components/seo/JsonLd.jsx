// Puts structured data (JSON-LD) into the page HTML. Server component. "<" is escaped so the data can never break out of the script tag.
export default function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
