export type FrameTheme = 
  | 'oak-wood'       // Gỗ sồi tự nhiên
  | 'dark-walnut'    // Gỗ óc chó cao cấp
  | 'nordic-white'   // Bo viền trắng Bắc Âu
  | 'gallery-black'  // Khung đen triển lãm nghệ thuật
  | 'vintage-gold'   // Khung viền mạ vàng cổ điển
  | 'polaroid'       // Phong cách ảnh Polaroid chụp liền
  | 'frameless';      // Tràn viền điện ảnh không khung

export type TransitionType = 
  | 'ken-burns'      // Thu phóng chậm điện ảnh
  | 'fade'           // Mờ dần mềm mại
  | 'slide'          // Trượt ngang nhẹ nhàng
  | 'polaroid-stack' // Xếp ảnh Polaroid cổ điển
  | 'zoom';          // Phóng to nhẹ

export type OrientationMode = 'auto' | 'landscape' | 'portrait';
export type ScreenRotation = 0 | 90 | 180 | 270;
export type LayoutMode = 'single' | 'dual' | 'split-smart-hub';

export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  date?: string;
  location?: string;
  albumId: string;
  aspectRatio?: number; // width / height, < 1 is portrait, >= 1 is landscape
  notes?: string;
}

export interface PhotoAlbum {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  isCustom?: boolean;
}

export interface AnniversaryItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  icon?: string;
}

export interface WidgetSettings {
  showClock: boolean;
  clockType: 'digital' | 'analog' | 'minimal';
  showLunarDate: boolean;
  showWeather: boolean;
  useGPS: boolean; // Tự động lấy vị trí và thời tiết theo GPS trình duyệt
  weatherCity: string;
  showPhotoInfo: boolean;
  showFamilyQuote: boolean;
  customQuote: string;
  showAnniversary: boolean;
  anniversaries: AnniversaryItem[];
  widgetPosition: 'bottom-left' | 'top-left' | 'top-right' | 'bottom-right' | 'sidebar';
  widgetSize: 'sm' | 'md' | 'lg';
  overlayOpacity: number; // 0.1 to 1.0
}

export interface NightModeSettings {
  enabled: boolean;
  startHour: number; // e.g. 22
  startMinute: number;
  endHour: number;   // e.g. 6
  endMinute: number;
  dimLevel: number;  // 0.05 to 0.5
  clockColor: 'amber' | 'crimson' | 'warm-white' | 'deep-blue';
  enablePixelShift: boolean; // Anti burn-in for older iPad LCDs
}

export interface FrameSettings {
  theme: FrameTheme;
  matteSize: 'none' | 'thin' | 'medium' | 'wide';
  matteColor: 'white' | 'ivory' | 'charcoal' | 'cream';
  hasInnerBevel: boolean;
  hasDropShadow: boolean;
  slideshowInterval: number; // in seconds, e.g., 8, 15, 30, 60
  transition: TransitionType;
  shuffle: boolean;
  autoSplitPortrait: boolean; // Auto combine 2 portrait photos side-by-side on landscape iPad
  orientation: OrientationMode; // 'auto' | 'landscape' | 'portrait'
  rotation: ScreenRotation; // 0 | 90 | 180 | 270
  layoutMode: LayoutMode; // 'single' | 'dual' | 'split-smart-hub'
}

export type SoundTrackType = 'off' | 'rain' | 'ocean' | 'fireplace' | 'windchime' | 'birds' | 'lofi-piano';

export interface SoundSettings {
  track: SoundTrackType;
  volume: number; // 0.0 to 1.0
}
