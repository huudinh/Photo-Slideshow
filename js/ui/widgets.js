/**
 * Các tiện ích nổi trên ảnh: đồng hồ, âm lịch, thời tiết, thông tin ảnh,
 * lời nhắn và đếm ngược ngày kỷ niệm. Cùng bảng tin Smart Hub bản đầy đủ.
 *
 * Phần giờ/phút/giây KHÔNG vẽ lại mỗi giây. Chúng được đánh dấu bằng
 * `data-clock-*` để app.js ghi thẳng vào textContent — vẽ lại cả khối mỗi giây
 * trên iPad cũ là nguyên nhân giật và tốn pin.
 */

import {DAYS_OF_WEEK} from '../data.js';
import {esc} from '../dom.js';
import {icon} from '../icons.js';
import {getCurrentLunarDate} from '../lunar.js';

export function clockParts(now = new Date()) {
  return {
    hm: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    s: String(now.getSeconds()).padStart(2, '0'),
    dayName: DAYS_OF_WEEK[now.getDay()],
    full: `${DAYS_OF_WEEK[now.getDay()]}, ngày ${now.getDate()} tháng ${
      now.getMonth() + 1
    }, ${now.getFullYear()}`,
    short: `${DAYS_OF_WEEK[now.getDay()]}, ${now.getDate()} tháng ${
      now.getMonth() + 1
    }, ${now.getFullYear()}`,
  };
}

/** Ngày kỷ niệm gần nhất còn ở phía trước; hết thì lấy mục đầu danh sách. */
export function nextAnniversary(widget) {
  if (!widget.showAnniversary || !widget.anniversaries || widget.anniversaries.length === 0) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items = widget.anniversaries.map((a) => {
    const target = new Date(a.date);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    return {...a, diffDays};
  });

  const upcoming = items.filter((i) => i.diffDays >= 0).sort((a, b) => a.diffDays - b.diffDays);
  return upcoming.length > 0 ? upcoming[0] : items[0];
}

function positionClasses(pos) {
  switch (pos) {
    case 'top-left':
      return 'top-4 left-4 items-start text-left';
    case 'top-right':
      return 'top-4 right-4 items-end text-right';
    case 'bottom-right':
      return 'bottom-4 right-4 items-end text-right';
    case 'bottom-left':
    default:
      return 'bottom-4 left-4 items-start text-left';
  }
}

/* ===================================================== Tiện ích nổi ===== */

