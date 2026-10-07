/**
 * Bốn hộp thoại: Cài đặt, Quản lý ảnh, Hướng dẫn iPad và Hướng dẫn cài PWA.
 *
 * Mỗi hộp là một hàm trả về chuỗi HTML. Trạng thái tạm của form (tab đang mở,
 * ô đang gõ) nằm trong store chứ không nằm trong DOM, để vẽ lại không mất dữ
 * liệu người dùng vừa nhập.
 */

import {esc} from '../dom.js';
import {FRAME_THEMES, SOUND_OPTIONS} from '../data.js';
import {icon} from '../icons.js';

const SHELL =
  'bg-neutral-900 border border-neutral-700 w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92svh] text-slate-100 animate-pop-in';
const BACKDROP =
  'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto font-roboto';
const INPUT =
  'px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400';
const PRIMARY =
  'px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition shadow-lg';

function header(iconName, title, subtitle) {
  return `
    <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400">${icon(iconName, 'w-5 h-5')}</div>
        <div>
          <h3 class="text-lg font-bold text-white">${esc(title)}</h3>
          <p class="text-xs text-neutral-400">${esc(subtitle)}</p>
        </div>
      </div>
      <button data-act="close-modal" class="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition">
        ${icon('x', 'w-5 h-5')}
      </button>
    </div>`;
}

/** Hộp kiểm dạng công tắc dùng lại nhiều lần trong màn Cài đặt. */
function toggleRow(label, hint, checked, inputAct, accent = 'accent-amber-500') {
  return `
    <div class="p-3.5 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex items-center justify-between gap-3">
      <div>
        <span class="font-semibold text-slate-200 block">${esc(label)}</span>
        <span class="text-[11px] text-neutral-400">${esc(hint)}</span>
      </div>
      <input type="checkbox" data-input="${inputAct}" ${checked ? 'checked' : ''}
             class="w-5 h-5 rounded ${accent} shrink-0">
    </div>`;
}

/** Nút chọn dạng ô vuông có viền sáng khi đang chọn. */
function choice(act, val, active, inner, extra = '') {
  return `
    <button data-act="${act}" data-val="${esc(val)}"
            class="${extra} rounded-xl border text-left transition ${
              active
                ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700'
            }">${inner}</button>`;
}

/* ========================================================== CÀI ĐẶT ===== */

const TABS = [
  {id: 'orientation', icon: 'rotateCw', label: 'Xem Ngang & Dọc'},
  {id: 'frame', icon: 'layers', label: 'Khung & Chuyển Ảnh'},
  {id: 'widgets', icon: 'clock', label: 'Đồng Hồ & Âm Lịch'},
  {id: 'anniversaries', icon: 'heart', label: 'Ngày Kỷ Niệm'},
  {id: 'night', icon: 'moon', label: 'Chế Độ Ban Đêm'},
  {id: 'sound', icon: 'volume2', label: 'Âm Thanh Nền'},
];

