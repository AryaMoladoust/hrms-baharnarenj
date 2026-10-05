// Put each room's photos in public/images/rooms/<slug>/ and list the file names in `images`.
// Until a file exists, the gallery shows a season-colored placeholder.
export const rooms = [
  { slug: 'bahar', name: 'بهار', nameEn: 'Bahar (Spring)', imageDir: '/images/rooms/bahar', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'اتاقی دنج در اقامتگاه بهارنارنج رشت.', descriptionEn: 'A quiet room at Baharnarenj guesthouse in Rasht.' },
  { slug: 'tabestan', name: 'تابستان', nameEn: 'Tabestan (Summer)', imageDir: '/images/rooms/tabestan', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'اتاقی دنج در اقامتگاه بهارنارنج رشت.', descriptionEn: 'A quiet room at Baharnarenj guesthouse in Rasht.' },
  { slug: 'paeez', name: 'پاییز', nameEn: 'Paeez (Autumn)', imageDir: '/images/rooms/paeez', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'اتاقی دنج در اقامتگاه بهارنارنج رشت.', descriptionEn: 'A quiet room at Baharnarenj guesthouse in Rasht.' },
  { slug: 'zemestan', name: 'زمستان', nameEn: 'Zemestan (Winter)', imageDir: '/images/rooms/zemestan', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'اتاقی دنج در اقامتگاه بهارنارنج رشت.', descriptionEn: 'A quiet room at Baharnarenj guesthouse in Rasht.' },
  { slug: 'suite', name: 'سوئیت', nameEn: 'Suite', imageDir: '/images/rooms/suite', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'سوئیت اقامتگاه بهارنارنج رشت.', descriptionEn: 'The suite at Baharnarenj guesthouse in Rasht.' },
];

export function getRoomBySlug(slug) {
  return rooms.find((room) => room.slug === slug);
}
