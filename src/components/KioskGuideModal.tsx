import React from 'react';
import { 
  X, 
  HelpCircle, 
  Smartphone, 
  Lock, 
  BatteryCharging, 
  Sun, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Tv, 
  Lightbulb
} from 'lucide-react';

interface KioskGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KioskGuideModal: React.FC<KioskGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Hướng Dẫn Biến iPad/iPhone Cũ Thành Khung Tranh Chuyên Dụng
              </h3>
              <p className="text-xs text-neutral-400">
                Tối ưu hóa thiết bị cũ (iPad mini, iPad 2/3/4/6, iPhone 6) hoạt động bền bỉ 24/7
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-neutral-300">
          
          {/* Quick Tip Banner */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-200 text-sm">Lời khuyên sử dụng:</h4>
              <p className="text-[11px] leading-relaxed text-amber-100/90">
                Ứng dụng này đã được tối ưu hiệu năng cực nhẹ để chạy mượt mà trên cả những máy dùng chip Apple A8/A9/A10 cũ mà không bị giật lag hay nóng máy. Làm theo 3 bước bên dưới để có trải nghiệm như một khung tranh kỹ thuật số đắt tiền!
              </p>
            </div>
          </div>

          {/* Step 1: Add to Home Screen */}
          <div className="p-5 rounded-2xl bg-neutral-800/40 border border-neutral-700/70 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs">
                1
              </div>
              <h4>Thêm vào Màn hình chính để ẩn thanh trình duyệt Safari</h4>
            </div>
            <p className="leading-relaxed">
              Để ứng dụng hiển thị tràn viền toàn màn hình, không còn thanh URL hay nút điều hướng của Safari:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-neutral-200">
              <li>
                Mở trang web này trên trình duyệt <strong className="text-white">Safari</strong> của iPad/iPhone.
              </li>
              <li>
                Bấm vào biểu tượng <strong className="text-amber-300">Chia sẻ (Share)</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> ở góc trên hoặc dưới màn hình.
              </li>
              <li>
                Cuộn xuống và chọn mục <strong className="text-amber-300">"Thêm vào Màn hình chính" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
              </li>
              <li>
                Bấm nút <strong className="text-white">Thêm (Add)</strong>. Giờ bạn chỉ cần mở ứng dụng từ icon trên màn hình chính như một app độc lập!
              </li>
            </ol>
          </div>

          {/* Step 2: Guided Access (Truy cập được hướng dẫn) */}
          <div className="p-5 rounded-2xl bg-neutral-800/40 border border-neutral-700/70 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs">
                2
              </div>
              <h4>Bật "Truy cập được hướng dẫn" (Guided Access - Chế độ Kiosk)</h4>
            </div>
            <p className="leading-relaxed">
              Tính năng này của iOS sẽ khóa cứng màn hình trong app, người khác hay trẻ nhỏ bấm nút Home / vuốt cũng không thể thoát ra ngoài:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-neutral-200">
              <li>
                Vào <strong className="text-white">Cài đặt (Settings)</strong> trên iPad → Chọn <strong className="text-white">Trợ năng (Accessibility)</strong>.
              </li>
              <li>
                Cuộn xuống chọn mục <strong className="text-amber-300">Truy cập được hướng dẫn (Guided Access)</strong> và Bật tính năng này lên.
              </li>
              <li>
                Đặt một mật khẩu để chỉ bạn mới có thể thoát ra.
              </li>
              <li>
                Quay lại ứng dụng Khung Tranh, bấm nút <strong className="text-white">Home 3 lần liên tiếp (hoặc nút Nguồn 3 lần)</strong> và chọn <strong className="text-emerald-400">Bắt đầu (Start)</strong>.
              </li>
            </ol>
          </div>

          {/* Step 3: Screen & Power Settings */}
          <div className="p-5 rounded-2xl bg-neutral-800/40 border border-neutral-700/70 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-xs">
                3
              </div>
              <h4>Cài đặt Nguồn & Màn hình luôn sáng</h4>
            </div>
            <ul className="space-y-2 text-neutral-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Không khóa màn hình:</strong> Vào <em>Cài đặt → Màn hình & Độ sáng → Tự động khóa → Chọn "Không bao giờ" (Never)</em>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Độ sáng & Bảo vệ mắt:</strong> Nên điều chỉnh độ sáng khoảng 30% - 50% để ảnh hiển thị ấm cúng như tranh giấy in thật và bảo vệ pin máy.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sạc pin an toàn:</strong> Sử dụng củ sạc chính hãng và cáp sạc tốt. Có thể kết hợp thêm một ổ cắm thông minh (Smart Plug) tự ngắt điện 1-2 tiếng mỗi ngày để giữ pin máy cũ luôn khỏe mạnh.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition shadow-lg"
          >
            Đã hiểu, Bắt đầu trải nghiệm!
          </button>
        </div>

      </div>
    </div>
  );
};
