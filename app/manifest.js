// Lets the owner "Add to Home screen" so the panel opens like an app (and iPhones can receive Web Push).
export default function manifest() {
  return {
    name: 'بهارنارنج',
    short_name: 'بهارنارنج',
    description: 'اقامتگاه سنتی بهارنارنج، رشت',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1e19',
    theme_color: '#0f1e19',
    lang: 'fa',
    dir: 'rtl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
