import React from 'react';
import {
  Wallet,
  ArrowDownToLine,
  History,
  Send,
  Headset,
  ShieldCheck,
  Info,
  LogOut,
  ChevronRight,
  Award,
  Layers,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';
import { ALLOWED_COUNTRIES } from '../types';
import { NavTab } from '../components/BottomNav';

interface ProfileViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenDepositHistory: () => void;
  onOpenWithdrawHistory: () => void;
  onOpenInfoModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onOpenDepositHistory,
  onOpenWithdrawHistory,
  onOpenInfoModal,
}) => {
  const { currentUser, settings, setIsAdminMode, investments, logoutUser } = useLexus();

  if (!currentUser) return null;

  const countryObj = ALLOWED_COUNTRIES.find((c) => c.name === currentUser.country);
  const activeContractsCount = investments.filter((i) => i.userId === currentUser.id && i.active).length;
  const isAdministrator = currentUser.role === 'admin' && currentUser.phone === '77409899';

  return (
    <div className="pb-24 space-y-4">
      {/* Top Lexus Header Banner */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-40 sm:h-44 w-full">
          <img
            src={LEXUS_IMAGES.lxVip}
            alt="Lexus Luxury Profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

          {/* User Profile Info Floating */}
          <div className="absolute inset-0 p-5 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900/90 border-2 border-amber-500/70 p-0.5 flex items-center justify-center text-amber-400 shadow-xl">
                <img
                  src={LEXUS_IMAGES.emblemLuxury}
                  alt="Badge"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Cinzel',serif] text-base font-bold text-white uppercase">
                    {currentUser.fullName}
                  </h2>
                  <span className="text-base">{countryObj?.flag || '🌍'}</span>
                </div>
                <p className="text-xs text-neutral-300 font-mono">
                  {currentUser.countryCode} {currentUser.phone}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 uppercase">
                    VIP Club
                  </span>
                  {currentUser.isPromoter && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 uppercase">
                      Promoteur
                    </span>
                  )}
                  {isAdministrator && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-600/30 text-red-300 font-bold border border-red-500/40 uppercase">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logoutUser}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-red-950/80 hover:text-red-400 text-neutral-400 border border-neutral-700/80 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Quitter la session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Balance Summary Card */}
      <div className="mx-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block tracking-wider">
              Solde de votre compte
            </span>
            <span className="font-['JetBrains_Mono',monospace] text-2xl font-black text-white">
              {currentUser.balance.toLocaleString()} <span className="text-xs text-amber-400 font-bold">FCFA</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('depot')}
              className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Dépôt</span>
            </button>
            <button
              onClick={() => onNavigate('retrait')}
              className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retrait</span>
            </button>
          </div>
        </div>

        {/* Stats 3 Columns */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-center">
          <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-[9px] text-neutral-400 block uppercase font-medium">Gains Cumulés</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              +{currentUser.totalEarnings.toLocaleString()} F
            </span>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-[9px] text-neutral-400 block uppercase font-medium">Total Dépôts</span>
            <span className="text-xs font-mono font-bold text-neutral-200">
              {currentUser.totalDeposited.toLocaleString()} F
            </span>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950/80 border border-neutral-800/80">
            <span className="text-[9px] text-neutral-400 block uppercase font-medium">Total Retraits</span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {currentUser.totalWithdrawn.toLocaleString()} F
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className="mx-4 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/70 shadow-lg text-xs">
        {/* Mes Investissements Actifs */}
        <button
          onClick={() => onNavigate('investir')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-100">Mes Contrats Lexus (180J)</h4>
              <p className="text-[11px] text-neutral-400">{activeContractsCount} pack(s) d'investissement en cours</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Historique des Dépôts */}
        <button
          onClick={onOpenDepositHistory}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-100">Historique de mes Dépôts</h4>
              <p className="text-[11px] text-neutral-400">Suivi personnel des recharges et validations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Historique des Retraits */}
        <button
          onClick={onOpenWithdrawHistory}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-100">Historique de mes Retraits</h4>
              <p className="text-[11px] text-neutral-400">Relevé de vos virements Mobile Money 24h/7</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Programme Affiliation */}
        <button
          onClick={() => onNavigate('equipe')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-100">Mon Équipe & Parrainage</h4>
              <p className="text-[11px] text-neutral-400">Vos commissions 25% / 3% / 2% sur 3 niveaux</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {/* Support & Community Section */}
      <div className="mx-4 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/70 shadow-lg text-xs">
        {/* Telegram Channel */}
        <a
          href={settings.telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0088cc]/20 text-[#0088cc] flex items-center justify-center border border-[#0088cc]/40">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Canal Telegram Officiel</h4>
              <p className="text-[11px] text-neutral-400">Rejoignez la communauté des investisseurs</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </a>

        {/* Customer Service */}
        <a
          href={settings.telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center border border-neutral-700">
              <Headset className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Service Client 24/7</h4>
              <p className="text-[11px] text-neutral-400">Assistance et résolution d'incidents</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </a>

        {/* Information Popup Modal Trigger */}
        <button
          onClick={onOpenInfoModal}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 text-amber-400 flex items-center justify-center border border-neutral-700">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Règles & Conditions</h4>
              <p className="text-[11px] text-neutral-400">Bonus 500 FCFA, 180j et commissions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Admin Backoffice Direct Access: ONLY SHOWN IF USER IS ADMIN */}
        {isAdministrator && (
          <button
            onClick={() => setIsAdminMode(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-amber-500/10 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-300">Backoffice Administration</h4>
                <p className="text-[11px] text-neutral-400">Validation des dépôts, retraits et gestion</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>
        )}
      </div>

      {/* Logout button */}
      <div className="mx-4 pt-2">
        <button
          onClick={logoutUser}
          className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-red-950/60 hover:border-red-800 text-neutral-300 hover:text-red-300 border border-neutral-800 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter de mon compte</span>
        </button>
      </div>
    </div>
  );
};
