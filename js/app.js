/**
 * Lắp ráp toàn bộ ứng dụng — thay cho App.tsx.
 *
 * Ba việc chính:
 *  1. Chia màn hình thành năm vùng, mỗi vùng chỉ vẽ lại khi "chữ ký" của nó
 *     đổi. Nếu vẽ lại tất cả mỗi lần state đổi thì thẻ <img> bị tạo lại, ảnh
 *     tải lại từ đầu và nháy trắng — lỗi dễ mắc nhất khi bỏ React.
 *  2. Nhận mọi cú bấm qua một bộ uỷ quyền sự kiện duy nhất (bảng ACTIONS).
 *  3. Chạy các bộ đếm: đổi ảnh, đồng hồ, kiểm tra giờ ban đêm, tải thời tiết.
 */

import {$, createRegion, delegate} from './dom.js';
import {store} from './store.js';
import {soundEngine} from './sound.js';
import {wakeLockManager} from './wake-lock.js';
import {weatherService} from './weather.js';
import {photoFrameHtml} from './ui/photo-frame.js';
import {clockParts, nightOverlayHtml, smartWidgetsHtml} from './ui/widgets.js';
import {controlBarHtml, offlineIndicatorHtml} from './ui/control-bar.js';
import {
  iosInstallHtml,
  kioskGuideHtml,
  photoManagerHtml,
  settingsModalHtml,
} from './ui/modals.js';

const root = $('#app');

/* ===================================================== Các vùng vẽ ====== */

/**
 * Chữ ký của một vùng là chuỗi gộp đúng những giá trị vùng đó dùng. Đổi chữ ký
 * mới vẽ lại. Cố tình KHÔNG đưa giây vào chữ ký nào — đồng hồ được cập nhật
 * bằng cách ghi thẳng textContent ở hàm tickClock().
 */
const regions = {
  frame: createRegion($('#region-frame'), (s) => {
    const photo = store.currentPhoto;
    const next = store.nextPhoto;
    return {
      sig: [
        photo?.id,
        next?.id,
        s.kenBurnsIndex,
        s.isDevicePortrait,
        JSON.stringify(s.frame),
        // Bố cục Smart Hub nhúng bảng tin vào trong khung nên phụ thuộc thêm:
        s.frame.layoutMode === 'split-smart-hub'
          ? JSON.stringify(s.widget) + s.currentQuote + JSON.stringify(s.weather)
          : '',
      ].join('|'),
      html: photo ? photoFrameHtml(s, photo, next, s.kenBurnsIndex) : '',
    };
  }),

  widgets: createRegion($('#region-widgets'), (s) => {
    const photo = store.currentPhoto;
    const show = !s.isNightModeActive && s.frame.layoutMode !== 'split-smart-hub';
    return {
      sig: [
        show,
        photo?.id,
        s.currentQuote,
        JSON.stringify(s.widget),
        JSON.stringify(s.weather),
        // Ngày đổi thì âm lịch và số ngày đếm ngược đổi theo.
        new Date().toDateString(),
      ].join('|'),
      html: show ? smartWidgetsHtml(s, photo) : '',
    };
  }),

  controls: createRegion($('#region-controls'), (s) => {
    const total = store.albumPhotos.length;
    return {
      sig: [
        s.isNightModeActive,
        s.controlsVisible,
        s.openMenu,
        s.isPlaying,
        s.currentIndex,
        total,
        s.activeAlbumId,
        s.albums.length,
        s.isFullscreen,
        s.isWakeLockActive,
        s.canInstall,
        s.isOnline,
        s.frame.theme,
        s.frame.shuffle,
        s.frame.orientation,
        s.frame.rotation,
        s.frame.layoutMode,
        s.sound.track,
        s.sound.volume,
      ].join('|'),
      html: s.isNightModeActive
        ? offlineIndicatorHtml(s)
        : controlBarHtml(s, total) + offlineIndicatorHtml(s),
    };
  }),

  night: createRegion($('#region-night'), (s) => ({
    sig: [s.isNightModeActive, JSON.stringify(s.night), new Date().toDateString()].join('|'),
    html: s.isNightModeActive ? nightOverlayHtml(s) : '',
  })),

  modal: createRegion($('#region-modal'), (s) => {
    let html = '';
    if (s.openModal === 'settings') html = settingsModalHtml(s);
    else if (s.openModal === 'photos') html = photoManagerHtml(s);
    else if (s.openModal === 'kiosk') html = kioskGuideHtml();
    else if (s.openModal === 'ios-install') html = iosInstallHtml();

    return {
      sig: [
        s.openModal,
        s.settingsTab,
        JSON.stringify(s.frame),
        JSON.stringify(s.widget),
        JSON.stringify(s.night),
        JSON.stringify(s.sound),
        s.gpsStatus,
        s.isLocating,
        s.annivTitle,
        s.annivDate,
        s.pmAlbumId,
        s.pmUploading,
        s.pmShowAlbumForm,
        s.pmShowUrlForm,
        s.photos.length,
        s.albums.length,
        s.canInstall,
      ].join('|'),
      html,
    };
  }),
};

