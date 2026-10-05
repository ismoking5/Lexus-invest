import React, { useState } from 'react';
import {
  Wallet,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  Phone,
  FileCheck,
  ChevronRight,
  History,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';
import { MobileNetwork } from '../types';

interface DepositViewProps {
  onOpenConfirmationModalWithData: (data: {
    amount: number;
    phone: string;
    network: MobileNetwork;
  }) => void;
  onNavigateToHistory: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  onOpenConfirmationModalWithData,
  onNavigateToHistory,
}) => {
  const { currentUser, settings, setPendingCheckoutSession, unconfirmedDepositSession } = useLexus();

  const [selectedNetwork, setSelectedNetwork] = useState<MobileNetwork>('Orange Money');
  const [amount, setAmount] = useState<number>(2000);
  const [phoneNumber, setPhoneNumber] = useState<string>(currentUser?.phone || '');
  const [hasClickedPayer, setHasClickedPayer] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!currentUser) return null;

  const quickAmounts = [2000, 5000, 15000, 35000, 50000, 100000, 250000, 500000, 800000];

  const networks: { id: MobileNetwork; label: string; badge: string; color: string }[] = [
    { id: 'Orange Money', label: 'Orange Money', badge: 'OM', color: 'border-orange-500 text-orange-400 bg-orange-500/10' },
    { id: 'Moov Money', label: 'Moov Money', badge: 'Moov', color: 'border-blue-500 text-blue-400 bg-blue-500/10' },
    { id: 'MTN Money', label: 'MTN Money', badge: 'MTN', color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10' },
    { id: 'Wave', label: 'Wave', badge: 'Wave', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
  ];

  // Button 1: "Payer" > Opens the payment link (never display the raw URL)
  const handlePayerClick = () => {
    setErrorMsg('');
    if (amount < settings.minDeposit) {
      setErrorMsg(`Le montant minimum de dépôt est de ${settings.minDeposit.toLocaleString()} FCFA.`);
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMsg('Veuillez indiquer votre numéro Mobile Money sans indicatif.');
      return;
    }

    // Save pending session to solve forgotten confirmations
    const sessionData = {
      amount,
      phone: phoneNumber.trim(),
      network: selectedNetwork,
      timestamp: Date.now(),
    };
    setPendingCheckoutSession(sessionData);
    setHasClickedPayer(true);

    // Open payment link in secure new tab without showing raw link text on page
    window.open(settings.paymentUrl, '_blank', 'noopener,noreferrer');
  };

  // Button 2: "Confirmation de dépôt"
  const handleOpenConfirmation = () => {
    onOpenConfirmationModalWithData({
      amount: amount || (unconfirmedDepositSession?.amount || 2000),
      phone: phoneNumber || (unconfirmedDepositSession?.phone || currentUser.phone),
      network: selectedNetwork || (unconfirmedDepositSession?.network || 'Orange Money'),
    });
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Professional Lexus Header Banner (Requirement 7) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-36 sm:h-40 w-full">
          <img
            src={LEXUS_IMAGES.lxVip}
            alt="Lexus Prestige Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-neutral-100">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Passerelle Sécurisée Mobile Money
            </span>
            <h2 className="font-['Cinzel',serif] text-xl font-bold uppercase tracking-wider text-white">
              Recharger mon compte
            </h2>
            <p className="text-xs text-neutral-300">
              Crédit manuel et sécurisé après validation par nos équipes.
            </p>
          </div>
        </div>
      </div>

      {/* Forgotten Confirmation Alert Banner */}
      {(hasClickedPayer || unconfirmedDepositSession) && (
        <div className="mx-4 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400 animate-spin" />
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Paiement Mobile Money en cours
            </h4>
          </div>
          <p className="text-xs text-neutral-200 leading-snug">
            N'oubliez pas d'enregistrer votre confirmation dès que vous avez validé le paiement sur votre téléphone ! Sans cette étape, l'administration ne peut pas valider vos fonds.
          </p>
          <button
            onClick={handleOpenConfirmation}
            className="w-full mt-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Confirmer mon dépôt maintenant</span>
          </button>
        </div>
      )}

      {/* Main Recharge Form Card */}
      <div className="mx-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        {/* Méthode de paiement */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                Méthode de paiement
              </span>
              <strong className="text-xs text-white">Mobile Money</strong>
            </div>
          </div>
          <button
            onClick={onNavigateToHistory}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Réseau Utilisé */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Réseau Mobile Money
          </label>
          <div className="grid grid-cols-2 gap-2">
            {networks.map((net) => {
              const isSelected = selectedNetwork === net.id;
              return (
                <button
                  type="button"
                  key={net.id}
                  onClick={() => setSelectedNetwork(net.id)}
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

        {/* Champ Montant */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Montant à déposer (FCFA)
            </label>
            <span className="text-[10px] text-amber-400 font-mono">Min. 2 000 FCFA</span>
          </div>

          <div className="relative">
            <input
              type="number"
              min={2000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Montant minimum 2 000 FCFA"
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-lg outline-none transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
              FCFA
            </span>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quickAmounts.map((q) => (
              <button
                type="button"
                key={q}
                onClick={() => setAmount(q)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                  amount === q
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {q.toLocaleString()} F
              </button>
            ))}
          </div>
        </div>

        {/* Champ Numéro Mobile Money */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Numéro de téléphone sans indicatif
          </label>
          <div className="flex">
            <span className="px-3.5 py-3 rounded-l-xl bg-neutral-800 border border-r-0 border-neutral-700 text-neutral-300 font-mono text-xs flex items-center">
              {currentUser.countryCode}
            </span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex : Numéro de téléphone sans indicatif"
              className="flex-1 px-4 py-3 rounded-r-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-sm outline-none transition-colors"
            />
          </div>
          <p className="text-[11px] text-neutral-400">
            Indiquez le numéro mobile money utilisé pour effectuer le paiement.
          </p>
        </div>

        {/* BOUTON 1 : "Payer" (Ouvre le lien de paiement sans afficher l'URL brute) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handlePayerClick}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Payer {amount ? `${amount.toLocaleString()} FCFA` : ''}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* ÉTAPE 2 APRÈS PAIEMENT : Encadré exigé */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Instructions de validation</span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-medium space-y-1">
            <p>1. Effectuez le paiement</p>
            <p>2. Cliquez sur le bouton ci-dessous</p>
          </div>

          {/* BOUTON 2 : "Confirmation de dépôt" */}
          <button
            type="button"
            onClick={handleOpenConfirmation}
            className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 hover:border-amber-500 text-neutral-100 font-bold text-xs uppercase tracking-wider border border-neutral-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Confirmation de dépôt</span>
          </button>
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/20 text-[11px] text-neutral-400 leading-relaxed">
          <strong className="text-amber-400">Important :</strong> Aucun solde n'est crédité automatiquement. Chaque dépôt est soumis à une vérification manuelle par l'administrateur afin de garantir la totale intégrité des transactions.
        </div>
      </div>
    </div>
  );
};
