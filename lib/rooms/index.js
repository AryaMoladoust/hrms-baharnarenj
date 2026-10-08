// Put each room's photos in public/images/rooms/<slug>/ and list the file names in `images`.
// Until a file exists, the gallery shows a season-colored placeholder.
//
// `features` / `featuresEn`: short chips (add or remove lines; only list what the room really has).
// `tag` / `tagEn`: optional small label on the room card (bed count / capacity).
const SHARED = {
  features: ['اتاق مستر با سرویس بهداشتی و حمام اختصاصی', 'سیستم سرمایشی و گرمایشی', 'بافت سنتی با شیشه‌های رنگی', 'پارکینگ عمومی یک کوچه آن‌طرف‌تر'],
  featuresEn: ['Master room with private bathroom and WC', 'Heating and air conditioning', 'Traditional building with stained glass', 'Public parking one alley away'],
};

export const rooms = [
  {
    slug: 'bahar', name: 'بهار', nameEn: 'Bahar (Spring)', imageDir: '/images/rooms/bahar', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
    ...SHARED,
  },
  {
    slug: 'tabestan', name: 'تابستان', nameEn: 'Tabestan (Summer)', imageDir: '/images/rooms/tabestan', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
    tag: 'سه‌تخته', tagEn: '3 beds',
    ...SHARED,
  },
  {
    slug: 'paeez', name: 'پاییز', nameEn: 'Paeez (Autumn)', imageDir: '/images/rooms/paeez', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    ...SHARED,
  },
  {
    slug: 'zemestan', name: 'زمستان', nameEn: 'Zemestan (Winter)', imageDir: '/images/rooms/zemestan', images: ['1.jpg', '2.jpg', '3.jpg'],
    ...SHARED,
  },
  {
    slug: 'suite', name: 'سوئیت', nameEn: 'Suite', imageDir: '/images/rooms/suite', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    tag: 'چهار نفره', tagEn: 'Sleeps 4',
    ...SHARED,
  },
];

export function getRoomBySlug(slug) {
  return rooms.find((room) => room.slug === slug);
}