function tabOrientation(s) {
  const f = s.frame;
  const card = (act, id, active, title, desc, iconName) =>
    choice(
      act,
      id,
      active,
      `<div class="flex items-center gap-2.5 text-amber-400 mb-1.5">${icon(
        iconName,
        'w-5 h-5'
      )}<span class="font-bold text-white text-sm">${esc(title)}</span></div>
       <span class="text-[11px] text-neutral-400 leading-relaxed">${esc(desc)}</span>`,
      'p-3.5 flex flex-col justify-between'
    );

  return `
    <div class="space-y-5">
      <div>
        <label class="block font-semibold text-slate-200 mb-2">Hướng đặt thiết bị (iPad / iPhone / Màn hình):</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${card('orientation', 'auto', f.orientation === 'auto', 'Tự động cảm biến', 'Tự xoay theo chiều người dùng cầm iPad', 'rotateCw')}
          ${card('orientation', 'landscape', f.orientation === 'landscape', 'Khóa Xem Ngang', 'Tối ưu khi đặt iPad trên chân đế ngang', 'monitor')}
          ${card('orientation', 'portrait', f.orientation === 'portrait', 'Khóa Xem Dọc', 'Tối ưu khi đặt iPad đứng trên bàn', 'smartphone')}
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-200 mb-2">Bố cục hiển thị ảnh thông minh:</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${card('layout', 'single', f.layoutMode === 'single', 'Ảnh đơn toàn khung', 'Một bức ảnh trung tâm với bo viền nghệ thuật', 'square')}
          ${card('layout', 'dual', f.layoutMode === 'dual', 'Ghép 2 ảnh dọc song song', 'Tự ghép 2 ảnh chân dung cạnh nhau trong 1 khung gỗ đôi', 'columns')}
          ${card('layout', 'split-smart-hub', f.layoutMode === 'split-smart-hub', 'Màn hình Smart Hub', 'Chia đôi màn hình: 1 bên ảnh, 1 bên đồng hồ & âm lịch', 'sliders')}
        </div>
      </div>

      ${toggleRow(
        'Tự động ghép ảnh dọc khi xoay ngang',
        'Màn hình nằm ngang gặp ảnh chụp đứng thì ghép với ảnh kế tiếp, không để thừa viền đen hai bên',
        f.autoSplitPortrait,
        'auto-split'
      )}

      <div>
        <label class="block font-semibold text-slate-200 mb-2">Xoay góc hiển thị cố định (khi cắm dây sạc iPad theo hướng khác nhau):</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${[
            [0, 'Mặc định (0°)'],
            [90, 'Xoay phải (90°)'],
            [180, 'Đảo ngược (180°)'],
            [270, 'Xoay trái (270°)'],
          ]
            .map(([deg, label]) =>
              choice('rotation', String(deg), f.rotation === deg, esc(label), 'py-2 px-3 text-center font-medium')
            )
            .join('')}
        </div>
      </div>
    </div>`;
}

function tabFrame(s) {
  const f = s.frame;
  return `
    <div class="space-y-5">
      <div>
        <label class="block font-semibold text-slate-200 mb-2">Thời gian đổi ảnh:</label>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          ${[
            [5, '5 giây'],
            [10, '10 giây'],
            [20, '20 giây'],
            [30, '30 giây'],
            [60, '1 phút'],
            [300, '5 phút'],
          ]
            .map(([sec, label]) =>
              choice('interval', String(sec), f.slideshowInterval === sec, esc(label), 'py-2 px-3 text-center font-medium')
            )
            .join('')}
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-200 mb-2">Hiệu ứng chuyển ảnh:</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${[
            ['ken-burns', 'Ken Burns (Điện ảnh)', 'Thu phóng chậm nhẹ nhàng'],
            ['fade', 'Mờ ảo (Crossfade)', 'Chuyển cảnh mượt mà'],
            ['slide', 'Trượt ngang', 'Lướt album tinh tế'],
            ['polaroid-stack', 'Polaroid cổ điển', 'Phong cách ảnh in liền'],
          ]
            .map(([id, label, desc]) =>
              choice(
                'transition',
                id,
                f.transition === id,
                `<span class="font-bold text-slate-100 block">${esc(label)}</span>
                 <span class="text-[10px] text-neutral-400 mt-1 block">${esc(desc)}</span>`,
                'p-3 flex flex-col justify-between'
              )
            )
            .join('')}
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-200 mb-2">Kiểu dáng khung bao quanh ảnh:</label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          ${FRAME_THEMES.map((t) =>
            choice(
              'theme',
              t.id,
              f.theme === t.id,
              `<span class="text-xl">${t.icon}</span><span>${esc(t.label)}</span>`,
              'p-3 flex items-center gap-2.5'
            )
          ).join('')}
        </div>
      </div>

      ${
        f.theme !== 'frameless'
          ? `<div class="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
               <div class="flex flex-wrap items-center justify-between gap-3">
                 <div>
                   <span class="font-semibold text-slate-200">Độ dày bo viền đệm (Matte):</span>
                   <p class="text-[11px] text-neutral-400">Tạo chiều sâu nghệ thuật như tranh lồng khung kính</p>
                 </div>
                 <div class="flex gap-1.5">
                   ${[
                     ['none', 'Không'],
                     ['thin', 'Mỏng'],
                     ['medium', 'Vừa'],
                     ['wide', 'Dày'],
                   ]
                     .map(
                       ([id, label]) => `
                     <button data-act="matte-size" data-val="${id}"
                             class="px-2.5 py-1 rounded-lg uppercase text-[10px] font-semibold border ${
                               f.matteSize === id
                                 ? 'border-amber-400 bg-amber-500 text-neutral-950'
                                 : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                             }">${label}</button>`
                     )
                     .join('')}
                 </div>
               </div>
               <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-700/40">
                 <span class="font-semibold text-slate-200">Màu viền đệm lót:</span>
                 <div class="flex gap-2">
                   ${[
                     ['white', 'Trắng tinh', '#ffffff'],
                     ['ivory', 'Trắng ngà', '#fbf7ee'],
                     ['cream', 'Kem ấm', '#f4eedb'],
                     ['charcoal', 'Than xám', '#1e2024'],
                   ]
                     .map(
                       ([id, label, color]) => `
                     <button data-act="matte-color" data-val="${id}"
                             class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                               f.matteColor === id
                                 ? 'border-amber-400 text-amber-200 font-bold'
                                 : 'border-neutral-700 text-neutral-400'
                             }">
                       <span class="w-3 h-3 rounded-full border border-neutral-500" style="background:${color}"></span>
                       <span>${label}</span>
                     </button>`
                     )
                     .join('')}
                 </div>
               </div>
             </div>`
          : ''
      }
    </div>`;
}

