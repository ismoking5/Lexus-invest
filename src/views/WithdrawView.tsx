import React, { useState } from 'react';
import {
  ArrowDownToLine,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Percent,
  Wallet,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';
import { MobileNetwork } from '../types';

interface WithdrawViewProps {
  onNavigateToHistory: () => void;
  onNavigateToInvest: () => void;
}

export const WithdrawView: React.FC<WithdrawViewProps> = ({
  onNavigateToHistory,
  onNavigateToInvest,
}) => {
  const { currentUser, submitWithdrawal, settings, investments } = useLexus();

  const [amount, setAmount] = useState<number>(settings.minWithdrawal || 800);
  const [network, setNetwork] = useState<MobileNetwork>('Orange Money');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentUser) return null;

  const networks: { id: MobileNetwork; label: string; badge: string; color: string }[] = [
    { id: 'Orange Money', label: 'Orange Money', badge: 'OM', color: 'border-orange-500 text-orange-400 bg-orange-500/10' },
    { id: 'Moov Money', label: 'Moov Money', badge: 'Moov', color: 'border-blue-500 text-blue-400 bg-blue-500/10' },
    { id: 'MTN Money', label: 'MTN Money', badge: 'MTN', color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10' },
    { id: 'Wave', label: 'Wave', badge: 'Wave', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
  ];

  // Fee calculation (15%)
  const feeAmount = Math.round((amount * settings.withdrawalFeePct) / 100);
  const netAmount = Math.max(0, amount - feeAmount);

  // Silent rule verification
  const userHasInvestment = investments.some((i) => i.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const result = submitWithdrawal({
      amount: Number(amount),
      network,
      phone: phone.trim(),
    });

    if (!result.success) {
      setFeedback({ type: 'error', message: result.error || 'Erreur lors du retrait.' });
    } else {
      setFeedback({
        type: 'success',
        message: `Demande de retrait de ${amount.toLocaleString()} FCFA (${netAmount.toLocaleString()} FCFA nets) soumise avec succès. Traitement sous 24h par l'administration.`,
      });
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Top Lexus Header Banner (Requirement 7) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-36 sm:h-40 w-full">
          <img
            src={LEXUS_IMAGES.lcLfa}
            alt="Lexus Performance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-neutral-100">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Retraits Mobiles Instantanés 24h/7
            </span>
            <h2 className="font-['Cinzel',serif] text-xl font-bold uppercase tracking-wider text-white">
              Demande de Retrait
            </h2>
            <p className="text-xs text-neutral-300">
              Frais de retrait 15% · Disponibilité 24h/24 et 7j/7 · Minimum 800 FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Main Withdrawal Card */}
      <div className="mx-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        {/* User Balance Header & Link to history */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
              Solde Retirable
            </span>
            <span className="font-['JetBrains_Mono',monospace] text-lg font-bold text-white">
              {currentUser.balance.toLocaleString()} <span className="text-xs text-amber-400">FCFA</span>
            </span>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique des retraits</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                : 'bg-red-950/70 border-red-700 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            )}
            <span className="flex-1">{feedback.message}</span>
          </div>
        )}

        {/* If user has no active investment, friendly guidance (silent condition met) */}
        {!userHasInvestment && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Activation requise pour les retraits</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Pour des raisons de conformité et de sécurité, vous devez posséder au moins un contrat d'investissement Lexus actif pour effectuer un retrait.
            </p>
            <button
              onClick={onNavigateToInvest}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer"
            >
              Découvrir les modèles (dès 2 000 FCFA)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Réseau de réception */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Réseau Mobile Money de réception
            </label>
            <div className="grid grid-cols-2 gap-2">
              {networks.map((net) => {
                const isSelected = network === net.id;
                return (
                  <button
                    type="button"
                    key={net.id}
                    onClick={() => setNetwork(net.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `${net.color} shadow-sm`
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <span>{net.label}</span>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                      {net.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Montant du retrait */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Montant à retirer (FCFA)
              </label>
              <span className="text-[10px] text-amber-400 font-mono">Min. 800 FCFA</span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={800}
                step={100}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Montant minimum 800 FCFA"
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-lg outline-none transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                FCFA
              </span>
            </div>
          </div>

          {/* Numéro de réception */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Numéro de téléphone de réception
            </label>
            <div className="flex">
              <span className="px-3.5 py-3 rounded-l-xl bg-neutral-800 border border-r-0 border-neutral-700 text-neutral-300 font-mono text-xs flex items-center">
                {currentUser.countryCode}
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex : 0708123456 (sans indicatif)"
                className="flex-1 px-4 py-3 rounded-r-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-sm outline-none transition-colors"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Vérifiez attentivement le numéro afin d'éviter tout retard de virement.
            </p>
          </div>

          {/* Fee Breakdown Box (15% Frais) */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Montant brut demandé :</span>
              <span className="text-white font-bold">{amount ? amount.toLocaleString() : 0} FCFA</span>
            </div>
            <div className="flex items-center justify-between text-red-400">
              <span>Frais de retrait ({settings.withdrawalFeePct}%) :</span>
              <span>-{feeAmount.toLocaleString()} FCFA</span>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-emerald-400 font-bold text-sm">
              <span>Montant net versé :</span>
              <span>{netAmount.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={currentUser.balance < amount || amount < settings.minWithdrawal}
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              currentUser.balance >= amount && amount >= settings.minWithdrawal
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black shadow-cyan-500/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Confirmer la demande de retrait</span>
          </button>
        </form>

        {/* Withdrawal Policy Banner */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Délai de traitement des retraits : 24h/7</span>
          </div>
          <p>
            Les demandes sont vérifiées par nos modérateurs et envoyées directement sur votre compte {network} après validation.
          </p>
        </div>
      </div>
    </div>
  );
};
