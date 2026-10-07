/**
 * Thanh điều khiển nổi ở đáy màn hình, tự ẩn sau 4,5 giây không thao tác.
 *
 * Mỗi nút chỉ khai `data-act`; phần xử lý nằm tập trung ở js/app.js. Các menu
 * bật lên (album, khung, âm thanh, hướng xem) dùng chung một ô trạng thái
 * `state.openMenu` để mở cái này là tự đóng cái kia.
 */

import {esc} from '../dom.js';
import {FRAME_THEMES, SOUND_OPTIONS} from '../data.js';
import {icon} from '../icons.js';

const BTN = 'p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-white';
const MENU =
  'absolute bottom-full mb-3 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 text-xs';

function albumMenu(state, totalPhotos) {
  const item = (id, label, active) => `
    <button data-act="album" data-val="${esc(id)}"
            class="flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
              active ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'hover:bg-white/10 text-slate-300'
            }">
      <span class="truncate">${esc(label)}</span>
    </button>`;

  return `
    <div class="${MENU} left-0 w-56">
      <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">Bộ sưu tập ảnh</div>
      ${item('all', `Tất cả ảnh (${totalPhotos})`, state.activeAlbumId === 'all')}
      ${state.albums.map((a) => item(a.id, a.name, state.activeAlbumId === a.id)).join('')}
    </div>`;
}

function themeMenu(state) {
  return `
    <div class="${MENU} left-1/2 -translate-x-1/2 w-56">
      <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">Kiểu dáng Khung Tranh</div>
      ${FRAME_THEMES.map(
        (t) => `
        <button data-act="theme" data-val="${t.id}"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  state.frame.theme === t.id
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'hover:bg-white/10 text-slate-300'
                }">
          <span class="text-base">${t.icon}</span><span>${esc(t.label)}</span>
        </button>`
      ).join('')}
    </div>`;
}

function soundMenu(state) {
  const {track, volume} = state.sound;
  return `
    <div class="${MENU} left-1/2 -translate-x-1/2 w-64 p-3 gap-2">
      <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
        <span>Âm thanh thư giãn</span><span class="text-sky-300 font-normal">Offline WebAudio</span>
      </div>
      <div class="flex flex-col gap-1">
        ${SOUND_OPTIONS.map(
          (o) => `
          <button data-act="sound-track" data-val="${o.id}"
                  class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition ${
                    track === o.id
                      ? 'bg-sky-500/25 text-sky-200 font-semibold'
                      : 'hover:bg-white/10 text-slate-300'
                  }">
            <span>${o.icon}</span><span class="truncate">${esc(o.label)}</span>
          </button>`
        ).join('')}
      </div>
      ${
        track !== 'off'
          ? `<div class="mt-1 pt-2 border-t border-white/10 flex items-center gap-2 px-1">
               ${icon('volume2', 'w-3.5 h-3.5 text-sky-400')}
               <input type="range" min="0" max="1" step="0.05" value="${volume}"
                      data-input="sound-volume"
                      class="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400">
               <span class="text-[10px] text-slate-400 font-mono w-7 text-right">${Math.round(
                 volume * 100
               )}%</span>
             </div>`
          : ''
      }
    </div>`;
}