function tabWidgets(s) {
  const w = s.widget;
  return `
    <div class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${toggleRow('Hiện Đồng Hồ Số', 'Giờ, phút, giây cập nhật trực tiếp', w.showClock, 'w-clock')}
        ${toggleRow('Lịch Âm Việt Nam (Can Chi)', 'Mùng/ngày âm, Can Chi, Tiết khí', w.showLunarDate, 'w-lunar')}
        ${toggleRow('Thời Tiết Hiện Tại', 'Nhiệt độ & thời tiết địa phương', w.showWeather, 'w-weather')}
        ${toggleRow('Thông Tin Bức Ảnh', 'Tiêu đề, ngày chụp & địa điểm', w.showPhotoInfo, 'w-photoinfo')}
        <div class="sm:col-span-2">
          ${toggleRow('Lời Nhắn & Châm Ngôn Gia Đình', 'Hiện thông điệp yêu thương hoặc câu chúc ấm áp', w.showFamilyQuote, 'w-quote')}
        </div>
      </div>

      ${
        w.showFamilyQuote
          ? `<div class="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700/60 space-y-2">
               <label class="block font-semibold text-amber-200">Tùy chỉnh lời nhắn riêng của gia đình bạn:</label>
               <input type="text" data-input="w-customquote" value="${esc(w.customQuote)}"
                      placeholder="Ví dụ: Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc."
                      class="w-full ${INPUT}">
               <p class="text-[10px] text-neutral-400">Để trống nếu muốn hệ thống tự đổi câu châm ngôn mỗi ngày.</p>
             </div>`
          : ''
      }

      ${
        w.showWeather
          ? `<div class="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/80 space-y-3">
               ${toggleRow(
                 'Định vị GPS tự động từ trình duyệt',
                 'Tự cập nhật thời tiết theo vị trí thực tế của thiết bị',
                 w.useGPS !== false,
                 'w-gps',
                 'accent-sky-500'
               )}
               ${
                 w.useGPS !== false
                   ? `<div class="pt-2 border-t border-neutral-700/50 flex flex-wrap items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 text-xs text-neutral-300">
                          ${icon('mapPin', 'w-3.5 h-3.5 text-emerald-400')}
                          <span>Vị trí hiện tại: <strong class="text-white">${esc(
                            w.weatherCity || 'Đang lấy tọa độ GPS...'
                          )}</strong></span>
                        </div>
                        <button data-act="test-gps" ${s.isLocating ? 'disabled' : ''}
                                class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50">
                          ${icon('navigation', 'w-3.5 h-3.5')}
                          <span>${s.isLocating ? 'Đang định vị...' : '📍 Lấy lại vị trí GPS ngay'}</span>
                        </button>
                      </div>`
                   : `<div class="pt-2 border-t border-neutral-700/50 flex items-center gap-3">
                        <span class="font-semibold text-slate-200 whitespace-nowrap">Thành phố thủ công:</span>
                        <input type="text" data-input="w-city" value="${esc(w.weatherCity)}"
                               placeholder="Hà Nội / TP. Hồ Chí Minh / Đà Nẵng..."
                               class="w-full ${INPUT}">
                      </div>`
               }
               ${
                 s.gpsStatus
                   ? `<div class="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700 text-[11px] text-sky-300">${esc(
                       s.gpsStatus
                     )}</div>`
                   : ''
               }
             </div>`
          : ''
      }

      <div class="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700/60 flex flex-wrap items-center justify-between gap-3">
        <span class="font-semibold text-slate-200">Vị trí hiển thị tiện ích trên màn hình:</span>
        <div class="flex flex-wrap gap-1.5">
          ${[
            ['bottom-left', 'Góc dưới trái'],
            ['bottom-right', 'Góc dưới phải'],
            ['top-left', 'Góc trên trái'],
            ['top-right', 'Góc trên phải'],
          ]
            .map(
              ([id, label]) => `
            <button data-act="w-position" data-val="${id}"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                      w.widgetPosition === id
                        ? 'border-amber-400 bg-amber-500 text-neutral-950'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                    }">${label}</button>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
}

