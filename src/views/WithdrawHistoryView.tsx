import React from 'react';
import { ArrowLeft, ArrowDownToLine, CheckCircle, Clock, XCircle, ShieldCheck } from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';

interface WithdrawHistoryViewProps {
  onBack: () => void;
  onNavigateToWithdraw: () => void;
}

export const WithdrawHistoryView: React.FC<WithdrawHistoryViewProps> = ({ onBack, onNavigateToWithdraw }) => {
  const { withdrawals, currentUser } = useLexus();

  if (!currentUser) return null;

  const userWithdrawals = withdrawals.filter((w) => w.userId === currentUser.id);

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle className="w-3 h-3" />
            <span>Payé & Envoyé</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
            <XCircle className="w-3 h-3" />
            <span>Rejeté & Remboursé</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Traitement 24h</span>
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
          Historique des Retraits
        </h2>
        <div className="w-12" />
      </div>

      {/* Lexus Image Banner (Requirement 7) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-28 w-full">
          <img
            src={LEXUS_IMAGES.lcLfa}
            alt="Lexus Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end text-neutral-100">
            <span className="text-[10px] uppercase font-bold text-cyan-400">
              Journal des Virements
            </span>
            <h3 className="font-['Cinzel',serif] text-base font-bold text-white">
              Retraits Mobile Money (24h/7)
            </h3>
          </div>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="mx-4 space-y-3">
        {userWithdrawals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <ArrowDownToLine className="w-10 h-10 mx-auto text-neutral-600 opacity-60" />
            <h4 className="text-sm font-bold text-white">Aucun retrait pour le moment</h4>
            <p className="text-xs text-neutral-400">
              Vos gains générés chaque jour peuvent être retirés 24h/7 dès 800 FCFA.
            </p>
            <button
              onClick={onNavigateToWithdraw}
              className="px-4 py-2 bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs rounded-xl hover:bg-neutral-700 cursor-pointer"
            >
              Demander un retrait
            </button>
          </div>
        ) : (
          userWithdrawals.map((wth) => (
            <div
              key={wth.id}
              className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 font-mono text-[10px] text-cyan-400 font-bold">
                    {wth.network}
                  </span>
                  <span className="text-xs font-mono text-neutral-300">
                    {wth.userPhone}
                  </span>
                </div>
                {getStatusBadge(wth.status)}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="font-['JetBrains_Mono',monospace] text-lg font-bold text-white">
                    {wth.netAmount.toLocaleString()} <span className="text-xs text-cyan-400">FCFA net</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 block font-mono">
                    Brut : {wth.amount.toLocaleString()} F · Frais (15%) : -{wth.feeAmount.toLocaleString()} F
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(wth.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {wth.adminNote && (
                <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>Note admin :</span>
                  <span className="text-amber-300/90 italic truncate max-w-[200px]">
                    {wth.adminNote}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
