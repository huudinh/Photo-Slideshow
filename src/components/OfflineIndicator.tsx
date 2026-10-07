import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md border border-amber-400/30 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xl animate-in fade-in duration-300">
      <WifiOff className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
      <span>Đang chạy ngoại tuyến (Offline PWA)</span>
    </div>
  );
};
