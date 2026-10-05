import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { MobileNetwork } from '../types';

interface DepositConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialPhone?: string;
  initialNetwork?: MobileNetwork;
  onSuccessSubmitted?: () => void;
}

export const DepositConfirmationModal: React.FC<DepositConfirmationModalProps> = ({
  isOpen,
  onClose,
  initialAmount = 2000,
  initialPhone = '',
  initialNetwork = 'Orange Money',
  onSuccessSubmitted,
}) => {
  const { submitDepositConfirmation, currentUser, settings } = useLexus();

  const [amount, setAmount] = useState<number>(initialAmount || 2000);
  const [network, setNetwork] = useState<MobileNetwork>(initialNetwork || 'Orange Money');
  const [phone, setPhone] = useState<string>(initialPhone || currentUser?.phone || '');
  const [proofRef, setProofRef] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !currentUser) return null;

  const networks: { id: MobileNetwork; label: string; color: string; badge: string }[] = [
    { id: 'Orange Money', label: 'Orange Money', color: 'border-orange-500 text-orange-400 bg-orange-500/10', badge: 'OM' },
    { id: 'Moov Money', label: 'Moov Money', color: 'border-blue-500 text-blue-400 bg-blue-500/10', badge: 'Moov' },
    { id: 'MTN Money', label: 'MTN Money', color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10', badge: 'MTN' },
    { id: 'Wave', label: 'Wave', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10', badge: 'Wave' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount < settings.minDeposit) {
      setErrorMessage(`Le montant minimum est de ${settings.minDeposit.toLocaleString()} FCFA.`);
      return;
    }
    if (!phone || phone.trim().length < 6) {
      setErrorMessage('Veuillez indiquer le numéro de téléphone utilisé pour le paiement.');
      return;
    }

    const res = submitDepositConfirmation({
      amount: Number(amount),
      network,
      phone: phone.trim(),
      proofRef: proofRef.trim(),
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Une erreur est survenue.');
    } else {
      setIsSuccess(true);
      if (onSuccessSubmitted) {
        onSuccessSubmitted();
      }
    }
  };

  const handleCloseAndReset = () => {
    setIsSuccess(false);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Cinzel',serif] text-base font-bold text-white uppercase tracking-wider">
                Confirmation de dépôt
              </h3>
              <p className="text-[11px] text-neutral-400">
                Validation manuelle obligatoire par l'administration
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white font-['Cinzel',serif]">
                Demande de dépôt envoyée
              </h4>
              <p className="text-sm text-neutral-300 mt-2 font-medium">
                En attente de validation Admin
              </p>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                Votre confirmation pour <strong className="text-amber-400">{amount.toLocaleString()} FCFA</strong> ({network}) a bien été transmise dans les demandes en attente. Votre solde sera crédité dès approbation par nos équipes.
              </p>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Compris
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Champ 1 : Montant déposé (Obligatoire) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                1. Montant déposé (FCFA) <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={settings.minDeposit}
                  step={500}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder={`Min. ${settings.minDeposit} FCFA`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-base outline-none transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  FCFA
                </span>
              </div>
            </div>

            {/* Champ 2 : Réseau utilisé (Obligatoire) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                2. Réseau Mobile Money utilisé <span className="text-amber-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {networks.map((net) => {
                  const isSelected = network === net.id;
                  return (
                    <button
                      type="button"
                      key={net.id}
                      onClick={() => setNetwork(net.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? `${net.color} shadow-sm`
                          : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
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

            {/* Champ 3 : Numéro utilisé (Obligatoire) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                3. Numéro utilisé pour payer <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : 0708123456 (sans indicatif)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-sm outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                Indiquez exactement le numéro débité par Mobile Money.
              </p>
            </div>

            {/* Champ Facultatif : ID SMS / Preuve de transaction */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-400">
                Référence SMS / ID Transaction (Optionnel)
              </label>
              <input
                type="text"
                value={proofRef}
                onChange={(e) => setProofRef(e.target.value)}
                placeholder="Ex : CI2409... ou TXN-8812"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs outline-none focus:border-neutral-600"
              />
            </div>

            {/* Notice warning */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed">
              <strong>Règle de sécurité :</strong> Le crédit de vos fonds est manuel. Un agent du support vérifie votre transaction sous 5 à 15 minutes.
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Envoyer la confirmation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
