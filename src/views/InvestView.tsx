import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
  Zap,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { LEXUS_IMAGES } from '../assets/images';
import { Product } from '../types';

interface InvestViewProps {
  onNavigateToDeposit: () => void;
}

export const InvestView: React.FC<InvestViewProps> = ({ onNavigateToDeposit }) => {
  const { products, currentUser, investInProduct, investments } = useLexus();

  const [activeTab, setActiveTab] = useState<'catalog' | 'myInvestments'>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!currentUser) return null;

  const userActiveInvestments = investments.filter((i) => i.userId === currentUser.id && i.active);

  const getProductImage = (imageKey: string) => {
    switch (imageKey) {
      case 'lbx':
      case 'ux':
        return LEXUS_IMAGES.lbxCar;
      case 'nx':
      case 'rx':
      case 'rz':
        return LEXUS_IMAGES.rxSport;
      case 'gx':
      case 'lx':
        return LEXUS_IMAGES.lxVip;
      case 'lc':
      case 'lfa':
        return LEXUS_IMAGES.lcLfa;
      default:
        return LEXUS_IMAGES.rxSport;
    }
  };

  const handleConfirmInvestment = (product: Product) => {
    setFeedback(null);
    const result = investInProduct(product.id);
    if (!result.success) {
      setFeedback({ type: 'error', message: result.error || 'Erreur lors de la souscription.' });
    } else {
      setFeedback({
        type: 'success',
        message: `Félicitations ! Vous avez acquis le pack ${product.modelName}. Vos dividendes de ${product.dailyReturn.toLocaleString()} FCFA/J commencent dès demain !`,
      });
      setSelectedProduct(null);
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Top Professional Lexus Header Banner (Requirement 7) */}
      <div className="relative mx-4 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="relative h-36 sm:h-44 w-full">
          <img
            src={LEXUS_IMAGES.rxSport}
            alt="Lexus Performance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end text-neutral-100">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Gamme Véhicules & Rendements 180 Jours
            </span>
            <h2 className="font-['Cinzel',serif] text-xl font-bold uppercase tracking-wider text-white">
              Investissement Lexus
            </h2>
            <p className="text-xs text-neutral-300">
              Rendements garantis versés quotidiennement directement sur votre solde.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation sub-tabs: Catalogue vs Mes Investissements */}
      <div className="mx-4 flex border border-neutral-800 bg-neutral-950 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'bg-neutral-800 text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Catalogue Modèles (9)</span>
        </button>
        <button
          onClick={() => setActiveTab('myInvestments')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'myInvestments'
              ? 'bg-neutral-800 text-amber-400 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mes Contrats Actifs ({userActiveInvestments.length})</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mx-4 p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
              : 'bg-red-950/70 border-red-700 text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          )}
          <span className="flex-1">{feedback.message}</span>
        </div>
      )}

      {/* Content depending on tab */}
      {activeTab === 'catalog' ? (
        <div className="mx-4 space-y-4">
          <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
            <span>Solde actuel : <strong className="text-amber-400 font-mono">{currentUser.balance.toLocaleString()} FCFA</strong></span>
            <button
              onClick={onNavigateToDeposit}
              className="text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Recharger mon solde</span>
            </button>
          </div>

          {/* Cards for each Lexus model */}
          <div className="space-y-4">
            {products.map((product) => {
              const carImg = getProductImage(product.imageKey);
              const canAfford = currentUser.balance >= product.price;

              return (
                <div
                  key={product.id}
                  className={`relative rounded-2xl overflow-hidden border bg-neutral-900 shadow-xl transition-all ${
                    product.featured ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Car Image on Top */}
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-950">
                    <img
                      src={carImg}
                      alt={product.modelName}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40" />

                    {/* Tag badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-neutral-700 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                        {product.tag || 'Lexus'}
                      </span>
                      {product.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Recommandé</span>
                        </span>
                      )}
                    </div>

                    {/* Duration badge */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700 text-neutral-300 font-mono text-[10px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{product.durationDays} Jours</span>
                    </div>

                    {/* Model Name on Image bottom */}
                    <div className="absolute bottom-2 left-4 right-4">
                      <h3 className="font-['Cinzel',serif] text-lg font-black text-white uppercase tracking-wider drop-shadow-md">
                        {product.modelName}
                      </h3>
                    </div>
                  </div>

                  {/* Pricing and Return Breakdown */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Prix</span>
                        <span className="font-['JetBrains_Mono',monospace] text-sm font-bold text-white block">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-neutral-400">FCFA</span>
                      </div>

                      <div className="border-x border-neutral-800">
                        <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Gain / Jour</span>
                        <span className="font-['JetBrains_Mono',monospace] text-sm font-bold text-emerald-400 block">
                          +{product.dailyReturn.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-neutral-400">FCFA/J</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-amber-400 uppercase font-semibold block">Total 180J</span>
                        <span className="font-['JetBrains_Mono',monospace] text-sm font-bold text-amber-400 block">
                          {product.totalReturn.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-neutral-400">FCFA</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      {canAfford ? (
                        <button
                          onClick={() => handleConfirmInvestment(product)}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Souscrire ce modèle</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors border border-neutral-700 cursor-pointer"
                          >
                            Détails & Rentabilité
                          </button>
                          <button
                            onClick={onNavigateToDeposit}
                            className="py-2.5 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Recharger</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* My Active Investments View */
        <div className="mx-4 space-y-3">
          {userActiveInvestments.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <Layers className="w-12 h-12 mx-auto text-neutral-600 opacity-60" />
              <h4 className="text-sm font-bold text-white">Aucun contrat actif</h4>
              <p className="text-xs text-neutral-400">
                Vous n'avez pas encore souscrit de pack d'investissement Lexus. Choisissez un modèle pour percevoir des revenus quotidiens.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-2 px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer"
              >
                Parcourir les modèles
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userActiveInvestments.map((inv) => {
                const progressPct = Math.min(100, Math.round((inv.daysElapsed / 180) * 100));
                const totalGainedSoFar = inv.daysElapsed * inv.dailyReturn;

                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase">
                          {inv.productModel}
                        </h4>
                      </div>
                      {inv.isGiftFromAdmin && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
                          Offert VIP
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-neutral-400">
                        {inv.daysRemaining} jours restants
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Progression (180 Jours)</span>
                        <span className="font-mono text-amber-400 font-bold">{inv.daysElapsed} / 180 J ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 text-center">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Montant</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {inv.amount.toLocaleString()} F
                        </span>
                      </div>
                      <div className="border-x border-neutral-800">
                        <span className="text-[10px] text-neutral-400 block">Gain Quotidien</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          +{inv.dailyReturn.toLocaleString()} F/J
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Déjà Perçu</span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {totalGainedSoFar.toLocaleString()} F
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                      <span>Souscrit le : {new Date(inv.startedAt).toLocaleDateString('fr-FR')}</span>
                      <span className="text-emerald-400 font-semibold">Distribution 24h automatique</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Model Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100">
            <div className="relative h-44 w-full bg-neutral-950">
              <img
                src={getProductImage(selectedProduct.imageKey)}
                alt={selectedProduct.modelName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black font-bold uppercase">
                  {selectedProduct.category}
                </span>
                <h3 className="font-['Cinzel',serif] text-xl font-bold text-white uppercase mt-1">
                  {selectedProduct.modelName}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-300 leading-relaxed">
                Le modèle <strong>{selectedProduct.modelName}</strong> génère un dividende journalier fixe de <strong className="text-emerald-400">{selectedProduct.dailyReturn.toLocaleString()} FCFA</strong> chaque jour pendant <strong>180 jours consécutifs</strong>, soit un gain cumulé garanti de <strong className="text-amber-400">{selectedProduct.totalReturn.toLocaleString()} FCFA</strong>.
              </p>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Coût de souscription :</span>
                  <span className="font-bold text-white">{selectedProduct.price.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Période d'amortissement :</span>
                  <span className="text-neutral-200">~{Math.ceil(selectedProduct.price / selectedProduct.dailyReturn)} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Bénéfice net pur :</span>
                  <span className="font-bold text-emerald-400">
                    +{(selectedProduct.totalReturn - selectedProduct.price).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={onNavigateToDeposit}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Recharger le solde</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
