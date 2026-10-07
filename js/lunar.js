/**
 * Thuật toán tính Âm Lịch Việt Nam chính xác (Múi giờ GMT+7)
 * Dựa trên thuật toán chuyển đổi Dương Lịch sang Âm Lịch của Hồ Ngọc Đức
 */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const TIET_KHI = [
  'Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng',
  'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ',
  'Thu phân', 'Hàn lộ', 'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết',
  'Đông chí', 'Tiểu hàn', 'Đại hàn', 'Lập xuân', 'Vũ thủy', 'Kinh trập'
];

function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function getNewMoonDay(k, timeZone) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  const C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  const C2 = -0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  const C3 = -0.0004 * Math.sin(3 * dr * Mpr);
  const C4 = 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
  const C5 = -0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  const C6 = -0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  const C7 = 0.001 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  const deltaJd = C1 + C2 + C3 + C4 + C5 + C6 + C7;
  const Jd = Jd1 + deltaJd;
  return Math.floor(Jd + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn, timeZone) {
  const T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6);
}

function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

export function convertSolar2Lunar(dd, mm, yy, timeZone = 7) {
  const currentJd = jdFromDate(dd, mm, yy);
  const k = Math.floor((currentJd - 2415021.0769986) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > currentJd) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear = yy;
  if (a11 >= monthStart) {
    lunarYear = yy - 1;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = currentJd - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  let isLeapMonth = false;

  if (b11 - a11 > 365) {
    const leapMonthDiff = Math.floor((b11 - a11) / 29.5);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeapMonth = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  // Can Chi Year
  const canY = CAN[(lunarYear + 6) % 10];
  const chiY = CHI[(lunarYear + 8) % 12];
  const canChiYear = `${canY} ${chiY}`;

  // Can Chi Day
  const canD = CAN[(currentJd + 9) % 10];
  const chiD = CHI[(currentJd + 1) % 12];
  const canChiDay = `${canD} ${chiD}`;

  // Can Chi Month
  const canM = CAN[(lunarYear * 12 + lunarMonth + 3) % 10];
  const chiM = CHI[(lunarMonth + 1) % 12];
  const canChiMonth = `${canM} ${chiM}`;

  // Solar Term
  const sunLong = getSunLongitude(currentJd, timeZone);
  const solarTerm = TIET_KHI[sunLong] || '';

  const dayPrefix = lunarDay === 1 ? 'Mùng 1' : lunarDay < 10 ? `Mùng ${lunarDay}` : `${lunarDay}`;
  const leapText = isLeapMonth ? ' (Nhuận)' : '';
  const formattedString = `${dayPrefix} tháng ${lunarMonth}${leapText}, năm ${canChiYear}`;
  const shortString = `${lunarDay}/${lunarMonth} ÂL`;

  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeapMonth,
    canChiYear,
    canChiMonth,
    canChiDay,
    solarTerm,
    formattedString,
    shortString
  };
}

export function getCurrentLunarDate() {
  const now = new Date();
  return convertSolar2Lunar(now.getDate(), now.getMonth() + 1, now.getFullYear(), 7);
}