function tabAnniversaries(s) {
  const w = s.widget;
  return `
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <span class="font-semibold text-slate-200 block text-sm">Đếm Ngày Kỷ Niệm Gia Đình</span>
          <p class="text-neutral-400 text-xs mt-0.5">Tự đếm ngược sinh nhật con, ngày cưới, ngày họp mặt gia đình</p>
        </div>
        <input type="checkbox" data-input="w-anniv" ${w.showAnniversary ? 'checked' : ''}
               class="w-5 h-5 rounded accent-amber-500 shrink-0">
      </div>

      <div class="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700 flex flex-wrap items-center gap-2">
        <input type="text" data-input="anniv-title" value="${esc(s.annivTitle)}"
               placeholder="Tên kỷ niệm (ví dụ: Kỷ niệm ngày cưới)"
               class="${INPUT} flex-1 min-w-[200px]">
        <input type="date" data-input="anniv-date" value="${esc(s.annivDate)}" class="${INPUT}">
        <button data-act="add-anniv" class="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 flex items-center gap-1.5 transition">
          ${icon('plus', 'w-4 h-4')}<span>Thêm</span>
        </button>
      </div>

      <div class="space-y-2">
        ${(w.anniversaries || [])
          .map(
            (item) => `
          <div class="p-3 rounded-xl bg-neutral-800/30 border border-neutral-700/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-lg">${esc(item.icon || '🎉')}</span>
              <div>
                <span class="font-semibold text-slate-100 block">${esc(item.title)}</span>
                <span class="text-amber-400 text-[11px]">${esc(item.date)}</span>
              </div>
            </div>
            <button data-act="del-anniv" data-val="${esc(item.id)}"
                    class="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition">
              ${icon('trash2', 'w-4 h-4')}
            </button>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

function tabNight(s) {
  const n = s.night;
  return `
    <div class="space-y-4">
      <div class="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
        ${icon('moon', 'w-5 h-5 text-amber-400 mt-0.5')}
        <div>
          <h4 class="font-semibold text-amber-200">Chế độ Ban Đêm & Bảo Vệ Màn Hình Cũ</h4>
          <p class="text-neutral-300 text-[11px] mt-0.5 leading-relaxed">
            Tự chuyển thành đồng hồ tối giản ánh sáng dịu vào ban đêm, không chói mắt trong phòng ngủ,
            kèm Pixel-Shift chống lưu ảnh cho màn hình iPad chạy 24/7.
          </p>
        </div>
      </div>

      ${toggleRow(
        'Tự động bật Chế độ Ban Đêm theo giờ',
        `Từ ${String(n.startHour).padStart(2, '0')}:00 tối đến ${String(n.endHour).padStart(2, '0')}:00 sáng hôm sau`,
        n.enabled,
        'n-enabled'
      )}

      <div>
        <label class="block font-semibold text-slate-200 mb-2">Màu sắc đồng hồ ban đêm:</label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          ${[
            ['amber', 'Hổ phách', 'Dịu mắt nhất', '#f59e0b'],
            ['crimson', 'Đỏ thẫm', 'Không phá giấc ngủ', '#e11d48'],
            ['warm-white', 'Trắng ấm', 'Cổ điển thanh lịch', '#d6d3d1'],
            ['deep-blue', 'Xanh trăng', 'Bình yên', '#38bdf8'],
          ]
            .map(([id, label, desc, color]) =>
              choice(
                'night-color',
                id,
                n.clockColor === id,
                `<div class="flex items-center gap-2">
                   <div class="w-3.5 h-3.5 rounded-full" style="background:${color}"></div>
                   <span class="font-semibold">${esc(label)}</span>
                 </div>
                 <span class="text-[10px] text-neutral-400 mt-1 block">${esc(desc)}</span>`,
                'p-3 flex flex-col justify-between'
              )
            )
            .join('')}
        </div>
      </div>

      ${toggleRow(
        'Chống Lưu Ảnh Màn Hình (Pixel Shift)',
        'Dịch nhẹ các điểm ảnh mỗi vài phút để bảo vệ tấm nền LCD/OLED cũ',
        n.enablePixelShift,
        'n-pixelshift'
      )}
    </div>`;
}

function tabSound(s) {
  const snd = s.sound;
  return `
    <div class="space-y-4">
      <div class="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 flex items-start gap-3">
        ${icon('volume2', 'w-5 h-5 text-sky-400 mt-0.5')}
        <div>
          <h4 class="font-semibold text-sky-200">Âm Thanh Tự Nhiên Thư Giãn (Web Audio API)</h4>
          <p class="text-neutral-300 text-[11px] mt-0.5">
            Tạo âm thanh trực tiếp trong trình duyệt, không tốn dữ liệu mạng, hợp cho phòng khách hoặc góc làm việc.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        ${SOUND_OPTIONS.map(
          (o) => `
          <button data-act="sound-track" data-val="${o.id}"
                  class="p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    snd.track === o.id
                      ? 'border-sky-400 bg-sky-500/20 text-sky-200 font-bold'
                      : 'border-neutral-700 bg-neutral-800/60 text-neutral-300'
                  }">
            <span class="text-xl">${o.icon}</span><span>${esc(o.label)}</span>
          </button>`
        ).join('')}
      </div>

      ${
        snd.track !== 'off'
          ? `<div class="p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700 space-y-2">
               <div class="flex justify-between items-center text-slate-200 font-medium">
                 <span>Âm lượng âm thanh:</span>
                 <span class="font-mono text-sky-300">${Math.round(snd.volume * 100)}%</span>
               </div>
               <input type="range" min="0" max="1" step="0.05" value="${snd.volume}"
                      data-input="sound-volume"
                      class="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400">
             </div>`
          : ''
      }
    </div>`;
}

