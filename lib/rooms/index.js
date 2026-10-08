// Put each room's photos in public/images/rooms/<slug>/ and list the file names in `images`.
// Until a file exists, the gallery shows a season-colored placeholder.
//
// `description` / `descriptionEn`: shown on the room page. Edit freely.
// `features` / `featuresEn`: short chips (add or remove lines; only list what the room really has).
// `tag` / `tagEn`: optional small label on the room card (bed count / capacity).
const SHARED = {
  features: ['اتاق مستر با سرویس بهداشتی و حمام اختصاصی', 'سیستم سرمایشی و گرمایشی', 'بافت سنتی با شیشه‌های رنگی', 'پارکینگ عمومی یک کوچه آن‌طرف‌تر'],
  featuresEn: ['Master room with private bathroom and WC', 'Heating and air conditioning', 'Traditional building with stained glass', 'Public parking one alley away'],
};

export const rooms = [
  {
    slug: 'bahar', name: 'بهار', nameEn: 'Bahar (Spring)', imageDir: '/images/rooms/bahar', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
    description: 'اتاق بهار نخستین اتاق از چهار اتاق فصلی بهارنارنج است؛ نامش یادآور شکوفه‌های نارنج و آغاز بهار در گیلان است.\n\nاتاقی مستر با سرویس بهداشتی و حمام اختصاصی، مجهز به سیستم سرمایشی و گرمایشی، در ساختمانی سنتی با درهای چوبی و شیشه‌های رنگی؛ اقامتی آرام و دنج در میدان شهرداری رشت.',
    descriptionEn: 'Bahar is the first of Baharnarenj’s four seasonal rooms, named after the bitter orange blossom and the start of spring in Gilan.\n\nA master room with its own bathroom and WC, equipped with heating and air conditioning, in a traditional building with wooden doors and stained glass: a calm, cozy stay at Shahrdari Square, Rasht.',
    ...SHARED,
  },
  {
    slug: 'tabestan', name: 'تابستان', nameEn: 'Tabestan (Summer)', imageDir: '/images/rooms/tabestan', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'],
    description: 'اتاق تابستان، دومین اتاق فصلی بهارنارنج، یک اتاق سه‌تخته با حال‌وهوایی روشن و دلنشین.\n\nمستر با سرویس بهداشتی و حمام اختصاصی و سیستم سرمایشی و گرمایشی؛ مناسب سه نفر، در بافت قدیمی و آرام میدان شهرداری رشت.',
    descriptionEn: 'Tabestan is the second seasonal room at Baharnarenj: a bright, pleasant three-bed room.\n\nA master room with private bathroom and WC and heating and air conditioning; suits three guests, in the calm old quarter around Shahrdari Square, Rasht.',
    tag: 'سه‌تخته', tagEn: '3 beds',
    ...SHARED,
  },
  {
    slug: 'paeez', name: 'پاییز', nameEn: 'Paeez (Autumn)', imageDir: '/images/rooms/paeez', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'اتاق پاییز، سومین اتاق فصلی بهارنارنج؛ گرم و آرام مثل غروب‌های پاییزی گیلان.\n\nمستر با سرویس بهداشتی و حمام اختصاصی و سیستم سرمایشی و گرمایشی؛ جایی برای استراحت بعد از یک روز پیاده‌روی در کوچه‌های رشت.',
    descriptionEn: 'Paeez is the third seasonal room at Baharnarenj, warm and quiet like an autumn dusk in Gilan.\n\nA master room with private bathroom and WC and heating and air conditioning; a place to rest after a day walking Rasht’s alleys.',
    ...SHARED,
  },
  {
    slug: 'zemestan', name: 'زمستان', nameEn: 'Zemestan (Winter)', imageDir: '/images/rooms/zemestan', images: ['1.jpg', '2.jpg', '3.jpg'],
    description: 'اتاق زمستان، چهارمین اتاق فصلی بهارنارنج؛ گوشه‌ای آرام برای روزهای بارانی رشت.\n\nمستر با سرویس بهداشتی و حمام اختصاصی و سیستم سرمایشی و گرمایشی؛ سادگی و آرامش در یک اقامتگاه سنتی.',
    descriptionEn: 'Zemestan is the fourth seasonal room at Baharnarenj, a quiet corner for Rasht’s rainy days.\n\nA master room with private bathroom and WC and heating and air conditioning: simplicity and calm in a traditional guesthouse.',
    ...SHARED,
  },
  {
    slug: 'suite', name: 'سوئیت', nameEn: 'Suite', imageDir: '/images/rooms/suite', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
    description: 'سوئیت بهارنارنج برای چهار نفر است و برای کسانی که فضای بیشتری می‌خواهند.\n\nدر همان بافت سنتی و آرام اقامتگاه، با سرویس بهداشتی و حمام اختصاصی و سیستم سرمایشی و گرمایشی؛ مناسب خانواده‌ها و سفرهای گروهی کوچک.',
    descriptionEn: 'The Baharnarenj suite sleeps four, for guests who want more room.\n\nSet in the same calm, traditional building, with private bathroom and WC and heating and air conditioning; ideal for families and small group trips.',
    tag: 'چهار نفره', tagEn: 'Sleeps 4',
    ...SHARED,
  },
];

export function getRoomBySlug(slug) {
  return rooms.find((room) => room.slug === slug);
}
