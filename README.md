# Khung Tranh Kỹ Thuật Số Thông Minh

Biến iPad mini, iPhone hay tablet Android cũ thành khung tranh ảnh gia đình: chiếu
ảnh theo album, hiện đồng hồ, âm lịch Việt Nam, thời tiết, ngày kỷ niệm, âm thanh
thư giãn và chế độ ban đêm dịu mắt.

Ứng dụng viết bằng **HTML + CSS + JavaScript thuần**. Không React, không Node, không
bước build. Chép thư mục lên hosting là chạy.

---

## Đưa lên hosting cPanel

**Bước 1 — tạo thư mục `build\`:**

```powershell
powershell -ExecutionPolicy Bypass -File tao-build.ps1
```

Script chỉ chép file, không biên dịch gì. Nó gom 6 mục cần thiết
(`index.html`, `manifest.webmanifest`, `sw.js`, `css\`, `js\`, `public\`),
bỏ bớt `css\tailwind.src.css` (chỉ dùng lúc dựng lại CSS) và thêm `.htaccess`.
Kết quả: **26 file, khoảng 328 KB**.

Nếu thiếu file hoặc `css\tailwind.css` dựng hỏng, script dừng ngay thay vì tạo ra
bản build thiếu.

**Bước 2 — tải lên:**

Vào **cPanel → File Manager**, mở `public_html` (hoặc thư mục con, ví dụ
`public_html/khungtranh`), rồi tải lên **toàn bộ nội dung bên trong** `build\` —
không tải chính thư mục `build`.

Cách nhanh: nén `build\` thành `.zip`, dùng **Upload** rồi **Extract** ngay trên
File Manager. Nhớ bật **Settings → Show Hidden Files** để thấy `.htaccess`.

**Bước 3 —** mở `https://tenmien.cua.ban/khungtranh/` là xong.

### Vì sao cần .htaccess

Hosting dùng LiteSpeed (Hostinger, nhiều gói cPanel khác) tự gắn thêm cache dài
ngày cho file tĩnh. Nếu để mặc định, bạn sửa mã rồi tải lên nhưng iPad vẫn chạy
bản cũ cả tuần. File `.htaccess` trong `build\` khai rõ:

| File | Cache |
|---|---|
| `index.html`, `sw.js` | không cache — hai file này quyết định bản nào được chạy |
| `.js`, `.css`, `.webmanifest` | bắt hỏi lại mỗi lần; không đổi thì máy chủ trả 304 |
| ảnh, icon | cache 7 ngày |

### Bắt buộc phải có HTTPS

Service worker (chạy offline), Wake Lock (chống tắt màn hình) và định vị GPS
**chỉ hoạt động trên HTTPS**. cPanel có sẵn chứng chỉ Let's Encrypt miễn phí:
**cPanel → SSL/TLS Status → Run AutoSSL**.

Chạy thử ở máy cũng được — `http://localhost` được trình duyệt coi là an toàn:

```bash
python -m http.server 4173
```

Mở `http://127.0.0.1:4173/`. **Mở thẳng file `index.html` bằng cách nhấp đúp sẽ
KHÔNG chạy** — trình duyệt chặn `import` trên giao thức `file://`.

---

## Biến iPad thành khung tranh treo tường

1. Mở trang bằng **Safari** (không dùng Chrome trên iOS).
2. Nhấn nút **Chia sẻ** → **Thêm vào MH chính**.
3. Mở ứng dụng từ màn hình chính — Safari sẽ ẩn hết thanh địa chỉ.
4. Trong iPad: **Cài đặt → Màn hình & Độ sáng → Tự khóa → Không bao giờ**.
5. Bật **Truy cập có hướng dẫn** (Cài đặt → Trợ năng) để trẻ con không bấm ra ngoài.

Nút **Hướng dẫn iPad** ngay trong ứng dụng có đủ các bước này.

---

## Cấu trúc mã

```
index.html              Khung trang, khai báo 5 vùng vẽ
css/
  tailwind.css          Tailwind đã dựng sẵn thành file tĩnh (xem "Sửa giao diện")
  tailwind.src.css      File nguồn, chỉ dùng khi cần dựng lại tailwind.css
  app.css               CSS viết tay: khung tranh, viền passe-partout, hiệu ứng
js/
  app.js                Điểm khởi động: gắn sự kiện, chia vùng vẽ, đồng hồ
  store.js              Kho trạng thái + thao tác (thay cho useState)
  dom.js                Tiện ích DOM + createRegion (chống vẽ lại thừa)
  data.js               Ảnh mẫu, album mẫu, châm ngôn
  icons.js              45 icon Lucide đã rút thành chuỗi SVG
  lunar.js              Âm lịch Việt Nam (thuật toán Hồ Ngọc Đức)
  weather.js            Thời tiết Open-Meteo + định vị
  sound.js              Âm thanh thư giãn tổng hợp bằng Web Audio
  storage.js            IndexedDB cho ảnh, localStorage cho cài đặt
  wake-lock.js          Chống tắt màn hình (có đường lui cho iOS cũ)
  ui/                   Các hàm trả về chuỗi HTML cho từng mảng giao diện
sw.js                   Service worker viết tay (chạy offline)
public/                 Icon và favicon
```

### Vì sao chia 5 vùng vẽ

