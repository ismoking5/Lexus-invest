import React from 'react';
import { Send, CheckCircle2, X, Sparkles, Shield, Gift } from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';

interface InfoPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoPopupModal: React.FC<InfoPopupModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useLexus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col">
        {/* Top Header Banner with Lexus Image */}
        <div className="relative h-28 w-full overflow-hidden bg-neutral-950">
          <img
            src={LEXUS_IMAGES.heroBanner}
            alt="Lexus Prestige"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-950/70 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Lexus Invest Officiel
              </span>
              <h2 className="font-['Cinzel',serif] text-xl font-bold tracking-wider text-white uppercase">
                INFORMATION
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5 text-sm">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              1
            </span>
            <p className="text-neutral-200 leading-snug">
              Inscrivez-vous maintenant et recevez <strong className="text-amber-400 font-bold">500 FCFA gratuitement</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              2
            </span>
            <p className="text-neutral-200 leading-snug">
              Invitez vos amis à investir et gagnez <strong className="text-emerald-400 font-bold">{settings.referralLevel1Pct}% / {settings.referralLevel2Pct}% / {settings.referralLevel3Pct}%</strong> sur 3 niveaux.
            </p>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              3
            </span>
            <p className="text-neutral-200 leading-snug">
              Les rendements sont versés <strong className="text-neutral-100 font-semibold">automatiquement chaque jour pendant 180 jours</strong>.
            </p>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
              4
            </span>
            <p className="text-neutral-200 leading-snug">
              Investissez dès <strong className="text-amber-400 font-bold">2 000 FCFA</strong> et commencez à gagner dès le lendemain.
            </p>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="p-4 pt-1 border-t border-neutral-800 space-y-2.5">
          {/* Blue Telegram Button */}
          <a
            href={settings.telegramInfoPopupUrl || 'https://t.me/+avYieGqPfUtlNDI0'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0088cc]/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Rejoindre le Telegram Officiel</span>
          </a>

          {/* D'accord Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-sm flex items-center justify-center gap-2 border border-neutral-700 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>D'accord</span>
          </button>
        </div>
      </div>
    </div>
  );
};