function render() {
  const s = store.state;
  Object.values(regions).forEach((r) => r.render(s));
}

store.subscribe(render);

/* ======================================================= Đồng hồ ======== */

/**
 * Cập nhật giờ mỗi giây bằng cách ghi thẳng vào text, không vẽ lại DOM.
 * Có thể có nhiều chỗ hiện giờ cùng lúc (tiện ích nổi, Smart Hub, ban đêm).
 */
function tickClock() {
  const t = clockParts();
  document.querySelectorAll('[data-clock-hm]').forEach((el) => (el.textContent = t.hm));
  document.querySelectorAll('[data-clock-s]').forEach((el) => (el.textContent = t.s));

  // Qua ngày mới thì âm lịch và ngày tháng phải vẽ lại — chữ ký có toDateString
  // nên chỉ cần gọi render(), nó tự nhận ra.
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 2) render();
}

/* ====================================================== Thời tiết ======= */

async function refreshWeather() {
  const w = store.state.widget;
  if (!w.showWeather && store.state.frame.layoutMode !== 'split-smart-hub') return;
  const data =
    w.useGPS !== false
      ? await weatherService.fetchWeatherByGPS()
      : await weatherService.fetchWeatherByCityName(w.weatherCity || 'Hà Nội');
  store.set({weather: data});
}

/* =================================================== Chế độ ban đêm ===== */

function checkNightSchedule() {
  const n = store.state.night;
  if (!n.enabled) return;

  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = n.startHour * 60 + n.startMinute;
  const end = n.endHour * 60 + n.endMinute;

  // Khoảng giờ vắt qua nửa đêm (ví dụ 22:00 → 06:00) phải xét thành hai đoạn.
  const isNight = start > end ? cur >= start || cur < end : cur >= start && cur < end;

  if (isNight !== store.state.isNightModeActive) store.set({isNightModeActive: isNight});
}

/* ================================================== Trình chiếu ========= */

let slideTimer = null;

function restartSlideshow() {
  clearInterval(slideTimer);
  const s = store.state;
  if (!s.isPlaying || s.isNightModeActive || store.albumPhotos.length === 0) return;
  const ms = (s.frame.slideshowInterval || 15) * 1000;
  slideTimer = setInterval(goNext, ms);
}

function goNext() {
  store.set({kenBurnsIndex: (store.state.kenBurnsIndex % 3) + 1});
  store.next();
}

function goPrev() {
  store.set({kenBurnsIndex: (store.state.kenBurnsIndex % 3) + 1});
  store.prev();
}

/* ==================================================== Toàn màn hình ===== */

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    const p = document.documentElement.requestFullscreen?.();
    if (p && p.catch) p.catch(() => store.set({isFullscreen: true}));
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

/* ================================================= Thanh điều khiển ===== */

let hideTimer = null;

function showControls() {
  clearTimeout(hideTimer);
  if (!store.state.controlsVisible) store.set({controlsVisible: true});
  // Menu đang mở thì không tự ẩn, nếu không người dùng đang chọn sẽ bị mất menu.
  if (store.state.openMenu || store.state.openModal) return;
  hideTimer = setTimeout(() => store.set({controlsVisible: false}), 4500);
}

/* ======================================================= Tải ảnh ======== */

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleFiles(files) {
  if (!files || files.length === 0) return;
  store.set({pmUploading: true});

  const s = store.state;
  const albumId = s.pmAlbumId === 'all' ? s.albums[0]?.id || 'family-moments' : s.pmAlbumId;
  const items = [];

  for (const file of files) {
    try {
      const base64 = await readFileAsDataURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      items.push({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        url: base64,
        title: title || 'Kỷ niệm gia đình',
        date: new Date().toLocaleDateString('vi-VN'),
        location: 'Kho ảnh thiết bị',
        albumId,
        notes: '',
      });
    } catch (err) {
      console.error('Không đọc được file ảnh:', err);
    }
  }

  if (items.length > 0) await store.addPhotos(items);
  store.set({pmUploading: false});
}

