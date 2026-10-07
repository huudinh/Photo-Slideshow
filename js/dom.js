/**
 * Vài hàm nhỏ thay cho JSX.
 *
 * Giao diện được dựng bằng chuỗi HTML rồi gán vào innerHTML, còn sự kiện bắt
 * bằng UỶ QUYỀN (event delegation) ở thẻ gốc: mỗi nút chỉ cần thuộc tính
 * `data-act="tên-hành-động"` (kèm `data-val` nếu cần tham số). Nhờ vậy vẽ lại
 * một vùng không làm mất listener nào, và không phải gỡ listener thủ công.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Thoát ký tự cho nội dung do người dùng nhập (tên ảnh, lời nhắn, tên album).
 * Dữ liệu này đi thẳng vào innerHTML nên không thoát là dính lỗi hiển thị —
 * chỉ cần một dấu `<` trong tên file ảnh là vỡ cả khối.
 */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Thoát riêng cho giá trị nằm trong url(...) của thuộc tính style. */
export function escUrl(value) {
  return String(value || '').replace(/["'\\\n\r]/g, '');
}

/** Nối class có điều kiện: cls('a', cond && 'b') -> "a b" */
export function cls(...parts) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Gắn bộ uỷ quyền sự kiện lên một thẻ gốc.
 * @param {HTMLElement} root
 * @param {Record<string, (val: string, ev: Event, el: HTMLElement) => void>} actions
 */
export function delegate(root, actions) {
  root.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el || !root.contains(el)) return;
    const fn = actions[el.dataset.act];
    if (!fn) return;
    ev.preventDefault();
    fn(el.dataset.val, ev, el);
  });

  // input/change dùng cho ô nhập, thanh trượt và hộp kiểm.
  const onInput = (ev) => {
    const el = ev.target.closest('[data-input]');
    if (!el || !root.contains(el)) return;
    const fn = actions[el.dataset.input];
    if (!fn) return;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    fn(value, ev, el);
  };
  root.addEventListener('input', onInput);
  root.addEventListener('change', onInput);
}

/**
 * Vẽ lại một vùng CHỈ KHI chữ ký của nó đổi.
 *
 * Đây là thứ thay cho cơ chế so sánh của React: không có nó thì đồng hồ nhảy
 * mỗi giây sẽ kéo theo vẽ lại cả khung ảnh, làm ảnh tải lại và nháy liên tục.
 */
export function createRegion(el, build) {
  let lastSig = null;
  return {
    el,
    render(state) {
      const {sig, html} = build(state);
      if (sig === lastSig) return false;
      lastSig = sig;
      el.innerHTML = html;
      return true;
    },
    /** Buộc vẽ lại ở lần gọi sau, dùng khi nội dung phụ thuộc thứ ngoài state. */
    invalidate() {
      lastSig = null;
    },
  };
}