function orientationMenu(state) {
  const {orientation, rotation, layoutMode} = state.frame;

  const modeBtn = (id, iconName, label) => `
    <button data-act="orientation" data-val="${id}"
            class="p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
              orientation === id
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }">
      ${icon(iconName, 'w-3.5 h-3.5')}<span class="text-[10px]">${label}</span>
    </button>`;

  const layoutBtn = (id, iconName, label) => `
    <button data-act="layout" data-val="${id}"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition ${
              layoutMode === id
                ? 'bg-amber-500/25 text-amber-300 font-semibold'
                : 'hover:bg-white/10 text-slate-300'
            }">
      ${icon(iconName, 'w-3.5 h-3.5')}<span>${label}</span>
    </button>`;

  return `
    <div class="${MENU} left-1/2 -translate-x-1/2 w-64 p-3 gap-2.5">
      <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
        <span>Hướng Xem Ngang &amp; Dọc</span>
        ${rotation !== 0 ? `<span class="text-amber-400">Xoay ${rotation}°</span>` : ''}
      </div>

      <div class="grid grid-cols-3 gap-1.5">
        ${modeBtn('auto', 'rotateCw', 'Tự động')}
        ${modeBtn('landscape', 'monitor', 'Xem Ngang')}
        ${modeBtn('portrait', 'smartphone', 'Xem Dọc')}
      </div>

      <div class="pt-2 border-t border-white/10 space-y-1">
        <span class="text-[10px] uppercase font-semibold text-slate-400 px-1 block">Bố cục hiển thị:</span>
        ${layoutBtn('single', 'square', 'Ảnh đơn toàn khung')}
        ${layoutBtn('dual', 'columns', 'Ghép 2 ảnh dọc song song')}
        ${layoutBtn('split-smart-hub', 'sliders', 'Màn hình Smart Hub (Ảnh + Lịch/Giờ)')}
      </div>

      <div class="pt-2 border-t border-white/10">
        <button data-act="rotate"
                class="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-amber-200 rounded-xl flex items-center justify-center gap-1.5 transition text-xs">
          ${icon('rotateCw', 'w-3.5 h-3.5')}<span>Xoay màn hình (+90°)</span>
        </button>
      </div>
    </div>`;
}