/* ======================================================= Hành động ====== */

const ACTIONS = {
  /* --- Trình chiếu --- */
  play: () => {
    store.set({isPlaying: !store.state.isPlaying});
    restartSlideshow();
  },
  next: () => {
    goNext();
    restartSlideshow();
  },
  prev: () => {
    goPrev();
    restartSlideshow();
  },
  shuffle: () => store.setSettings('frame', {shuffle: !store.state.frame.shuffle}),

  /* --- Menu trên thanh điều khiển --- */
  menu: (val) => store.set({openMenu: store.state.openMenu === val ? null : val}),
  'close-menu': () => store.set({openMenu: null}),

  /* --- Khung và bố cục --- */
  theme: (val) => {
    store.setSettings('frame', {theme: val});
    store.set({openMenu: null});
  },
  layout: (val) => {
    store.setSettings('frame', {layoutMode: val});
    store.set({openMenu: null});
  },
  orientation: (val) => {
    store.setSettings('frame', {orientation: val});
    store.set({openMenu: null});
  },
  rotate: () => {
    store.setSettings('frame', {rotation: (store.state.frame.rotation + 90) % 360});
    store.set({openMenu: null});
  },
  rotation: (val) => store.setSettings('frame', {rotation: Number(val)}),
  interval: (val) => {
    store.setSettings('frame', {slideshowInterval: Number(val)});
    restartSlideshow();
  },
  transition: (val) => store.setSettings('frame', {transition: val}),
  'matte-size': (val) => store.setSettings('frame', {matteSize: val}),
  'matte-color': (val) => store.setSettings('frame', {matteColor: val}),

  /* --- Album --- */
  album: (val) => {
    store.selectAlbum(val);
    store.set({openMenu: null});
  },

  /* --- Âm thanh --- */
  'sound-track': (val) => store.setSettings('sound', {track: val}),
  'sound-volume': (val) => store.setSettings('sound', {volume: parseFloat(val)}),

  /* --- Ban đêm --- */
  night: () => store.set({isNightModeActive: true}),
  'exit-night': () => store.set({isNightModeActive: false}),
  'night-color': (val) => store.setSettings('night', {clockColor: val}),

  /* --- Hệ thống --- */
  fullscreen: toggleFullscreen,
  'wake-lock': async () => {
    if (store.state.isWakeLockActive) {
      wakeLockManager.releaseWakeLock();
      store.set({isWakeLockActive: false});
    } else {
      store.set({isWakeLockActive: await wakeLockManager.requestWakeLock()});
    }
  },
  install: async () => {
    const prompt = window.__deferredInstallPrompt;
    if (prompt) {
      await prompt.prompt();
      const {outcome} = await prompt.userChoice;
      if (outcome === 'accepted') {
        window.__deferredInstallPrompt = null;
        store.set({canInstall: false});
      }
    } else {
      store.set({openModal: 'ios-install'});
    }
  },

  /* --- Hộp thoại --- */
  modal: (val) => store.set({openModal: val, openMenu: null, controlsVisible: true}),
  'close-modal': () => {
    store.set({openModal: null, gpsStatus: null});
    showControls();
  },
  'settings-tab': (val) => store.set({settingsTab: val}),

  /* --- Ngày kỷ niệm --- */
  'add-anniv': () => {
    const {annivTitle, annivDate, widget} = store.state;
    if (!annivTitle.trim() || !annivDate) return;
    store.setSettings('widget', {
      anniversaries: [
        ...(widget.anniversaries || []),
        {id: `anniv-${Date.now()}`, title: annivTitle.trim(), date: annivDate, icon: '🎉'},
      ],
    });
    store.set({annivTitle: '', annivDate: ''});
  },
  'del-anniv': (val) =>
    store.setSettings('widget', {
      anniversaries: store.state.widget.anniversaries.filter((a) => a.id !== val),
    }),

  /* --- Vị trí tiện ích --- */
  'w-position': (val) => store.setSettings('widget', {widgetPosition: val}),

  /* --- GPS --- */
  'test-gps': async () => {
    store.set({isLocating: true, gpsStatus: 'Đang yêu cầu tọa độ GPS từ trình duyệt...'});
    try {
      const data = await weatherService.fetchWeatherByGPS();
      store.set({
        weather: data,
        gpsStatus: `✅ Đã định vị: ${data.cityName} (${data.temperature}°C, ${data.condition})`,
      });
      store.setSettings('widget', {useGPS: true, weatherCity: data.cityName});
    } catch (err) {
      store.set({
        gpsStatus: `❌ Lỗi: ${
          err.message || 'Không lấy được GPS. Hãy cho phép quyền vị trí trong trình duyệt'
        }`,
      });
    } finally {
      store.set({isLocating: false});
    }
  },

  /* --- Quản lý ảnh --- */
  'pm-album': (val) => store.set({pmAlbumId: val}),
  'pm-toggle-album-form': () => store.set({pmShowAlbumForm: !store.state.pmShowAlbumForm}),
  'pm-toggle-url-form': () => store.set({pmShowUrlForm: !store.state.pmShowUrlForm}),
  'pm-pick': () => $('#pm-file')?.click(),
  'pm-create-album': async () => {
    const {pmAlbumName, pmAlbumDesc} = store.state;
    if (!pmAlbumName.trim()) return;
    await store.createAlbum(pmAlbumName.trim(), pmAlbumDesc.trim() || 'Album gia đình');
    store.set({pmAlbumName: '', pmAlbumDesc: '', pmShowAlbumForm: false});
  },
  'pm-add-url': async () => {
    const {pmUrl, pmUrlTitle, pmAlbumId, albums} = store.state;
    if (!pmUrl.trim()) return;
    await store.addPhotos([
      {
        id: `url-${Date.now()}`,
        url: pmUrl.trim(),
        title: pmUrlTitle.trim() || 'Ảnh kỷ niệm mới',
        date: new Date().toLocaleDateString('vi-VN'),
        location: 'Ảnh trực tuyến',
        albumId: pmAlbumId === 'all' ? albums[0]?.id || 'family-moments' : pmAlbumId,
      },
    ]);
    store.set({pmUrl: '', pmUrlTitle: '', pmShowUrlForm: false});
  },
  'pm-delete': (val) => store.deletePhoto(val),
  'pm-reset': () => store.resetDefaultPhotos(),

  /* --- Ô nhập (gắn qua data-input) --- */
  'w-clock': (v) => store.setSettings('widget', {showClock: v}),
  'w-lunar': (v) => store.setSettings('widget', {showLunarDate: v}),
  'w-weather': (v) => store.setSettings('widget', {showWeather: v}),
  'w-photoinfo': (v) => store.setSettings('widget', {showPhotoInfo: v}),
  'w-quote': (v) => store.setSettings('widget', {showFamilyQuote: v}),
  'w-anniv': (v) => store.setSettings('widget', {showAnniversary: v}),
  'w-gps': (v) => {
    store.setSettings('widget', {useGPS: v});
    refreshWeather();
  },
  'w-city': (v) => store.setSettings('widget', {weatherCity: v}),
  'w-customquote': (v) => store.setSettings('widget', {customQuote: v}),
  'n-enabled': (v) => store.setSettings('night', {enabled: v}),
  'n-pixelshift': (v) => store.setSettings('night', {enablePixelShift: v}),
  'auto-split': (v) => store.setSettings('frame', {autoSplitPortrait: v}),
  'anniv-title': (v) => (store.state.annivTitle = v),
  'anniv-date': (v) => (store.state.annivDate = v),
  'pm-album-name': (v) => (store.state.pmAlbumName = v),
  'pm-album-desc': (v) => (store.state.pmAlbumDesc = v),
  'pm-url': (v) => (store.state.pmUrl = v),
  'pm-url-title': (v) => (store.state.pmUrlTitle = v),
};