export function settingsModalHtml(s) {
  const tab = s.settingsTab;
  const body =
    tab === 'frame'
      ? tabFrame(s)
      : tab === 'widgets'
        ? tabWidgets(s)
        : tab === 'anniversaries'
          ? tabAnniversaries(s)
          : tab === 'night'
            ? tabNight(s)
            : tab === 'sound'
              ? tabSound(s)
              : tabOrientation(s);

  return `
    <div class="${BACKDROP}">
      <div class="${SHELL} max-w-3xl">
        ${header('sliders', 'Cài Đặt Khung Tranh Thông Minh', 'Tùy biến hiển thị ngang/dọc, âm lịch, hiệu ứng & âm thanh')}

        <div class="flex items-center gap-1 px-6 py-2 bg-neutral-950/60 border-b border-neutral-800 overflow-x-auto text-xs font-medium">
          ${TABS.map(
            (t) => `
            <button data-act="settings-tab" data-val="${t.id}"
                    class="px-3.5 py-2 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${
                      tab === t.id
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:bg-neutral-800'
                    }">
              ${icon(t.icon, 'w-4 h-4')}
              <span>${esc(t.label)}${
                t.id === 'anniversaries' ? ` (${s.widget.anniversaries?.length || 0})` : ''
              }</span>
            </button>`
          ).join('')}
        </div>

        <div class="p-6 overflow-y-auto flex-1 text-xs">${body}</div>

        <div class="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          ${
            s.canInstall
              ? `<button data-act="install" class="px-3 py-2 rounded-xl text-amber-300 hover:bg-neutral-800 flex items-center gap-1.5 text-xs font-medium">
                   ${icon('download', 'w-4 h-4')}<span>Cài App</span>
                 </button>`
              : '<span></span>'
          }
          <button data-act="close-modal" class="${PRIMARY}">Đóng &amp; Áp dụng</button>
        </div>
      </div>
    </div>`;
}

