/**
 * Service worker viết tay — thay cho vite-plugin-pwa.
 *
 * Hai chiến lược, cố ý khác nhau:
 *  - Vỏ ứng dụng (HTML/CSS/JS/icon): cache-first. Khung tranh phải mở được
 *    ngay cả khi mất mạng, và các file này chỉ đổi khi bạn sửa mã.
 *  - Ảnh từ Internet và font: stale-while-revalidate. Hiện bản đã lưu ngay,
 *    đồng thời tải bản mới về cho lần sau.
 *
 * ⚠️ Đổi CACHE_VERSION mỗi lần sửa mã, nếu không trình duyệt sẽ giữ bản cũ.
 */

const CACHE_VERSION = 'khung-tranh-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tailwind.css',
  './css/app.css',
  './js/app.js',
  './js/store.js',
  './js/dom.js',
  './js/data.js',
  './js/icons.js',
  './js/lunar.js',
  './js/weather.js',
  './js/sound.js',
  './js/storage.js',
  './js/wake-lock.js',
  './js/ui/photo-frame.js',
  './js/ui/widgets.js',
  './js/ui/control-bar.js',
  './js/ui/modals.js',
  './public/icon.svg',
  './public/favicon.ico',
  './public/apple-touch-icon.png',
  './public/pwa-192x192.png',
  './public/pwa-512x512.png',
  './public/pwa-maskable-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll hỏng nếu MỘT file lỗi, nên thêm từng file để thiếu một icon
      // không làm hỏng cả lần cài đặt.
      .then((cache) => Promise.all(SHELL_FILES.map((f) => cache.add(f).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const {request} = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Thời tiết và định vị: luôn lấy bản mới, không bao giờ cache.
  if (/open-meteo\.com|bigdatacloud\.net/.test(url.hostname)) return;

  const isRemoteAsset =
    /fonts\.googleapis\.com|fonts\.gstatic\.com|images\.unsplash\.com/.test(url.hostname);

  if (isRemoteAsset) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cùng tên miền: ưu tiên bản đã lưu, không có thì ra mạng.
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((res) => {
              if (res && res.status === 200) {
                const copy = res.clone();
                caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
              }
              return res;
            })
            // Mất mạng và xin một trang HTML thì trả về trang chủ đã lưu.
            .catch(() => (request.mode === 'navigate' ? caches.match('./index.html') : undefined))
      )
    );
  }
});