/*
 * Mấy ô nhập văn bản ở trên ghi THẲNG vào store.state mà không gọi notify():
 * gọi notify() sẽ vẽ lại hộp thoại ngay giữa lúc đang gõ, con trỏ nhảy về đầu
 * ô. Giá trị chỉ cần đúng lúc bấm nút Lưu/Thêm nên không cần vẽ lại.
 */

delegate(document.body, ACTIONS);

/* =================================================== Sự kiện hệ thống === */

function setupEvents() {
  // Chọn file ảnh (input nằm trong hộp thoại nên bắt nổi bọt ở body).
  document.body.addEventListener('change', (ev) => {
    if (ev.target.id === 'pm-file') {
      handleFiles(Array.from(ev.target.files || []));
      ev.target.value = '';
    }
  });

  // Xoay máy / đổi cỡ cửa sổ.
  const onResize = () => store.set({isDevicePortrait: window.innerHeight > window.innerWidth});
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // Hiện lại thanh điều khiển khi có thao tác.
  ['mousemove', 'touchstart', 'keydown'].forEach((evt) =>
    window.addEventListener(evt, showControls, {passive: true})
  );

  // Vuốt ngang để chuyển ảnh trên iPad.
  let touchStartX = null;
  document.addEventListener(
    'touchstart',
    (ev) => {
      if (ev.target.closest('[data-act], [data-input], input, button')) return;
      touchStartX = ev.touches[0].clientX;
    },
    {passive: true}
  );
  document.addEventListener(
    'touchend',
    (ev) => {
      if (touchStartX === null) return;
      const diff = ev.changedTouches[0].clientX - touchStartX;
      if (diff > 60) goPrev();
      else if (diff < -60) goNext();
      touchStartX = null;
      if (Math.abs(diff) > 60) restartSlideshow();
    },
    {passive: true}
  );

  // Phím tắt.
  window.addEventListener('keydown', (ev) => {
    if (store.state.openModal) {
      if (ev.key === 'Escape') ACTIONS['close-modal']();
      return;
    }
    const k = ev.key.toLowerCase();
    if (ev.key === 'ArrowRight' || ev.key === ' ') {
      ev.preventDefault();
      ACTIONS.next();
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      ACTIONS.prev();
    } else if (k === 'f') {
      toggleFullscreen();
    } else if (k === 'n') {
      store.set({isNightModeActive: !store.state.isNightModeActive});
    } else if (k === 'o') {
      const cur = store.state.frame.orientation;
      const nextOrient = cur === 'auto' ? 'landscape' : cur === 'landscape' ? 'portrait' : 'auto';
      store.setSettings('frame', {orientation: nextOrient});
    } else if (k === 'r') {
      ACTIONS.rotate();
    }
  });

  document.addEventListener('fullscreenchange', () =>
    store.set({isFullscreen: !!document.fullscreenElement})
  );

  window.addEventListener('online', () => store.set({isOnline: true}));
  window.addEventListener('offline', () => store.set({isOnline: false}));

  // Cài đặt PWA.
  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    window.__deferredInstallPrompt = ev;
    store.set({canInstall: true});
  });
  window.addEventListener('appinstalled', () => {
    window.__deferredInstallPrompt = null;
    store.set({canInstall: false});
  });

  // iOS Safari không bắn beforeinstallprompt — vẫn cho hiện nút để mở hướng dẫn
  // thủ công, trừ khi app đã chạy ở chế độ độc lập trên màn hình chính.
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (store.state.isIOS && !standalone) store.set({canInstall: true});
}

