import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA on Home Screen, do not render
  if (isInstalled) {
    return null;
  }

  // Handle installation click
  const handleTriggerInstall = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'compact' && (
        <button
          onClick={handleTriggerInstall}
          className="p-2 hover:bg-white/15 rounded-xl transition text-amber-300 hover:text-amber-200 flex items-center gap-1.5 text-xs font-medium"
          title="Cài đặt Khung Tranh (PWA App)"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Cài App</span>
        </button>
      )}

      {variant === 'full' && (
        <button
          onClick={handleTriggerInstall}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>{isInstallable ? 'Cài đặt ứng dụng PWA' : 'Thêm vào Màn hình chính (PWA)'}</span>
        </button>
      )}

      {/* Guided installation modal for iOS Safari / Mobile */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5 text-amber-300 font-bold text-base">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3>Cài Đặt Lên iPad / iPhone</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Để biến iPad/iPhone thành khung tranh chuyên dụng chạy toàn màn hình không có thanh địa chỉ Safari:
            </p>

            <div className="space-y-3 text-xs bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-semibold text-white">Bấm nút Chia sẻ:</span>
                  <p className="text-neutral-400 mt-0.5">
                    Nhấn vào biểu tượng <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> (Share) trên thanh công cụ trình duyệt Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-semibold text-white">Thêm vào Màn hình chính:</span>
                  <p className="text-neutral-400 mt-0.5">
                    Cuộn xuống và chọn <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-semibold text-white">Mở từ Màn hình chính:</span>
                  <p className="text-neutral-400 mt-0.5">
                    Bấm <strong>Thêm</strong> ở góc trên. Khung tranh sẽ xuất hiện ngoài màn hình chính như một ứng dụng độc lập 100%!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition"
            >
              Đã hiểu, đóng hướng dẫn
            </button>
          </div>
        </div>
      )}
    </>
  );
};