export function controlBarHtml(state, totalPhotos) {
  const {frame, sound, openMenu, controlsVisible} = state;
  const activeAlbum =
    state.activeAlbumId === 'all'
      ? 'Tất cả'
      : state.albums.find((a) => a.id === state.activeAlbumId)?.name || 'Album';

  const orientIcon =
    frame.orientation === 'landscape'
      ? 'monitor'
      : frame.orientation === 'portrait'
        ? 'smartphone'
        : 'rotateCw';

  return `
    ${
      openMenu
        ? '<div data-act="close-menu" class="fixed inset-0 z-30 bg-transparent"></div>'
        : ''
    }
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform font-roboto ${
      controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
    }">
      <div class="flex items-center gap-1.5 md:gap-2 px-3 py-2 bg-neutral-900/85 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-slate-200">

        <div class="relative">
          <button data-act="menu" data-val="album"
                  class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-xl transition text-amber-200"
                  title="Chọn Album ảnh">
            ${icon('folderOpen', 'w-3.5 h-3.5')}
            <span class="hidden sm:inline max-w-[85px] truncate">${esc(activeAlbum)}</span>
            <span class="text-white/60 text-[11px] font-mono">(${
              totalPhotos > 0 ? `${state.currentIndex + 1}/${totalPhotos}` : '0'
            })</span>
          </button>
          ${openMenu === 'album' ? albumMenu(state, totalPhotos) : ''}
        </div>

        <div class="h-5 w-px bg-white/15 mx-0.5"></div>

        <button data-act="prev" class="${BTN}" title="Ảnh trước (mũi tên trái)">
          ${icon('skipBack', 'w-4 h-4')}
        </button>

        <button data-act="play"
                class="p-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl shadow-lg transition active:scale-95"
                title="${state.isPlaying ? 'Tạm dừng trình chiếu' : 'Tiếp tục trình chiếu'}">
          ${
            state.isPlaying
              ? icon('pause', 'w-4 h-4')
              : icon('play', 'w-4 h-4', 'fill="currentColor"')
          }
        </button>

        <button data-act="next" class="${BTN}" title="Ảnh tiếp theo (mũi tên phải)">
          ${icon('skipForward', 'w-4 h-4')}
        </button>

        <button data-act="shuffle"
                class="p-2 rounded-xl transition ${
                  frame.shuffle ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-white/15 text-slate-400'
                }"
                title="${frame.shuffle ? 'Trình chiếu ngẫu nhiên (đang bật)' : 'Trình chiếu theo thứ tự'}">
          ${icon('shuffle', 'w-4 h-4')}
        </button>

        <div class="h-5 w-px bg-white/15 mx-0.5"></div>

        <div class="relative">
          <button data-act="menu" data-val="orientation"
                  class="p-2 rounded-xl transition flex items-center gap-1 ${
                    frame.orientation !== 'auto' || frame.rotation !== 0
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'hover:bg-white/15 text-slate-300'
                  }"
                  title="Tùy chọn xem ngang / dọc và bố cục">
            ${icon(orientIcon, 'w-4 h-4')}
          </button>
          ${openMenu === 'orientation' ? orientationMenu(state) : ''}
        </div>

        <div class="relative">
          <button data-act="menu" data-val="theme"
                  class="p-2 rounded-xl transition ${
                    openMenu === 'theme' ? 'bg-white/20 text-white' : 'hover:bg-white/15 text-slate-300'
                  }"
                  title="Thay đổi kiểu khung tranh">
            ${icon('layers', 'w-4 h-4')}
          </button>
          ${openMenu === 'theme' ? themeMenu(state) : ''}
        </div>

        <div class="relative">
          <button data-act="menu" data-val="sound"
                  class="p-2 rounded-xl transition ${
                    sound.track !== 'off'
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'hover:bg-white/15 text-slate-300'
                  }"
                  title="Âm thanh thư giãn tự nhiên">
            ${sound.track !== 'off' ? icon('volume2', 'w-4 h-4') : icon('volumeX', 'w-4 h-4')}
          </button>
          ${openMenu === 'sound' ? soundMenu(state) : ''}
        </div>

        <button data-act="night" class="p-2 hover:bg-white/15 rounded-xl transition text-slate-300 hover:text-amber-300"
                title="Bật chế độ ban đêm">
          ${icon('moon', 'w-4 h-4')}
        </button>

        <button data-act="modal" data-val="photos" class="${BTN}" title="Quản lý và tải thêm ảnh">
          ${icon('image', 'w-4 h-4')}
        </button>

        <button data-act="modal" data-val="settings" class="${BTN}" title="Cài đặt đồng hồ, âm lịch, hiệu ứng">
          ${icon('sliders', 'w-4 h-4')}
        </button>

        <button data-act="modal" data-val="kiosk"
                class="p-2 hover:bg-white/15 rounded-xl transition text-amber-400/90 hover:text-amber-300"
                title="Hướng dẫn biến iPad cũ thành khung tranh">
          ${icon('helpCircle', 'w-4 h-4')}
        </button>

        ${
          state.canInstall
            ? `<button data-act="install"
                       class="p-2 hover:bg-white/15 rounded-xl transition text-amber-300 hover:text-amber-200 flex items-center gap-1.5 text-xs font-medium"
                       title="Cài đặt Khung Tranh (PWA)">
                 ${icon('download', 'w-4 h-4')}<span class="hidden sm:inline">Cài App</span>
               </button>`
            : ''
        }

        <button data-act="wake-lock"
                class="p-2 rounded-xl transition ${
                  state.isWakeLockActive
                    ? 'text-emerald-400 hover:bg-emerald-500/15'
                    : 'text-slate-500 hover:bg-white/10'
                }"
                title="${
                  state.isWakeLockActive
                    ? 'Màn hình luôn sáng (đang bật)'
                    : 'Chạm để giữ sáng màn hình liên tục'
                }">
          ${icon('shieldCheck', 'w-4 h-4')}
        </button>

        <button data-act="fullscreen" class="${BTN}"
                title="${state.isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}">
          ${state.isFullscreen ? icon('minimize', 'w-4 h-4') : icon('maximize', 'w-4 h-4')}
        </button>

      </div>
    </div>`;
}

/** Dải báo mất mạng ở góc trên bên phải. */
export function offlineIndicatorHtml(state) {
  if (state.isOnline) return '';
  return `
    <div class="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md border border-amber-400/30 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xl">
      ${icon('wifiOff', 'w-3.5 h-3.5 text-amber-200')}
      <span>Đang chạy ngoại tuyến (Offline PWA)</span>
    </div>`;
}
