import React from 'react';
import { X, Bell, Check, TrendingUp, Wallet, ArrowDownToLine, Gift, AlertCircle } from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, currentUser, markNotificationAsRead, markAllNotificationsAsRead } = useLexus();

  if (!isOpen || !currentUser) return null;

  const userNotifications = notifications.filter((n) => n.userId === currentUser.id);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'earning':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'deposit':
        return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'withdrawal':
        return <ArrowDownToLine className="w-4 h-4 text-cyan-400" />;
      case 'bonus':
        return <Gift className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-['Cinzel',serif] text-base font-bold text-white uppercase tracking-wider">
              Notifications
            </h3>
            {userNotifications.filter((n) => !n.read).length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 font-bold">
                {userNotifications.filter((n) => !n.read).length} nouvelle(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {userNotifications.some((n) => !n.read) && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                Tout marquer lu
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-2.5 divide-y divide-neutral-800/60">
          {userNotifications.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-neutral-600 opacity-50" />
              <p className="text-sm font-medium">Aucune notification pour le moment.</p>
              <p className="text-xs text-neutral-400">Vos gains quotidiens et validations apparaîtront ici.</p>
            </div>
          ) : (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`pt-2.5 first:pt-0 flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                  notif.read ? 'bg-neutral-900/40 opacity-75' : 'bg-neutral-800/80 border border-neutral-700/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-700/80 flex items-center justify-center flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-neutral-100 truncate">{notif.title}</h5>
                    <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap">
                      {new Date(notif.date).toLocaleDateString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-snug break-words">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
