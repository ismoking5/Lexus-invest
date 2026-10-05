import React, { useState, useEffect } from 'react';
import {
  Send,
  Wallet,
  ArrowDownToLine,
  TrendingUp,
  Users,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';
import { NavTab } from '../components/BottomNav';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenDepositModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenDepositModal }) => {
  const { currentUser, products, investments, settings, unconfirmedDepositSession } = useLexus();

  // Fake live ticker for community activity
  const [tickerIndex, setTickerIndex] = useState(0);
  const liveEvents = [
    'Amadou B. (+237) vient de recevoir 5 600 FCFA de gains quotidiens',
    'Koffi J. (+225) a activé le pack Lexus RX 500h F-Sport',
    'Dossou B. (+229) a reçu un retrait de 35 000 FCFA via MTN Money',
    'Ousmane S. (+226) a rejoint le club Lexus et a reçu 500 FCFA gratuits',
    'Ibrahim M. (+227) vient de gagner 25% de commission parrainage',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [liveEvents.length]);

  if (!currentUser) return null;

  const activeUserInvestments = investments.filter((i) => i.userId === currentUser.id && i.active);
  const todayEarningsEstimate = activeUserInvestments.reduce((acc, i) => acc + i.dailyReturn, 0);

  return (
    <div className="pb-24 space-y-4">
      {/* Reminder Pill if unconfirmed deposit exists */}
      {unconfirmedDepositSession && (
        <div className="mx-4 mt-2 p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Paiement de {unconfirmedDepositSession.amount.toLocaleString()} FCFA en attente</span>
          </div>
          <button
            onClick={onOpenDepositModal}
            className="px-2.5 py-1 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
          >
            Confirmer
          </button>
        </div>
      )}

      {/* Hero Showcase with Lexus Brand Image (Requirement 7: Professional Lexus image on each page) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="relative h-48 sm:h-56 w-full">
          <img
            src={LEXUS_IMAGES.heroBanner}
            alt="Lexus Prestige Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-neutral-950/40" />

          {/* Luxury Overlay content */}
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-neutral-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-amber-500 text-black">
                Prestige & Rendement
              </span>
              <span className="text-[11px] text-neutral-300 font-mono">180 Jours Garantis</span>
            </div>
            <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-black text-white tracking-wider leading-tight uppercase">
              LEXUS INVEST
            </h1>
            <p className="text-xs text-neutral-300 line-clamp-2 max-w-xs mt-0.5">
              Participez aux modèles légendaires Lexus et encaissez vos dividendes quotidiens en FCFA.
            </p>
          </div>
        </div>

        {/* Live Community Activity Marquee Ticker */}
        <div className="bg-neutral-950 px-4 py-2 border-t border-neutral-800/80 flex items-center gap-2 text-xs">
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Activité :</span>
          <p className="text-neutral-300 truncate text-[11px] font-medium transition-all duration-300">
            {liveEvents[tickerIndex]}
          </p>
        </div>
      </div>

      {/* Requirement 6: Telegram Channel Banner */}
      <div className="mx-4">
        <a
          href={settings.telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative overflow-hidden rounded-xl p-3.5 bg-gradient-to-r from-[#0088cc]/25 via-neutral-900 to-neutral-900 border border-[#0088cc]/40 hover:border-[#0088cc] transition-all shadow-lg shadow-[#0088cc]/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5 translate-x-[-1px]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0088cc] tracking-wider block">
                  Communauté Officielle
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Rejoignez notre Canal Telegram
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Preuves de paiements, actualités et support 24h/7
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
        </a>
      </div>

      {/* User Balance & Quick Stats Card */}
      <div className="mx-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-medium text-neutral-400 tracking-wider">
              Solde Disponible
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-white">
                {currentUser.balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-400">FCFA</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-medium text-neutral-400 tracking-wider">
              Gains Estimés / Jour
            </span>
            <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
              <span className="font-['JetBrains_Mono',monospace] text-base font-bold text-emerald-400">
                +{todayEarningsEstimate.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-neutral-400">FCFA/J</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Dépôt & Retrait */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-800">
          <button
            onClick={() => onNavigate('depot')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Recharger</span>
          </button>

          <button
            onClick={() => onNavigate('retrait')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs tracking-wider transition-colors border border-neutral-700 cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
            <span>Retirer</span>
          </button>
        </div>

        {/* Quick Meta Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Total Gains</span>
            <span className="text-xs font-mono font-bold text-neutral-200">
              {currentUser.totalEarnings.toLocaleString()} F
            </span>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Packs Actifs</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {activeUserInvestments.length}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Parrainage</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Jusqu'à 25%
            </span>
          </div>
        </div>
      </div>

      {/* Featured Lexus Products Carousel / List */}
      <div className="mx-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase tracking-wider">
              Modèles Lexus Disponibles (180 Jours)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('investir')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Top Featured Cards */}
        <div className="space-y-3">
          {products.slice(0, 3).map((prod) => (
            <div
              key={prod.id}
              className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between gap-3 shadow-lg"
            >
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-800">
                <img
                  src={LEXUS_IMAGES.lbxCar}
                  alt={prod.modelName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                    {prod.tag || 'Lexus'}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{prod.modelName}</h4>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-1 text-[11px]">
                  <div>
                    <span className="text-neutral-400 block text-[9px]">Prix</span>
                    <span className="font-mono font-bold text-white">
                      {prod.price.toLocaleString()} F
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[9px]">Rendement/J</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{prod.dailyReturn.toLocaleString()} F
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('investir')}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 font-bold text-xs transition-colors cursor-pointer flex-shrink-0"
              >
                Investir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Guarantees & Features */}
      <div className="mx-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3">
        <h4 className="font-['Cinzel',serif] text-xs font-bold uppercase tracking-wider text-neutral-400">
          Pourquoi Choisir Lexus Invest ?
        </h4>
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200 block">Rendement Quotidien</strong>
              <span className="text-[10px] text-neutral-400">Versement auto toutes les 24h</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200 block">Retraits 24h/7</strong>
              <span className="text-[10px] text-neutral-400">Directement vers Mobile Money</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <Gift className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200 block">500 FCFA Offerts</strong>
              <span className="text-[10px] text-neutral-400">Dès la création de compte</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <Users className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200 block">Affiliation 3 Niveaux</strong>
              <span className="text-[10px] text-neutral-400">25% / 3% / 2% de commissions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
