/** Khung tranh: vân khung, bo viền đệm và cách xếp ảnh theo bố cục. */

import {cls, esc, escUrl} from '../dom.js';
import {smartHubHtml} from './widgets.js';

/** Lớp vân khung + độ dày viền gỗ theo kiểu khung đang chọn. */
function frameThemeClass(theme) {
  switch (theme) {
    case 'oak-wood':
      return 'frame-oak-wood p-3 md:p-6 lg:p-7 rounded-lg';
    case 'dark-walnut':
      return 'frame-dark-walnut p-3 md:p-6 lg:p-7 rounded-lg';
    case 'nordic-white':
      return 'frame-nordic-white p-3 md:p-5 lg:p-6 rounded-sm shadow-2xl';
    case 'gallery-black':
      return 'frame-gallery-black p-3 md:p-6 lg:p-7 rounded-none border border-neutral-800';
    case 'vintage-gold':
      return 'frame-vintage-gold p-4 md:p-6 lg:p-8 rounded-xl';
    case 'polaroid':
      return 'frame-polaroid p-3 pb-12 md:p-5 md:pb-14 rounded-sm shadow-2xl';
    case 'frameless':
    default:
      return 'p-0';
  }
}

/** Lớp bo viền đệm (matte / passe-partout) bên trong khung. */
function matteClass(frame) {
  if (frame.theme === 'frameless' || frame.matteSize === 'none') return 'p-0';

  let size = 'p-2 md:p-3.5';
  if (frame.matteSize === 'thin') size = 'p-1.5 md:p-2.5';
  if (frame.matteSize === 'wide') size = 'p-3 md:p-6 lg:p-8';

  let color = 'matte-white';
  if (frame.matteColor === 'ivory') color = 'matte-ivory';
  if (frame.matteColor === 'cream') color = 'matte-cream';
  if (frame.matteColor === 'charcoal') color = 'matte-charcoal';

  return `${size} ${color} rounded-sm shadow-inner transition-all duration-300`;
}

/**
 * Hiệu ứng ảnh. Ken Burns xoay vòng 3 kiểu chuyển động để hai ảnh liên tiếp
 * không trôi giống hệt nhau.
 */
function imageAnimClass(frame, kenBurnsIndex) {
  if (frame.transition === 'ken-burns') return `animate-ken-burns-${kenBurnsIndex}`;
  return 'transition-transform duration-700';
}

/** Hướng hiển thị thực tế: người dùng khóa cứng, hoặc theo cảm biến. */
export function isEffectivePortrait(state) {
  if (state.frame.orientation === 'portrait') return true;
  if (state.frame.orientation === 'landscape') return false;
  return state.isDevicePortrait;
}