/* ================================================== QUẢN LÝ KHO ẢNH ===== */

export function photoManagerHtml(s) {
  const sel = s.pmAlbumId;
  const list = sel === 'all' ? s.photos : s.photos.filter((p) => p.albumId === sel);

  return `
    <div class="${BACKDROP}">
      <div class="${SHELL} max-w-4xl">
        ${header('image', 'Quản lý Kho Ảnh Gia Đình', 'Lưu trữ ngay trên thiết bị, hỗ trợ tải ảnh từ thư viện & cuộn camera')}

        <div class="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button data-act="pm-album" data-val="all"
                    class="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                      sel === 'all'
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }">Tất cả (${s.photos.length})</button>
            ${s.albums
              .map(
                (a) => `
              <button data-act="pm-album" data-val="${esc(a.id)}"
                      class="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                        sel === a.id
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                      }">
                ${icon('folder', 'w-3.5 h-3.5')}<span>${esc(a.name)}</span>
                <span class="text-[10px] opacity-75">(${
                  s.photos.filter((p) => p.albumId === a.id).length
                })</span>
              </button>`
              )
              .join('')}
            <button data-act="pm-toggle-album-form"
                    class="px-2.5 py-1.5 rounded-xl text-xs bg-neutral-800/80 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              ${icon('folderPlus', 'w-3.5 h-3.5')}<span>+ Album</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <input type="file" id="pm-file" multiple accept="image/*" class="hidden">
            <button data-act="pm-pick" ${s.pmUploading ? 'disabled' : ''}
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition active:scale-95 disabled:opacity-50">
              ${icon('upload', 'w-3.5 h-3.5')}
              <span>${s.pmUploading ? 'Đang tải lên...' : 'Tải ảnh từ iPad/Máy'}</span>
            </button>
            <button data-act="pm-toggle-url-form"
                    class="px-3 py-1.5 rounded-xl text-xs bg-neutral-800 hover:bg-neutral-700 text-slate-300 transition">
              Thêm link ảnh
            </button>
          </div>
        </div>

        ${
          s.pmShowAlbumForm
            ? `<div class="px-6 py-3 bg-amber-950/20 border-b border-amber-500/20 flex flex-wrap items-center gap-2 text-xs">
                 <span class="font-semibold text-amber-200">Tạo Album mới:</span>
                 <input type="text" data-input="pm-album-name" value="${esc(s.pmAlbumName)}"
                        placeholder="Tên Album (vd: Sinh nhật bé 2026)" class="${INPUT} flex-1 min-w-[200px]">
                 <input type="text" data-input="pm-album-desc" value="${esc(s.pmAlbumDesc)}"
                        placeholder="Mô tả ngắn gọn" class="${INPUT} flex-1 min-w-[200px]">
                 <button data-act="pm-create-album" class="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition">Lưu</button>
                 <button data-act="pm-toggle-album-form" class="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white">Hủy</button>
               </div>`
            : ''
        }

        ${
          s.pmShowUrlForm
            ? `<div class="px-6 py-3 bg-neutral-800/40 border-b border-neutral-700 flex flex-wrap items-center gap-2 text-xs">
                 <input type="url" data-input="pm-url" value="${esc(s.pmUrl)}"
                        placeholder="Dán đường dẫn ảnh (https://...)" class="${INPUT} flex-1 min-w-[240px]">
                 <input type="text" data-input="pm-url-title" value="${esc(s.pmUrlTitle)}"
                        placeholder="Tiêu đề ảnh (tùy chọn)" class="${INPUT} w-48">
                 <button data-act="pm-add-url" class="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition">Thêm</button>
                 <button data-act="pm-toggle-url-form" class="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white">Đóng</button>
               </div>`
            : ''
        }

        <div class="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          ${list
            .map(
              (photo) => `
            <div class="group relative rounded-2xl overflow-hidden bg-neutral-800/60 border border-neutral-700/60 aspect-[4/3] shadow-md flex flex-col justify-end">
              <img src="${esc(photo.url)}" alt="${esc(photo.title)}" loading="lazy"
                   class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
              <div class="relative z-10 p-2.5 text-xs text-white">
                <p class="font-semibold truncate text-amber-100">${esc(photo.title)}</p>
                <div class="flex items-center justify-between text-[11px] text-neutral-300 mt-0.5">
                  <span>${esc(photo.date || 'Kỷ niệm')}</span>
                  <span class="truncate">${esc(photo.location || '')}</span>
                </div>
              </div>
              <button data-act="pm-delete" data-val="${esc(photo.id)}"
                      class="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition shadow-lg"
                      title="Xóa ảnh này">
                ${icon('trash2', 'w-3.5 h-3.5')}
              </button>
            </div>`
            )
            .join('')}

          ${
            list.length === 0
              ? `<div class="col-span-full py-12 flex flex-col items-center justify-center text-center text-neutral-400">
                   ${icon('image', 'w-12 h-12 text-neutral-600 mb-3')}
                   <p class="font-semibold text-sm text-neutral-300">Chưa có ảnh nào trong album này</p>
                   <p class="text-xs text-neutral-500 mt-1">Bấm "Tải ảnh từ iPad/Máy" ở trên để chọn ảnh gia đình yêu thích!</p>
                 </div>`
              : ''
          }
        </div>

        <div class="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3 text-xs">
          <button data-act="pm-reset" class="flex items-center gap-1.5 text-neutral-400 hover:text-amber-300 transition">
            ${icon('refreshCw', 'w-3.5 h-3.5')}<span>Khôi phục album mẫu</span>
          </button>
          <button data-act="close-modal" class="${PRIMARY}">Hoàn tất (${s.photos.length} ảnh)</button>
        </div>
      </div>
    </div>`;
}

