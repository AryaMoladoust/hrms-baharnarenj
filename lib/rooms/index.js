// Put each room's photos in public/images/rooms/<slug>/ and list the file names in `images`.
// Until a file exists, the gallery shows a season-colored placeholder.
//
// `description` / `descriptionEn`: shown on the room page. Edit freely.
// `features` / `featuresEn`: short bullet points (add or remove lines; only list what the room really has).
const SHARED = {
  features: [],
  featuresEn: [],
};

export const rooms = [
  {
    slug: 'bahar', name: 'بهار', nameEn: 'Bahar (Spring)', imageDir: '/images/rooms/bahar', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
    description: 'اتاق بهار، یکی از چهار اتاق فصلی اقامتگاه بهارنارنج در رشت؛ جایی آرام برای اقامتی دنج در فضایی با معماری سنتی.',
    descriptionEn: 'Bahar, one of the four seasonal rooms at Baharnarenj guesthouse in Rasht: a calm, cozy stay in a setting of traditional architecture.',
    ...SHARED,
  },
  {
    slug: 'tabestan', name: 'تابستان', nameEn: 'Tabestan (Summer)', imageDir: '/images/rooms/tabestan', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
    description: 'اتاق تابستان، یکی از چهار اتاق فصلی اقامتگاه بهارنارنج؛ اقامتی راحت و دلنشین در دل رشت.',
    descriptionEn: 'Tabestan, one of the four seasonal rooms at Baharnarenj guesthouse: a comfortable, pleasant stay in the heart of Rasht.',
    ...SHARED,
  },
  {
    slug: 'paeez', name: 'پاییز', nameEn: 'Paeez (Autumn)', imageDir: '/images/rooms/paeez', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'اتاق پاییز، یکی از چهار اتاق فصلی اقامتگاه بهارنارنج؛ جایی برای استراحت بعد از گشت\u200cوگذار در گیلان.',
    descriptionEn: 'Paeez, one of the four seasonal rooms at Baharnarenj guesthouse: a place to rest after exploring Gilan.',
    ...SHARED,
  },
  {
    slug: 'zemestan', name: 'زمستان', nameEn: 'Zemestan (Winter)', imageDir: '/images/rooms/zemestan', images: ['1.jpg', '2.jpg', '3.jpg'],
    description: 'اتاق زمستان، یکی از چهار اتاق فصلی اقامتگاه بهارنارنج؛ گوشه\u200cای آرام برای روزهای بارانی رشت.',
    descriptionEn: 'Zemestan, one of the four seasonal rooms at Baharnarenj guesthouse: a quiet corner for Rasht’s rainy days.',
    ...SHARED,
  },
  {
    slug: 'suite', name: 'سوئیت', nameEn: 'Suite', imageDir: '/images/rooms/suite', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'سوئیت اقامتگاه بهارنارنج در رشت؛ مناسب کسانی که فضای بیشتری برای اقامت می\u200cخواهند.',
    descriptionEn: 'The suite at Baharnarenj guesthouse in Rasht, for guests who want more room to settle in.',
    ...SHARED,
  },
];

export function getRoomBySlug(slug) {
  return rooms.find((room) => room.slug === slug);
}