export function smartWidgetsHtml(state, photo) {
  const w = state.widget;
  const t = clockParts();
  const lunar = getCurrentLunarDate();
  const weather = state.weather;
  const anniv = nextAnniversary(w);

  const clockBlock = !w.showClock
    ? ''
    : `
    <div class="backdrop-blur-md bg-black/45 border border-white/15 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex flex-col gap-1 drop-shadow-lg">
      ${
        w.clockType === 'digital'
          ? `<div class="flex items-baseline gap-2">
               <span data-clock-hm class="text-4xl md:text-5xl font-light tracking-tight font-serif-luxury drop-shadow-md text-amber-100/95">${t.hm}</span>
               <span data-clock-s class="text-sm font-light text-amber-200/70">${t.s}</span>
             </div>`
          : ''
      }
      ${
        w.clockType === 'minimal'
          ? `<div data-clock-hm class="text-3xl md:text-4xl font-extralight tracking-widest text-white/90">${t.hm}</div>`
          : ''
      }
      <div class="text-xs md:text-sm font-medium text-slate-200/90 flex items-center gap-1.5 mt-0.5">
        ${icon('calendar', 'w-3.5 h-3.5 text-amber-400')}
        <span data-clock-date>${esc(t.full)}</span>
      </div>
      ${
        w.showLunarDate
          ? `<div class="text-xs md:text-sm font-medium text-amber-300/95 flex items-center gap-1.5">
               ${icon('sparkles', 'w-3.5 h-3.5 text-amber-300')}
               <span>Âm lịch: <strong class="font-semibold text-amber-200">${esc(
                 lunar.formattedString
               )}</strong>${
                 lunar.solarTerm ? ` <span class="ml-1 opacity-80">(${esc(lunar.solarTerm)})</span>` : ''
               }</span>
             </div>`
          : ''
      }
      ${
        w.showWeather
          ? `<div class="flex items-center gap-2 text-xs text-slate-300 mt-1 pt-1 border-t border-white/10">
               ${icon('cloudSun', 'w-3.5 h-3.5 text-sky-300')}
               <span class="flex items-center gap-1 font-medium text-white">
                 ${w.useGPS !== false ? icon('navigation', 'w-2.5 h-2.5 text-emerald-400') : ''}
                 ${esc(weather?.cityName || w.weatherCity || 'Hà Nội')}
               </span>
               <span class="font-bold text-sky-200">${weather?.temperature ?? 28}°C</span>
               <span class="text-sky-200/80 truncate">· ${esc(
                 weather?.condition || 'Nắng nhẹ & mát mẻ'
               )}</span>
             </div>`
          : ''
      }
    </div>`;

  const photoBlock =
    !w.showPhotoInfo || !photo
      ? ''
      : `
    <div class="backdrop-blur-md bg-black/40 border border-white/15 text-white px-4 py-2.5 rounded-xl shadow-xl max-w-sm">
      <h4 class="text-sm md:text-base font-semibold text-amber-100 truncate">${esc(photo.title)}</h4>
      <div class="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
        ${
          photo.date
            ? `<span class="flex items-center gap-1">${icon(
                'clock',
                'w-3 h-3 text-amber-400/80'
              )}${esc(photo.date)}</span>`
            : ''
        }
        ${
          photo.location
            ? `<span class="flex items-center gap-1 truncate">${icon(
                'mapPin',
                'w-3 h-3 text-rose-400'
              )}${esc(photo.location)}</span>`
            : ''
        }
      </div>
      ${
        photo.notes
          ? `<p class="text-xs italic text-slate-300/85 mt-1 border-l-2 border-amber-400/40 pl-2">"${esc(
              photo.notes
            )}"</p>`
          : ''
      }
    </div>`;

  const quoteBlock = !w.showFamilyQuote
    ? ''
    : `
    <div class="backdrop-blur-md bg-black/35 border border-white/10 text-white px-4 py-2 rounded-xl shadow-lg max-w-sm flex items-start gap-2">
      ${icon('heart', 'w-4 h-4 text-rose-400 mt-0.5')}
      <p class="text-xs md:text-sm font-light italic text-amber-100/90 leading-relaxed font-serif-luxury">
        "${esc(w.customQuote || state.currentQuote)}"
      </p>
    </div>`;

  const annivBlock = !anniv
    ? ''
    : `
    <div class="backdrop-blur-md bg-amber-950/60 border border-amber-500/30 text-white px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5">
      <div class="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
        ${esc(anniv.icon || '🎉')}
      </div>
      <div class="text-xs">
        <span class="font-semibold text-amber-200 block">${esc(anniv.title)}</span>
        <span class="text-amber-300/80">${
          anniv.diffDays === 0
            ? '🌟 Hôm nay là ngày kỷ niệm!'
            : anniv.diffDays > 0
              ? `Còn ${anniv.diffDays} ngày nữa (${esc(anniv.date)})`
              : `Đã qua ${Math.abs(anniv.diffDays)} ngày`
        }</span>
      </div>
    </div>`;

  return `
    <div class="absolute z-20 pointer-events-none flex flex-col gap-3 max-w-[90vw] md:max-w-md transition-all duration-500 ${positionClasses(
      w.widgetPosition
    )}" style="opacity: ${w.overlayOpacity}">
      ${clockBlock}${photoBlock}${quoteBlock}${annivBlock}
    </div>`;
}

/* ================================================= Bảng tin Smart Hub ==== */

export function smartHubHtml(state) {
  const w = state.widget;
  const t = clockParts();
  const lunar = getCurrentLunarDate();
  const weather = state.weather;

  return `
    <div class="flex flex-col justify-between h-full space-y-6 text-white font-roboto">

      <div class="border-b border-white/10 pb-5">
        <div class="flex items-baseline gap-3">
          <span data-clock-hm class="text-6xl md:text-7xl font-light font-roboto-slab tracking-tight text-amber-200 drop-shadow-lg">${t.hm}</span>
          <span data-clock-s class="text-xl font-normal text-amber-400/80 font-mono">${t.s}</span>
        </div>
        <div class="text-base text-slate-200 mt-1 flex items-center gap-2">
          ${icon('calendar', 'w-4 h-4 text-amber-400')}
          <span data-clock-date>${esc(t.short)}</span>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/25 space-y-2">
        <div class="flex items-center justify-between text-xs text-amber-300 font-bold uppercase tracking-wider">
          <span class="flex items-center gap-1.5">${icon(
            'sparkles',
            'w-4 h-4 text-amber-400'
          )} Lịch Âm Việt Nam</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-normal">${esc(
            lunar.solarTerm || 'Tiết Khí'
          )}</span>
        </div>
        <div class="text-xl font-bold text-amber-100 font-roboto-slab">${esc(
          lunar.formattedString
        )}</div>
        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs text-amber-200/80">
          <div><span class="opacity-70">Ngày Can Chi:</span> <strong class="text-white">${esc(
            lunar.canChiDay
          )}</strong></div>
          <div><span class="opacity-70">Tháng Can Chi:</span> <strong class="text-white">${esc(
            lunar.canChiMonth
          )}</strong></div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/25 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-sky-500/20 text-sky-300">${icon('cloudSun', 'w-6 h-6')}</div>
          <div>
            <div class="text-xs text-sky-300 font-medium flex items-center gap-1">
              ${w.useGPS !== false ? icon('navigation', 'w-2.5 h-2.5 text-emerald-400') : ''}
              ${esc(weather?.cityName || w.weatherCity || 'Hà Nội')}
            </div>
            <div class="text-2xl font-bold text-white">${weather?.temperature ?? 28}°C</div>
          </div>
        </div>
        <div class="text-right text-xs text-sky-200/80">
          <p>${esc(weather?.condition || 'Nắng nhẹ & thoáng mát')}</p>
          <p class="text-[11px] opacity-75 mt-0.5">Độ ẩm: ${weather?.humidity ?? 65}% · Gió: ${
            weather?.windSpeed ?? 12
          } km/h</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-neutral-800/60 border border-white/10 space-y-2">
        <div class="flex items-center gap-2 text-rose-400 text-xs font-bold">
          ${icon('heart', 'w-4 h-4')}<span>Thông Điệp Yêu Thương</span>
        </div>
        <p class="text-xs md:text-sm italic text-amber-100/90 leading-relaxed font-roboto-slab">
          "${esc(w.customQuote || state.currentQuote)}"
        </p>
      </div>

    </div>`;
}

/* ================================================ Lớp phủ ban đêm ======== */

function nightColors(clockColor) {
  switch (clockColor) {
    case 'crimson':
      return {
        glow: 'text-rose-600 drop-shadow-[0_0_20px_rgba(225,29,72,0.3)]',
        sub: 'text-rose-700/80',
        accent: 'text-rose-500',
      };
    case 'deep-blue':
      return {
        glow: 'text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]',
        sub: 'text-sky-600/80',
        accent: 'text-sky-300',
      };
    case 'warm-white':
      return {
        glow: 'text-stone-300 drop-shadow-[0_0_20px_rgba(214,211,209,0.25)]',
        sub: 'text-stone-500',
        accent: 'text-stone-400',
      };
    case 'amber':
    default:
      return {
        glow: 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        sub: 'text-amber-600/80',
        accent: 'text-amber-400',
      };
  }
}

export function nightOverlayHtml(state) {
  const n = state.night;
  const c = nightColors(n.clockColor);
  const t = clockParts();
  const lunar = getCurrentLunarDate();

  return `
    <div data-act="exit-night"
         class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-700"
         style="opacity: ${Math.max(0.4, 1 - n.dimLevel * 0.5)}">
      <div class="flex flex-col items-center text-center p-8 ${
        n.enablePixelShift ? 'animate-pixel-shift' : ''
      }">
        <div class="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-neutral-900/60 border border-neutral-800 text-xs">
          ${icon('moon', `w-3.5 h-3.5 ${c.accent}`)}
          <span class="${c.sub}">Chế độ Ban Đêm dịu mắt</span>
        </div>

        <div class="flex items-baseline justify-center gap-3">
          <span data-clock-hm class="text-7xl md:text-9xl font-extralight tracking-tight font-serif-luxury ${
            c.glow
          }">${t.hm}</span>
          <span data-clock-s class="text-xl md:text-2xl font-light ${c.sub}">${t.s}</span>
        </div>

        <div class="mt-4 flex flex-col items-center gap-1.5">
          <div data-clock-date class="text-base md:text-lg font-light tracking-wide ${c.sub}">${esc(
            t.short
          )}</div>
          <div class="text-xs md:text-sm font-light flex items-center gap-1.5 ${c.accent}">
            ${icon('sparkles', 'w-3 h-3')}
            <span>Âm lịch: ${esc(lunar.formattedString)}</span>
          </div>
        </div>

        <div class="mt-12 text-xs text-neutral-600">
          <span>Chạm vào bất kỳ đâu để trở lại album ảnh</span>
        </div>
      </div>
    </div>`;
}
