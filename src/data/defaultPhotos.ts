import { PhotoAlbum, PhotoItem } from '../types';

export const DEFAULT_ALBUMS: PhotoAlbum[] = [
  {
    id: 'family-moments',
    name: 'Gia Đình Sum Vầy',
    description: 'Khoảnh khắc ấm cúng bên ông bà, cha mẹ và những bữa cơm gia đình',
    coverUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'children-smiles',
    name: 'Tuổi Thơ Rực Rỡ',
    description: 'Nụ cười hồn nhiên, bước chân chập chững và từng cột mốc lớn khôn của các con',
    coverUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'travel-memories',
    name: 'Kỳ Nghỉ Đáng Nhớ',
    description: 'Những chuyến đi dã ngoại, ngắm biển, leo núi cùng nhau khám phá thế giới',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'vietnam-scenery',
    name: 'Việt Nam Quê Hương Tôi',
    description: 'Cảnh sắc thanh bình: mùa vàng Tây Bắc, phố cổ Hội An, hoàng hôn vịnh Hạ Long',
    coverUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop'
  }
];

export const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'p-1',
    albumId: 'family-moments',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1600&auto=format&fit=crop',
    title: 'Cả nhà quây quần bên hiên nhà',
    date: 'Tết 2026',
    location: 'Quê Ngoại',
    aspectRatio: 1.5,
    notes: 'Bữa cơm trưa đầu năm ngập tràn tiếng cười của ba thế hệ.'
  },
  {
    id: 'p-2',
    albumId: 'children-smiles',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1600&auto=format&fit=crop',
    title: 'Nụ cười rạng rỡ của con gái',
    date: 'Mùa thu 2025',
    location: 'Công viên Thống Nhất',
    aspectRatio: 0.67, // Dọc (Portrait)
    notes: 'Ngày đầu tiên con tự chạy xe đạp không cần bánh phụ.'
  },
  {
    id: 'p-3',
    albumId: 'vietnam-scenery',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600&auto=format&fit=crop',
    title: 'Hoàng hôn Vịnh Hạ Long',
    date: 'Tháng 7/2025',
    location: 'Quảng Ninh, Việt Nam',
    aspectRatio: 1.5, // Ngang (Landscape)
    notes: 'Con thuyền lướt nhẹ giữa ngàn đảo đá kỳ vĩ trong ánh chiều tà.'
  },
  {
    id: 'p-4',
    albumId: 'family-moments',
    url: 'https://images.unsplash.com/photo-1542037104857-ffbc0b91c487?q=80&w=1600&auto=format&fit=crop',
    title: 'Khoảnh khắc ba mẹ bên con',
    date: 'Kỷ niệm ngày cưới',
    location: 'Đà Lạt mộng mơ',
    aspectRatio: 0.75, // Dọc (Portrait)
    notes: 'Không gian yên bình giữa rừng thông ngát hương.'
  },
  {
    id: 'p-5',
    albumId: 'travel-memories',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
    title: 'Sóng biển và cát trắng Phú Quốc',
    date: 'Hè 2025',
    location: 'Bãi Sao, Phú Quốc',
    aspectRatio: 1.77, // Ngang (Landscape)
    notes: 'Những ngày thảnh thơi cùng gia đình xây lâu đài cát.'
  },
  {
    id: 'p-6',
    albumId: 'children-smiles',
    url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=1600&auto=format&fit=crop',
    title: 'Ánh mắt hồn nhiên tuổi thơ',
    date: 'Tháng 4/2025',
    location: 'Trang trại Mộc Châu',
    aspectRatio: 0.67, // Dọc (Portrait)
    notes: 'Con luôn là người bạn đồng hành thân thiết nhất của em.'
  },
  {
    id: 'p-7',
    albumId: 'vietnam-scenery',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=1600&auto=format&fit=crop',
    title: 'Mùa lúa chín vàng Tam Cốc',
    date: 'Tháng 5/2025',
    location: 'Ninh Bình',
    aspectRatio: 1.5, // Ngang (Landscape)
    notes: 'Dòng sông Ngô Đồng uốn lượn giữa những thửa ruộng vàng ươm.'
  },
  {
    id: 'p-8',
    albumId: 'family-moments',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1600&auto=format&fit=crop',
    title: 'Gia đình là tất cả',
    date: 'Mỗi ngày',
    location: 'Ngôi nhà ấm áp',
    aspectRatio: 1.5,
    notes: 'Nơi bão dừng sau cánh cửa.'
  }
];