/* ========================================= Đồng bộ âm thanh theo state == */

let lastSoundKey = '';

store.subscribe((s) => {
  const key = s.isNightModeActive ? 'off|0' : `${s.sound.track}|${s.sound.volume}`;
  if (key === lastSoundKey) return;
  lastSoundKey = key;

  if (s.isNightModeActive) soundEngine.stop();
  else soundEngine.play(s.sound.track, s.sound.volume);
});

/* ============================ Khởi động lại bộ đếm khi cấu hình đổi ===== */

let lastSlideKey = '';

store.subscribe((s) => {
  const key = [s.isPlaying, s.isNightModeActive, s.frame.slideshowInterval].join('|');
  if (key === lastSlideKey) return;
  lastSlideKey = key;
  restartSlideshow();
});

/* ====================================================== Khởi động ======= */

async function init() {
  render();
  setupEvents();

  // Giữ sáng màn hình. Trên iOS cũ phải có một cú chạm trước nên thử lại sau
  // thao tác đầu tiên.
  store.set({isWakeLockActive: await wakeLockManager.requestWakeLock()});
  const retryWakeLock = async () => {
    store.set({isWakeLockActive: await wakeLockManager.requestWakeLock()});
  };
  window.addEventListener('click', retryWakeLock, {once: true});
  window.addEventListener('touchstart', retryWakeLock, {once: true});

  await store.loadSavedData();
  store.clampIndex();

  checkNightSchedule();
  restartSlideshow();
  showControls();
  refreshWeather();

  setInterval(tickClock, 1000);
  setInterval(checkNightSchedule, 30000);
  setInterval(refreshWeather, 15 * 60 * 1000);

  // Service worker: chỉ đăng ký khi chạy qua http/https, mở bằng file:// thì bỏ.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* không có SW cũng không sao, app vẫn chạy */
    });
  }
}

init();