Đồng hồ nhảy mỗi giây. Nếu vẽ lại cả trang mỗi giây thì ảnh bị tải lại và hiệu ứng
Ken Burns giật — trên iPad đời A8/A9 thì thấy rõ. Nên `js/app.js` chia giao diện
thành 5 vùng độc lập (`frame`, `widgets`, `controls`, `night`, `modal`), mỗi vùng
tự tính một "chữ ký" từ phần trạng thái nó quan tâm và chỉ vẽ lại khi chữ ký đổi.
Riêng giây được ghi thẳng bằng `textContent` vào `[data-clock-s]`, không qua vẽ lại.

**Khi thêm trạng thái mới, nhớ đưa nó vào chữ ký của vùng tương ứng** trong
`js/app.js`, nếu không giao diện sẽ không cập nhật.

---

## Sửa giao diện

Có hai cách, chọn theo việc bạn đang làm:

**Cách 1 — viết CSS thẳng (không cần công cụ gì).** Thêm lớp của bạn vào
`css/app.css`. Dùng cho khung tranh mới, hiệu ứng mới, màu riêng.

**Cách 2 — dùng lớp Tailwind mới.** `css/tailwind.css` là file tĩnh đã dựng sẵn,
chỉ chứa những lớp mã hiện tại đang dùng. Nếu bạn viết một lớp Tailwind **chưa từng
xuất hiện** trong `index.html` hay `js/`, lớp đó sẽ không ăn. Dựng lại bằng:

```bash
npx @tailwindcss/cli -i css/tailwind.src.css -o css/tailwind.css --minify
```

Lệnh này tải Tailwind tạm thời rồi xóa, không để lại `node_modules`.

> Cố ý **không** dùng Tailwind bản CDN (biên dịch ngay trong trình duyệt): máy đích
> là iPad cũ, biên dịch CSS lúc mở trang làm trang trắng mất vài giây.

---

## Sửa ảnh mẫu

Sửa `DEFAULT_PHOTOS` trong `js/data.js`. Mỗi ảnh cần `aspectRatio` đúng với ảnh
thật — con số này quyết định ảnh dọc có được tự ghép đôi hay không.

Ảnh Unsplash thỉnh thoảng bị gỡ. Kiểm tra nhanh một đường dẫn:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "<đường-dẫn-ảnh>"
```

`200` là còn, `404` là đã bị gỡ.

---

## Quy trình sau mỗi lần sửa mã

1. **Đổi số phiên bản cache** trong `sw.js`. Service worker lưu toàn bộ vỏ ứng dụng
   để chạy offline; không đổi số thì trình duyệt giữ nguyên bản cũ dù bạn đã tải
   bản mới lên hosting.

   ```js
   const CACHE_VERSION = 'khung-tranh-v1';   // → 'khung-tranh-v2'
   ```

   Thêm file `.js` mới thì nhớ thêm luôn vào mảng `SHELL_FILES` trong `sw.js`.

2. **Dựng lại `build\`** — script xóa sạch thư mục cũ trước khi chép, nên không sợ
   sót file thừa của lần trước:

   ```powershell
   powershell -ExecutionPolicy Bypass -File tao-build.ps1
   ```

3. **Tải lại lên hosting**, ghi đè bản cũ.

Nếu vừa dựng lại `css\tailwind.css` thì cũng phải làm lại bước 2 — `build\` là bản
chép, không tự cập nhật theo thư mục gốc.

---

## Dịch vụ bên ngoài

| Dịch vụ | Dùng để | Cần khóa API |
|---|---|---|
| `images.unsplash.com` | Ảnh mẫu | Không |
| `fonts.googleapis.com` | Phông chữ | Không |
| `open-meteo.com` | Thời tiết | Không |
| `bigdatacloud.net` | Đổi tọa độ GPS ra tên thành phố | Không |

Không có mạng thì ứng dụng vẫn mở được; ảnh đã xem và phông chữ lấy từ cache, chỉ
phần thời tiết tạm ẩn.

Ảnh bạn tự tải lên nằm trong **IndexedDB của chính máy đó**, không gửi đi đâu.
Xóa dữ liệu trình duyệt là mất — nên giữ bản gốc ở nơi khác.

---

## Bản React cũ

Ứng dụng này trước đây viết bằng React + Vite. Mã nguồn đó đã xóa khỏi thư mục làm
việc nhưng **git vẫn giữ nguyên ở commit `b81fcd4`**. Nếu cần đối chiếu:

```bash
git show b81fcd4:src/components/PhotoFrame.tsx     # xem một file
git checkout b81fcd4 -- src/                        # lấy lại cả thư mục
```

Bảng đối chiếu nhanh giữa hai bản:

| Bản React | Bản thuần |
|---|---|
| `src/App.tsx` | `js/app.js` + `js/store.js` |
| `src/components/PhotoFrame.tsx` | `js/ui/photo-frame.js` |
| `src/components/SmartWidgets.tsx` | `js/ui/widgets.js` |
| `src/components/ControlBar.tsx` | `js/ui/control-bar.js` |
| `src/components/*Modal.tsx` | `js/ui/modals.js` (gộp chung) |
| `src/utils/*.ts` | `js/lunar.js`, `weather.js`, `sound.js`, `storage.js`, `wake-lock.js` |
| `src/data/*.ts` | `js/data.js` |
| `useState` | `js/store.js` |
| `lucide-react` | `js/icons.js` (45 icon đã rút thành chuỗi SVG) |
| `vite build` | không có — chép thẳng lên hosting |
| `vite-plugin-pwa` | `sw.js` viết tay |
