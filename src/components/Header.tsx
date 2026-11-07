import React from 'react';
import { useBanking } from '../context/BankingContext';
import { Headphones, Scan, Bell, User } from 'lucide-react';

interface HeaderProps {
  onOpenProfile: () => void;
  onOpenQR: () => void;
  onOpenSupport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProfile,
  onOpenQR,
  onOpenSupport,
}) => {
  const { user } = useBanking();

  // Get name for greeting: "Hi,DDKID"
  const displayName = user?.name ? user.name.split(' ')[0] : 'DDKID';

  return (
    <header className="w-full bg-[#121317] border-b border-white/5 sticky top-0 z-30 pt-1 pb-2">
      <div className="max-w-md mx-auto px-4 flex items-center justify-between">
        {/* User Greeting & Avatar matching IMG_5094 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenProfile}
            className="relative group p-0.5 rounded-full transition active:scale-95"
            title="Profile & Settings"
            aria-label="User Profile"
          >
            {/* Avatar image or stylized container */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-900 to-amber-700 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-white/20">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-black text-xs">
                    {displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Bronze Tier 1 Medal Badge */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 border border-[#121317] text-[9px] font-black text-white flex items-center justify-center shadow-xs">
              1
            </span>
          </button>

          <div>
            <span className="text-base font-bold text-white tracking-tight">
              Hi,{displayName}
            </span>
          </div>
        </div>

        {/* Action icons on right: Headset HELP, Scan QR, Bell 99+ */}
        <div className="flex items-center gap-2">
          {/* HELP Headset */}
          <button
            onClick={onOpenSupport || onOpenProfile}
            className="relative p-1.5 text-gray-300 hover:text-white transition active:scale-95"
            title="Customer Support"
            aria-label="Help"
          >
            <Headphones className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-2 text-[8px] font-black uppercase tracking-tight bg-gradient-to-r from-pink-500 to-rose-600 text-white px-1 py-0.2 rounded-full shadow-xs">
              HELP
            </span>
          </button>

          {/* QR Scan Frame */}
          <button
            onClick={onOpenQR}
            className="p-1.5 text-gray-300 hover:text-white transition active:scale-95"
            title="Scan & Pay / Show QR"
            aria-label="Scan QR Code"
          >
            <Scan className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Notification Bell with 99+ */}
          <button
            onClick={onOpenProfile}
            className="relative p-1.5 text-gray-300 hover:text-white transition active:scale-95"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1.5 text-[8px] font-black bg-rose-600 text-white px-1 py-0.2 rounded-full shadow-xs">
              99+
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
