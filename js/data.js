/** Album và ảnh mẫu dựng sẵn, cùng kho câu châm ngôn gia đình. */

export const DEFAULT_ALBUMS = [
  {
    id: 'family-moments',
    name: 'Gia Đình Sum Vầy',
    description: 'Khoảnh khắc ấm cúng bên ông bà, cha mẹ và những bữa cơm gia đình',
    coverUrl:
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'children-smiles',
    name: 'Tuổi Thơ Rực Rỡ',
    description: 'Nụ cười hồn nhiên, bước chân chập chững và từng cột mốc lớn khôn của các con',
    coverUrl:
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'travel-memories',
    name: 'Kỳ Nghỉ Đáng Nhớ',
    description: 'Những chuyến đi dã ngoại, ngắm biển, leo núi cùng nhau khám phá thế giới',
    coverUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'vietnam-scenery',
    name: 'Việt Nam Quê Hương Tôi',
    description: 'Cảnh sắc thanh bình: mùa vàng Tây Bắc, phố cổ Hội An, hoàng hôn vịnh Hạ Long',
    coverUrl:
      'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
  },
];

export const DEFAULT_PHOTOS = [
  {
    id: 'p-1',
    albumId: 'family-moments',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1600&auto=format&fit=crop',
    title: 'Cả nhà quây quần bên hiên nhà',
    date: 'Tết 2026',
    location: 'Quê Ngoại',
    aspectRatio: 1.5,
    notes: 'Bữa cơm trưa đầu năm ngập tràn tiếng cười của ba thế hệ.',
  },
  {
    id: 'p-2',
    albumId: 'children-smiles',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1600&auto=format&fit=crop',
    title: 'Nụ cười rạng rỡ của con gái',
    date: 'Mùa thu 2025',
    location: 'Công viên Thống Nhất',
    aspectRatio: 1.44,
    notes: 'Ngày đầu tiên con tự chạy xe đạp không cần bánh phụ.',
  },
  {
    id: 'p-3',
    albumId: 'vietnam-scenery',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop',
    title: 'Hoàng hôn Vịnh Hạ Long',
    date: 'Tháng 7/2025',
    location: 'Quảng Ninh, Việt Nam',
    aspectRatio: 1.5,
    notes: 'Con thuyền lướt nhẹ giữa ngàn đảo đá kỳ vĩ trong ánh chiều tà.',
  },
  {
    id: 'p-4',
    albumId: 'family-moments',
    url: 'https://images.unsplash.com/photo-1476234251651-f353703a034d?q=80&w=1600&auto=format&fit=crop',
    title: 'Hai chị em đọc sách buổi chiều',
    date: 'Tháng 4/2025',
    location: 'Đà Lạt mộng mơ',
    aspectRatio: 0.67,
    notes: 'Nắng chiều xuyên qua đồi cỏ, hai chị em cùng nhau đọc hết cuốn truyện.',
  },
  {
    id: 'p-5',
    albumId: 'travel-memories',
    url: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?q=80&w=1600&auto=format&fit=crop',
    title: 'Sóng biển và cát trắng Phú Quốc',
    date: 'Hè 2025',
    location: 'Bãi Sao, Phú Quốc',
    aspectRatio: 0.77,
    notes: 'Những ngày thảnh thơi cùng gia đình xây lâu đài cát.',
  },
  {
    id: 'p-6',
    albumId: 'children-smiles',
    url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=1600&auto=format&fit=crop',
    title: 'Ánh mắt hồn nhiên tuổi thơ',
    date: 'Tháng 4/2025',
    location: 'Trang trại Mộc Châu',
    aspectRatio: 1.5,
    notes: 'Con luôn là người bạn đồng hành thân thiết nhất của em.',
  },
  {
    id: 'p-7',
    albumId: 'vietnam-scenery',
    url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1600&auto=format&fit=crop',
    title: 'Cầu Vàng trên đỉnh Bà Nà',
    date: 'Tháng 5/2025',
    location: 'Đà Nẵng',
    aspectRatio: 1.6,
    notes: 'Cây cầu nằm gọn trong đôi bàn tay đá, lơ lửng giữa biển mây.',
  },
  {
    id: 'p-8',
    albumId: 'family-moments',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1600&auto=format&fit=crop',
    title: 'Gia đình là tất cả',
    date: 'Mỗi ngày',
    location: 'Ngôi nhà ấm áp',
    aspectRatio: 1.5,
    notes: 'Nơi bão dừng sau cánh cửa.',
  },
];

export const FAMILY_QUOTES = [
  'Gia đình là nơi cuộc sống bắt đầu và tình yêu không bao giờ kết thúc.',
  'Nhà không chỉ là nơi để về, nhà là nơi trái tim luôn cảm thấy bình yên.',
  'Hạnh phúc giản đơn là bữa cơm sum vầy có đủ đầy các thành viên.',
  'Mỗi bức ảnh là một chiếc vé quay về khoảnh khắc tươi đẹp của yêu thương.',
  'Cảm ơn vì chúng ta luôn là một gia đình, cùng nhau sẻ chia mọi buồn vui.',
  'Con cái là món quà vô giá nhất mà cuộc đời trao tặng cho cha mẹ.',
  'Nụ cười của người thân yêu là ánh mặt trời xua tan mọi mệt mỏi.',
  'Đi thật xa để trở về, và nhận ra không đâu ấm áp bằng mái ấm gia đình.',
  'Thời gian trôi đi, kỷ niệm ở lại trong từng ánh mắt và nụ cười.',
  'Yêu thương trao đi là yêu thương còn mãi mãi.',
];

export function getRandomQuote() {
  return FAMILY_QUOTES[Math.floor(Math.random() * FAMILY_QUOTES.length)];
}

/* ------------------------------- Danh mục lựa chọn dùng chung cho giao diện */

export const FRAME_THEMES = [
  {id: 'oak-wood', label: 'Gỗ sồi ấm áp', icon: '🪵'},
  {id: 'dark-walnut', label: 'Gỗ óc chó sang trọng', icon: '🌲'},
  {id: 'nordic-white', label: 'Bo viền trắng Bắc Âu', icon: '⚪'},
  {id: 'gallery-black', label: 'Khung đen nghệ thuật', icon: '🖤'},
  {id: 'vintage-gold', label: 'Khung vàng cổ điển', icon: '👑'},
  {id: 'polaroid', label: 'Phong cách Polaroid', icon: '📸'},
  {id: 'frameless', label: 'Tràn viền điện ảnh', icon: '🪟'},
];

export const SOUND_OPTIONS = [
  {id: 'off', label: 'Tắt âm thanh', icon: '🔇'},
  {id: 'rain', label: 'Tiếng mưa rơi mái hiên', icon: '🌧️'},
  {id: 'ocean', label: 'Sóng biển êm đềm', icon: '🌊'},
  {id: 'fireplace', label: 'Lửa sưởi ấm cúng', icon: '🔥'},
  {id: 'windchime', label: 'Chuông gió tĩnh tâm', icon: '🎐'},
  {id: 'birds', label: 'Tiếng chim rừng sớm mai', icon: '🐦'},
  {id: 'lofi-piano', label: 'Giai điệu Lofi Piano', icon: '🎹'},
];

export const DAYS_OF_WEEK = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];
