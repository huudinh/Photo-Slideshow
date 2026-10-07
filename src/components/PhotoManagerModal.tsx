import React, { useState, useRef } from 'react';
import { PhotoAlbum, PhotoItem } from '../types';
import { 
  X, 
  Upload, 
  Trash2, 
  Plus, 
  Folder, 
  Check, 
  Image as ImageIcon,
  Edit2,
  Sparkles,
  RefreshCw,
  FolderPlus
} from 'lucide-react';

interface PhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  albums: PhotoAlbum[];
  onAddPhotos: (newPhotos: PhotoItem[]) => void;
  onDeletePhoto: (photoId: string) => void;
  onCreateAlbum: (albumName: string, description: string) => void;
  onResetDefaultPhotos: () => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  onClose,
  photos,
  albums,
  onAddPhotos,
  onDeletePhoto,
  onCreateAlbum,
  onResetDefaultPhotos
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showAddAlbum, setShowAddAlbum] = useState<boolean>(false);
  const [newAlbumName, setNewAlbumName] = useState<string>('');
  const [newAlbumDesc, setNewAlbumDesc] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlTitle, setUrlTitle] = useState<string>('');
  const [showUrlForm, setShowUrlForm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter photos by active album
  const filteredPhotos = selectedAlbumId === 'all' 
    ? photos 
    : photos.filter(p => p.albumId === selectedAlbumId);

  // Handle local file selection (Camera roll / file manager on iPad)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: PhotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await readFileAsDataURL(file);
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        
        newItems.push({
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: base64,
          title: title || 'Kỷ niệm gia đình',
          date: new Date().toLocaleDateString('vi-VN'),
          location: 'Kho ảnh thiết bị',
          albumId: selectedAlbumId === 'all' ? (albums[0]?.id || 'family-moments') : selectedAlbumId,
          notes: ''
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    if (newItems.length > 0) {
      onAddPhotos(newItems);
    }
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Add photo via Web URL
  const handleAddUrlPhoto = () => {
    if (!urlInput.trim()) return;
    const newPhoto: PhotoItem = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      title: urlTitle.trim() || 'Ảnh kỷ niệm mới',
      date: new Date().toLocaleDateString('vi-VN'),
      location: 'Ảnh trực tuyến',
      albumId: selectedAlbumId === 'all' ? (albums[0]?.id || 'family-moments') : selectedAlbumId
    };
    onAddPhotos([newPhoto]);
    setUrlInput('');
    setUrlTitle('');
    setShowUrlForm(false);
  };

  const handleCreateNewAlbum = () => {
    if (!newAlbumName.trim()) return;
    onCreateAlbum(newAlbumName.trim(), newAlbumDesc.trim() || 'Album gia đình');
    setNewAlbumName('');
    setNewAlbumDesc('');
    setShowAddAlbum(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Quản lý Kho Ảnh Gia Đình</h3>
              <p className="text-xs text-neutral-400">
                Lưu trữ vĩnh viễn trên iPad, hỗ trợ tải ảnh từ thư viện & cuộn camera
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          
          {/* Album selector tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedAlbumId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedAlbumId === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Tất cả ({photos.length})
            </button>

            {albums.map(album => (
              <button
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedAlbumId === album.id
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{album.name}</span>
                <span className="text-[10px] opacity-75">
                  ({photos.filter(p => p.albumId === album.id).length})
                </span>
              </button>
            ))}

            <button
              onClick={() => setShowAddAlbum(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-neutral-800/80 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 flex items-center gap-1"
              title="Tạo Album mới"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Album</span>
            </button>
          </div>

          {/* Upload and URL actions */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Đang tải lên...' : 'Tải ảnh từ iPad/Máy'}</span>
            </button>

            <button
              onClick={() => setShowUrlForm(!showUrlForm)}
              className="px-3 py-1.5 rounded-xl text-xs bg-neutral-800 hover:bg-neutral-700 text-slate-300 transition"
            >
              Thêm link ảnh
            </button>
          </div>
        </div>

        {/* Add Album Form Drawer */}
        {showAddAlbum && (
          <div className="px-6 py-3 bg-amber-950/20 border-b border-amber-500/20 flex flex-wrap items-center gap-2 text-xs animate-in slide-in-from-top-2">
            <span className="font-semibold text-amber-200">Tạo Album mới:</span>
            <input
              type="text"
              placeholder="Tên Album (vd: Sinh nhật bé 2026)"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400 flex-1 min-w-[200px]"
            />
            <input
              type="text"
              placeholder="Mô tả ngắn gọn"
              value={newAlbumDesc}
              onChange={(e) => setNewAlbumDesc(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400 flex-1 min-w-[200px]"
            />
            <button
              onClick={handleCreateNewAlbum}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition"
            >
              Lưu
            </button>
            <button
              onClick={() => setShowAddAlbum(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
            >
              Hủy
            </button>
          </div>
        )}

        {/* Add Image Link Form Drawer */}
        {showUrlForm && (
          <div className="px-6 py-3 bg-neutral-800/40 border-b border-neutral-700 flex flex-wrap items-center gap-2 text-xs animate-in slide-in-from-top-2">
            <input
              type="url"
              placeholder="Dán đường dẫn ảnh (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400 flex-1 min-w-[240px]"
            />
            <input
              type="text"
              placeholder="Tiêu đề ảnh (tùy chọn)"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-400 w-48"
            />
            <button
              onClick={handleAddUrlPhoto}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition"
            >
              Thêm
            </button>
            <button
              onClick={() => setShowUrlForm(false)}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Photo Grid Gallery */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-2xl overflow-hidden bg-neutral-800/60 border border-neutral-700/60 aspect-[4/3] shadow-md flex flex-col justify-end"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

              {/* Photo Title and date */}
              <div className="relative z-10 p-2.5 text-xs text-white">
                <p className="font-semibold truncate text-amber-100">{photo.title}</p>
                <div className="flex items-center justify-between text-[11px] text-neutral-300 mt-0.5">
                  <span>{photo.date || 'Kỷ niệm'}</span>
                  <span>{photo.location || ''}</span>
                </div>
              </div>

              {/* Delete action */}
              <button
                onClick={() => onDeletePhoto(photo.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                title="Xóa ảnh này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {filteredPhotos.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center text-neutral-400">
              <ImageIcon className="w-12 h-12 text-neutral-600 mb-3" />
              <p className="font-semibold text-sm text-neutral-300">Chưa có ảnh nào trong album này</p>
              <p className="text-xs text-neutral-500 mt-1">
                Bấm nút "Tải ảnh từ iPad/Máy" ở trên để chọn ảnh gia đình yêu thích của bạn!
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
          <button
            onClick={onResetDefaultPhotos}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-amber-300 transition"
            title="Khôi phục lại kho ảnh mẫu ban đầu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục album mẫu</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition shadow-lg"
          >
            Hoàn tất ({photos.length} ảnh)
          </button>
        </div>

      </div>
    </div>
  );
};
