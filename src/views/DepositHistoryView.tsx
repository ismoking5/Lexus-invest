import React from 'react';
import { ArrowLeft, Wallet, CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';

interface DepositHistoryViewProps {
  onBack: () => void;
  onNavigateToDeposit: () => void;
}

export const DepositHistoryView: React.FC<DepositHistoryViewProps> = ({ onBack, onNavigateToDeposit }) => {
  const { deposits, currentUser } = useLexus();

  if (!currentUser) return null;

  const userDeposits = deposits.filter((d) => d.userId === currentUser.id);

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle className="w-3 h-3" />
            <span>Validé & Crédité</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
            <XCircle className="w-3 h-3" />
            <span>Rejeté</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>En attente Admin</span>
          </span>
        );
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Top Header */}
      <div className="mx-4 flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
        <h2 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase tracking-wider">
          Historique des Dépôts
        </h2>
        <div className="w-12" />
      </div>

      {/* Lexus Image Banner (Requirement 7) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-28 w-full">
          <img
            src={LEXUS_IMAGES.heroBanner}
            alt="Lexus Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end text-neutral-100">
            <span className="text-[10px] uppercase font-bold text-amber-400">
              Journal des Recharges
            </span>
            <h3 className="font-['Cinzel',serif] text-base font-bold text-white">
              Dépôts Mobile Money
            </h3>
          </div>
        </div>
      </div>

      {/* Deposits List */}
      <div className="mx-4 space-y-3">
        {userDeposits.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <Wallet className="w-10 h-10 mx-auto text-neutral-600 opacity-60" />
            <h4 className="text-sm font-bold text-white">Aucun dépôt pour le moment</h4>
            <p className="text-xs text-neutral-400">
              Rechargez votre solde dès 2 000 FCFA pour souscrire à un pack Lexus.
            </p>
            <button
              onClick={onNavigateToDeposit}
              className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
            >
              Faire un dépôt
            </button>
          </div>
        ) : (
          userDeposits.map((dep) => (
            <div
              key={dep.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 font-mono text-[10px] text-amber-400 font-bold">
                    {dep.network}
                  </span>
                  <span className="text-xs font-mono text-neutral-300">
                    {dep.userPhone}
                  </span>
                </div>
                {getStatusBadge(dep.status)}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="font-['JetBrains_Mono',monospace] text-lg font-bold text-white">
                  +{dep.amount.toLocaleString()} <span className="text-xs text-amber-400">FCFA</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(dep.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="truncate max-w-[180px]">
                  Réf : <strong className="text-neutral-300 font-mono">{dep.proofRef || 'N/A'}</strong>
                </span>
                {dep.adminNote && (
                  <span className="text-[10px] text-amber-300/90 italic truncate max-w-[150px]">
                    {dep.adminNote}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