/* =============================================== HƯỚNG DẪN iPAD ========= */

function step(n, title, body) {
  return `
    <div class="p-5 rounded-2xl bg-neutral-800/40 border border-neutral-700/70 space-y-3">
      <div class="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
        <div class="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs shrink-0">${n}</div>
        <h4>${title}</h4>
      </div>
      ${body}
    </div>`;
}

export function kioskGuideHtml() {
  return `
    <div class="${BACKDROP}">
      <div class="${SHELL} max-w-3xl">
        ${header(
          'tv',
          'Hướng Dẫn Biến iPad/iPhone Cũ Thành Khung Tranh',
          'Tối ưu thiết bị cũ (iPad mini, iPad 2/3/4/6, iPhone 6) chạy bền bỉ 24/7'
        )}

        <div class="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-neutral-300">
          <div class="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
            ${icon('lightbulb', 'w-5 h-5 text-amber-400 mt-0.5')}
            <div class="space-y-1">
              <h4 class="font-bold text-amber-200 text-sm">Lời khuyên sử dụng:</h4>
              <p class="text-[11px] leading-relaxed text-amber-100/90">
                Ứng dụng đã tối ưu để chạy mượt trên cả máy dùng chip A8/A9/A10 cũ mà không giật lag hay nóng máy.
                Làm theo 3 bước dưới để có trải nghiệm như một khung tranh kỹ thuật số đắt tiền.
              </p>
            </div>
          </div>

          ${step(
            1,
            'Thêm vào Màn hình chính để ẩn thanh Safari',
            `<p class="leading-relaxed">Để app tràn viền toàn màn hình, không còn thanh URL hay nút điều hướng:</p>
             <ol class="list-decimal list-inside space-y-1.5 pl-2 text-neutral-200">
               <li>Mở trang này bằng <strong class="text-white">Safari</strong> trên iPad/iPhone.</li>
               <li>Bấm biểu tượng <strong class="text-amber-300">Chia sẻ (Share)</strong> ${icon(
                 'share2',
                 'w-3.5 h-3.5 text-sky-400 inline'
               )} ở góc trên hoặc dưới màn hình.</li>
               <li>Cuộn xuống chọn <strong class="text-amber-300">"Thêm vào Màn hình chính"</strong> ${icon(
                 'plusSquare',
                 'w-3.5 h-3.5 text-emerald-400 inline'
               )}.</li>
               <li>Bấm <strong class="text-white">Thêm (Add)</strong>. Giờ mở app từ icon ngoài màn hình chính như một ứng dụng độc lập.</li>
             </ol>`
          )}

          ${step(
            2,
            'Bật "Truy cập được hướng dẫn" (Guided Access)',
            `<p class="leading-relaxed">Tính năng này khóa cứng màn hình trong app — trẻ nhỏ bấm Home hay vuốt cũng không thoát ra được:</p>
             <ol class="list-decimal list-inside space-y-1.5 pl-2 text-neutral-200">
               <li>Vào <strong class="text-white">Cài đặt</strong> → <strong class="text-white">Trợ năng (Accessibility)</strong>.</li>
               <li>Chọn <strong class="text-amber-300">Truy cập được hướng dẫn</strong> và bật lên.</li>
               <li>Đặt một mật khẩu để chỉ bạn mới thoát được.</li>
               <li>Quay lại app, bấm nút <strong class="text-white">Home 3 lần</strong> (hoặc nút Nguồn 3 lần) rồi chọn <strong class="text-emerald-400">Bắt đầu</strong>.</li>
             </ol>`
          )}

          ${step(
            3,
            'Cài đặt Nguồn & Màn hình luôn sáng',
            `<ul class="space-y-2 text-neutral-200">
               <li class="flex items-start gap-2">${icon(
                 'checkCircle2',
                 'w-4 h-4 text-emerald-400 mt-0.5'
               )}<span><strong>Không khóa màn hình:</strong> Cài đặt → Màn hình &amp; Độ sáng → Tự động khóa → <em>Không bao giờ</em>.</span></li>
               <li class="flex items-start gap-2">${icon(
                 'checkCircle2',
                 'w-4 h-4 text-emerald-400 mt-0.5'
               )}<span><strong>Độ sáng:</strong> để khoảng 30–50% cho ảnh ấm như tranh in thật và đỡ hao pin.</span></li>
               <li class="flex items-start gap-2">${icon(
                 'checkCircle2',
                 'w-4 h-4 text-emerald-400 mt-0.5'
               )}<span><strong>Sạc an toàn:</strong> dùng củ sạc chính hãng. Có thể cắm qua ổ cắm thông minh tự ngắt 1–2 tiếng mỗi ngày để giữ pin máy cũ khỏe.</span></li>
             </ul>`
          )}
        </div>

        <div class="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button data-act="close-modal" class="${PRIMARY}">Đã hiểu, bắt đầu trải nghiệm!</button>
        </div>
      </div>
    </div>`;
}

