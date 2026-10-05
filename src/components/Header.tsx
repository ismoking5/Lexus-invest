import React from 'react';
import { Send, Bell, ShieldCheck, Headset, LogOut } from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { currentUser, notifications, settings, isAdminMode, setIsAdminMode, logoutUser } = useLexus();

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.read).length;
  const isAdministrator = currentUser.role === 'admin' && currentUser.phone === '77409899';

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
      {/* Brand Identity with Lexus Badge */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-700 bg-neutral-900 shadow-sm flex items-center justify-center">
          <img
            src={LEXUS_IMAGES.emblemLuxury}
            alt="Lexus Logo"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-['Cinzel',serif] text-lg font-black tracking-widest text-neutral-100 uppercase leading-none">
            LEXUS
          </span>
          <span className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold leading-tight">
            Invest Club
          </span>
        </div>
      </div>

      {/* Right Icons: Telegram, Support, Notifications, and ONLY IF ADMIN: Admin Backoffice Toggle */}
      <div className="flex items-center gap-2">
        {/* Telegram Direct Link */}
        <a
          href={settings.telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Canal Telegram Officiel"
          className="w-8 h-8 rounded-full bg-[#0088cc]/15 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/30 flex items-center justify-center transition-colors"
        >
          <Send className="w-3.5 h-3.5 translate-x-[-0.5px]" />
        </a>

        {/* Customer Support */}
        <a
          href={settings.telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Service Client 24/7"
          className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/80 flex items-center justify-center transition-colors"
        >
          <Headset className="w-3.5 h-3.5 text-neutral-300" />
        </a>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="relative w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/80 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-neutral-950 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Admin Toggle Button: ONLY VISIBLE IF CURRENT USER IS ADMIN */}
        {isAdministrator && (
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isAdminMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title={isAdminMode ? 'Revenir à la vue utilisateur' : 'Accéder au Backoffice Admin'}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isAdminMode ? 'text-amber-400' : 'text-neutral-500'}`} />
            <span>{isAdminMode ? 'Admin' : 'Espace Admin'}</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={logoutUser}
          className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-red-950/70 hover:text-red-400 border border-neutral-700/80 flex items-center justify-center text-neutral-400 transition-colors cursor-pointer"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