export function photoFrameHtml(state, photo, nextPhoto, kenBurnsIndex) {
  const {frame} = state;
  const portrait = isEffectivePortrait(state);
  const animClass = imageAnimClass(frame, kenBurnsIndex);
  const themeCls = frameThemeClass(frame.theme);
  const matteCls = matteClass(frame);

  // Ghép đôi: người dùng chọn thẳng, hoặc màn ngang gặp ảnh dọc và đang bật
  // tự ghép — để không thừa hai dải đen hai bên.
  const isDual =
    frame.layoutMode === 'dual' ||
    (!portrait && frame.autoSplitPortrait && photo.aspectRatio && photo.aspectRatio < 1 && nextPhoto);

  const rotationStyle = frame.rotation
    ? `transform: rotate(${frame.rotation}deg); transition: transform 0.5s ease-in-out;`
    : 'transition: transform 0.5s ease-in-out;';

  const sizeWrap = frame.theme !== 'frameless' ? 'max-w-[96vw] max-h-[96vh] m-auto' : '';

  let body;

  if (frame.layoutMode === 'split-smart-hub' && !portrait) {
    /* --- Chia đôi: ảnh bên trái, bảng tin bên phải --- */
    body = `
      <div class="relative z-10 w-full h-full p-4 md:p-8 flex flex-row items-center gap-6 max-w-7xl mx-auto">
        <div class="w-1/2 h-full flex items-center justify-center">
          <div class="w-full h-full max-h-[88vh] flex items-center justify-center ${themeCls}">
            <div class="w-full h-full flex items-center justify-center overflow-hidden ${matteCls}">
              <div class="relative w-full h-full overflow-hidden flex items-center justify-center bg-black rounded-sm shadow-inner">
                <img src="${esc(photo.url)}" alt="${esc(photo.title)}"
                     class="w-full h-full object-cover animate-photo-in ${animClass}" loading="eager">
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <p class="font-medium text-sm text-amber-100 truncate">${esc(photo.title)}</p>
                  <p class="text-xs text-neutral-300">${esc(photo.date || '')} ${
                    photo.location ? '· ' + esc(photo.location) : ''
                  }</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-1/2 h-full flex items-center justify-center">
          <div class="w-full max-h-[88vh] bg-neutral-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
            ${smartHubHtml(state)}
          </div>
        </div>
      </div>`;
  } else if (isDual && nextPhoto) {
    /* --- Ghép hai ảnh dọc song song trong cùng một khung --- */
    const cell = (p) => `
      <div class="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-black rounded-sm shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
        <div class="relative w-full h-full overflow-hidden flex items-center justify-center">
          <img src="${esc(p.url)}" alt="${esc(p.title)}"
               class="w-full h-full object-contain animate-photo-in ${animClass}" loading="eager">
        </div>
        ${
          frame.theme === 'polaroid'
            ? `<div class="w-full py-2 bg-white text-center font-script text-neutral-800 text-sm md:text-base">${esc(
                p.title
              )}</div>`
            : ''
        }
      </div>`;

    body = `
      <div class="relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 ${sizeWrap}">
        <div class="w-full h-full flex items-center justify-center ${themeCls}">
          <div class="w-full h-full flex items-center justify-center overflow-hidden ${matteCls}">
            <div class="w-full h-full grid grid-cols-2 gap-4 md:gap-6 p-2 md:p-4">
              ${cell(photo)}
              ${cell(nextPhoto)}
            </div>
          </div>
        </div>
      </div>`;
  } else {
    /* --- Một ảnh toàn khung --- */
    const bevel =
      frame.hasInnerBevel && frame.theme !== 'frameless'
        ? 'shadow-[inset_0_3px_10px_rgba(0,0,0,0.6)] rounded-sm'
        : '';

    body = `
      <div class="relative z-10 w-full h-full flex items-center justify-center transition-all duration-500 ${sizeWrap}">
        <div class="w-full h-full flex items-center justify-center transition-all duration-500 ${themeCls}">
          <div class="w-full h-full flex items-center justify-center overflow-hidden ${matteCls}">
            <div class="${cls(
              'relative w-full h-full overflow-hidden flex items-center justify-center bg-black',
              bevel
            )}">
              <div class="relative w-full h-full overflow-hidden flex items-center justify-center">
                <img src="${esc(photo.url)}" alt="${esc(photo.title || 'Ảnh gia đình')}"
                     class="w-full h-full object-contain animate-photo-in ${animClass} will-change-transform pointer-events-none"
                     loading="eager">
              </div>
              ${
                frame.theme === 'polaroid'
                  ? `<div class="absolute bottom-2 left-0 right-0 text-center font-script text-neutral-800 text-xl md:text-2xl drop-shadow-sm select-none">
                       ${esc(photo.title || 'Khoảnh khắc kỷ niệm')} ${
                         photo.date ? '· ' + esc(photo.date) : ''
                       }
                     </div>`
                  : ''
              }
            </div>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="relative w-full h-full flex items-center justify-center overflow-hidden select-none bg-neutral-950 font-roboto"
         style="${rotationStyle}" data-swipe>
      <!-- Nền mờ lấy chính bức ảnh, lấp hai dải trống khi tỷ lệ ảnh lệch khung -->
      <div class="absolute inset-0 bg-cover bg-center blur-3xl opacity-35 scale-125 pointer-events-none transition-all duration-1000"
           style="background-image: url('${escUrl(photo.url)}')"></div>
      ${body}
    </div>`;
}