/* ============================================ HƯỚNG DẪN CÀI PWA iOS ===== */

export function iosInstallHtml() {
  const line = (n, title, body) => `
    <div class="flex items-start gap-3">
      <div class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">${n}</div>
      <div>
        <span class="font-semibold text-white">${title}</span>
        <p class="text-neutral-400 mt-0.5">${body}</p>
      </div>
    </div>`;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-roboto">
      <div class="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-slate-100 space-y-4 animate-pop-in">
        <div class="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div class="flex items-center gap-2.5 text-amber-300 font-bold text-base">
            ${icon('smartphone', 'w-5 h-5 text-amber-400')}
            <h3>Cài Đặt Lên iPad / iPhone</h3>
          </div>
          <button data-act="close-modal" class="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <p class="text-xs text-neutral-300 leading-relaxed">
          Để biến iPad/iPhone thành khung tranh chuyên dụng chạy toàn màn hình không có thanh địa chỉ Safari:
        </p>

        <div class="space-y-3 text-xs bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
          ${line(
            1,
            'Bấm nút Chia sẻ:',
            `Nhấn biểu tượng ${icon('share2', 'w-3.5 h-3.5 text-sky-400 inline')} (Share) trên thanh công cụ Safari.`
          )}
          ${line(
            2,
            'Thêm vào Màn hình chính:',
            `Cuộn xuống chọn ${icon(
              'plusSquare',
              'w-3.5 h-3.5 text-emerald-400 inline'
            )} <strong>"Thêm vào Màn hình chính"</strong>.`
          )}
          ${line(
            3,
            'Mở từ Màn hình chính:',
            'Bấm <strong>Thêm</strong> ở góc trên. Khung tranh sẽ xuất hiện như một ứng dụng độc lập.'
          )}
        </div>

        <button data-act="close-modal" class="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition">
          Đã hiểu, đóng hướng dẫn
        </button>
      </div>
    </div>`;
}
