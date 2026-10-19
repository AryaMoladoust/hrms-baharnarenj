import fs from 'node:fs';
import path from 'node:path';
import { SITE } from '@/lib/site';
import { rooms, getRoomBySlug } from '@/lib/rooms';
import { translate } from '@/lib/i18n';
import { faqItems } from '@/lib/seo/faq';

// Structured data (schema.org JSON-LD) written for search engines and AI answer engines. Persian is the main language of the site.
const abs = (pathname) => `${SITE.url}${pathname}`;

// First photo of a room that really exists on disk (the suite has none until you add its photos).
export function roomImageUrl(room) {
  const file = room.images?.find((name) => fs.existsSync(path.join(process.cwd(), 'public', room.imageDir, name)));
  return file ? abs(`${room.imageDir}/${file}`) : null;
}

const feature = (name) => ({ '@type': 'LocationFeatureSpecification', name, value: true });

function roomNode(room) {
  const image = roomImageUrl(room);
  return {
    '@type': 'HotelRoom',
    '@id': abs(`/rooms/${room.slug}#room`),
    name: `اتاق ${room.name}`,
    alternateName: room.nameEn,
    url: abs(`/rooms/${room.slug}`),
    ...(image ? { image } : {}),
    description: [room.tag && `اتاق ${room.tag}`, ...room.features].filter(Boolean).join('، '),
    amenityFeature: room.features.map(feature),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    url: SITE.url,
    name: SITE.name,
    alternateName: SITE.alternateNames,
    inLanguage: 'fa-IR',
    publisher: { '@id': abs('/#business') },
  };
}

export function lodgingSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': abs('/#business'),
    name: SITE.fullName,
    alternateName: SITE.alternateNames,
    url: SITE.url,
    image: [abs('/og-image.jpg')],
    description: translate('fa', 'seoDescription'),
    telephone: SITE.tel,
    address: { '@type': 'PostalAddress', streetAddress: SITE.street, addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: SITE.country },
    ...(SITE.geo ? { geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng } } : {}),
    ...(SITE.mapUrl ? { hasMap: SITE.mapUrl } : {}),
    ...(SITE.social.length ? { sameAs: SITE.social } : {}),
    numberOfRooms: rooms.length,
    availableLanguage: ['fa', 'en'],
    amenityFeature: [...new Set(rooms.flatMap((r) => r.features))].map(feature),
    containsPlace: rooms.map(roomNode),
  };
}

export function roomSchema(slug) {
  const room = getRoomBySlug(slug);
  return { '@context': 'https://schema.org', ...roomNode(room), containedInPlace: { '@id': abs('/#business') } };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: abs(item.path) })),
  };
}

export function roomsListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: rooms.map((room, i) => ({ '@type': 'ListItem', position: i + 1, name: `اتاق ${room.name}`, url: abs(`/rooms/${room.slug}`) })),
  };
}

// Google no longer shows FAQ rich results, but the markup is harmless and answer engines read the page text anyway.
export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems('fa').map((item) => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })),
  };
}
