import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Layers,
  Settings,
  History,
  CheckCircle,
  XCircle,
  Play,
  Gift,
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Globe,
  Filter,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Send,
  Link,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { useLexus } from '../context/LexusContext';
import { ALLOWED_COUNTRIES, AllowedCountry, Product, User, MobileNetwork } from '../types';
import { LEXUS_IMAGES } from '../assets/images';

type AdminTab =
  | 'dashboard'
  | 'pending'
  | 'users'
  | 'investments'
  | 'products'
  | 'settings';

export const AdminBackofficeView: React.FC = () => {
  const {
    users,
    products,
    investments,
    deposits,
    withdrawals,
    settings,
    balanceLogs,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    adjustUserBalance,
    giftProductToUser,
    updateProduct,
    addProduct,
    deleteProduct,
    updateSettings,
    runDailyDistribution,
    togglePromoterStatus,
    setIsAdminMode,
    currentUser,
  } = useLexus();

  const [currentTab, setCurrentTab] = useState<AdminTab>('pending');
  const [pendingSubTab, setPendingSubTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);

  if (!currentUser || currentUser.phone !== '77409899' || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-400 space-y-3">
        <ShieldAlert className="w-12 h-12 mx-auto text-red-500" />
        <h3 className="font-bold text-base text-white">Accès Réservé</h3>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          Seul le compte administrateur autorisé (<strong>77409899</strong>) a le droit de voir l'administration.
        </p>
      </div>
    );
  }

  // Balance adjustment modal state
  const [adjustModalUser, setAdjustModalUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustAction, setAdjustAction] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Gift product modal state
  const [giftModalUser, setGiftModalUser] = useState<User | null>(null);
  const [giftProductId, setGiftProductId] = useState<string>(products[0]?.id || '');

  // Edit / Add product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    modelName: '',
    price: 10000,
    dailyReturn: 1600,
    totalReturn: 288000,
    durationDays: 180,
    category: 'SUV',
    imageKey: 'rx',
    tag: 'Édition Spéciale',
    active: true,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Distribution feedback
  const [distributionResult, setDistributionResult] = useState<string | null>(null);

  // Counts
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const totalPending = pendingDeposits.length + pendingWithdrawals.length;

  // Stats calculation
  const totalUsersCount = users.length;
  const totalInvestedAmount = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalDepositedAmount = deposits.filter((d) => d.status === 'approved').reduce((acc, d) => acc + d.amount, 0);
  const totalWithdrawnAmount = withdrawals.filter((w) => w.status === 'approved').reduce((acc, w) => acc + w.netAmount, 0);

  // Country breakdown
  const countryStats = ALLOWED_COUNTRIES.map((c) => {
    const cUsers = users.filter((u) => u.country === c.name);
    const cInvestments = investments.filter((i) => {
      const u = users.find((user) => user.id === i.userId);
      return u?.country === c.name;
    });
    const cDeposits = deposits.filter((d) => d.country === c.name && d.status === 'approved');
    const cWithdrawals = withdrawals.filter((w) => w.country === c.name && w.status === 'approved');

    return {
      name: c.name,
      flag: c.flag,
      code: c.code,
      userCount: cUsers.length,
      investedSum: cInvestments.reduce((sum, inv) => sum + inv.amount, 0),
      depositsSum: cDeposits.reduce((sum, d) => sum + d.amount, 0),
      withdrawalsSum: cWithdrawals.reduce((sum, w) => sum + w.netAmount, 0),
    };
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (countryFilter === 'all') return true;
    return u.country === countryFilter;
  });

  // Handle balance adjustment submit
  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser || adjustAmount <= 0) return;
    const delta = adjustAction === 'add' ? adjustAmount : -adjustAmount;
    adjustUserBalance(adjustModalUser.id, delta, adjustReason.trim());
    setAdjustModalUser(null);
    setAdjustAmount(0);
    setAdjustReason('');
  };

  // Handle gift product submit
  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftModalUser || !giftProductId) return;
    giftProductToUser(giftModalUser.id, giftProductId);
    setGiftModalUser(null);
  };

  // Handle manual 24h daily distribution
  const handleTriggerDailyGains = () => {
    const { distributedCount, totalDistributedAmount } = runDailyDistribution();
    setDistributionResult(
      `Distribution terminée : ${distributedCount} contrat(s) crédité(s) pour un total de ${totalDistributedAmount.toLocaleString()} FCFA. Aucun double versement sur 24h.`
    );
    setTimeout(() => setDistributionResult(null), 5000);
  };

  // Handle save settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Handle save product (create or edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        modelName: productForm.modelName || editingProduct.modelName,
        price: Number(productForm.price) || editingProduct.price,
        dailyReturn: Number(productForm.dailyReturn) || editingProduct.dailyReturn,
        totalReturn: (Number(productForm.dailyReturn) || editingProduct.dailyReturn) * (Number(productForm.durationDays) || 180),
        durationDays: Number(productForm.durationDays) || 180,
        category: (productForm.category as any) || editingProduct.category,
        imageKey: productForm.imageKey || editingProduct.imageKey,
        tag: productForm.tag || editingProduct.tag,
        active: productForm.active ?? editingProduct.active,
      });
      setEditingProduct(null);
    } else if (isAddingProduct) {
      addProduct({
        modelName: productForm.modelName || 'Nouveau Modèle Lexus',
        price: Number(productForm.price) || 10000,
        dailyReturn: Number(productForm.dailyReturn) || 1500,
        totalReturn: (Number(productForm.dailyReturn) || 1500) * (Number(productForm.durationDays) || 180),
        durationDays: Number(productForm.durationDays) || 180,
        category: (productForm.category as any) || 'SUV',
        imageKey: productForm.imageKey || 'rx',
        tag: productForm.tag || 'Lexus VIP',
        active: true,
      });
      setIsAddingProduct(false);
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Admin Top Header with Back to User View button */}
      <div className="mx-4 p-4 rounded-2xl bg-neutral-900 border border-amber-500/50 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Cinzel',serif] text-base font-bold text-white uppercase tracking-wider">
                Backoffice Admin Lexus
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold uppercase">
                Directeur
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Supervision des transactions, utilisateurs et distribution quotidienne
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdminMode(false)}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          Vue Utilisateur
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mx-4 grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs">
        <button
          onClick={() => setCurrentTab('pending')}
          className={`py-2 px-1 rounded-lg font-bold transition-all relative flex flex-col items-center justify-center cursor-pointer ${
            currentTab === 'pending'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>En Attente</span>
          </span>
          {totalPending > 0 && (
            <span
              className={`text-[9px] px-1.5 rounded-full font-black ${
                currentTab === 'pending'
                  ? 'bg-black text-amber-400'
                  : 'bg-red-600 text-white animate-pulse'
              }`}
            >
              {totalPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`py-2 px-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Stats Pays</span>
        </button>

        <button
          onClick={() => setCurrentTab('users')}
          className={`py-2 px-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            currentTab === 'users'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Membres</span>
        </button>

        <button
          onClick={() => setCurrentTab('investments')}
          className={`py-2 px-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            currentTab === 'investments'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Contrats</span>
        </button>

        <button
          onClick={() => setCurrentTab('products')}
          className={`py-2 px-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            currentTab === 'products'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Modèles</span>
        </button>

        <button
          onClick={() => setCurrentTab('settings')}
          className={`py-2 px-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configuration</span>
        </button>
      </div>

      {/* Manual Daily Distribution Trigger Engine Bar (Requirement 10) */}
      <div className="mx-4 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Play className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong className="text-white block font-semibold">Distribution Quotidienne 24h</strong>
            <span className="text-[11px] text-neutral-400">
              Protection active : Aucun contrat n'est crédité plus d'une fois par cycle de 24 heures.
            </span>
          </div>
        </div>

        <button
          onClick={handleTriggerDailyGains}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Lancer les gains du jour</span>
        </button>
      </div>

      {distributionResult && (
        <div className="mx-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{distributionResult}</span>
        </div>
      )}

      {/* TAB 1: DEMANDES EN ATTENTE (Dépôts & Retraits) - Requirement 3 & 4 */}
      {currentTab === 'pending' && (
        <div className="mx-4 space-y-4">
          {/* Sub-tabs for pending deposits and withdrawals */}
          <div className="flex border border-neutral-800 bg-neutral-950 rounded-xl p-1 text-xs">
            <button
              onClick={() => setPendingSubTab('deposits')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                pendingSubTab === 'deposits'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Dépôts à valider</span>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {pendingDeposits.length}
              </span>
            </button>
            <button
              onClick={() => setPendingSubTab('withdrawals')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                pendingSubTab === 'withdrawals'
                  ? 'bg-neutral-800 text-cyan-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Retraits à valider</span>
              <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {pendingWithdrawals.length}
              </span>
            </button>
          </div>

          {/* Pending Deposits List */}
          {pendingSubTab === 'deposits' && (
            <div className="space-y-3">
              {pendingDeposits.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-1">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/50" />
                  <p className="text-sm font-bold text-white">Toutes les recharges sont traitées</p>
                  <p className="text-xs">Aucune demande de dépôt en attente de validation.</p>
                </div>
              ) : (
                pendingDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                          {dep.network}
                        </span>
                        <span className="text-xs text-neutral-300 font-semibold">{dep.country}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(dep.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Dépôt details: Nom, Montant, Numéro, Pays, Preuve */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Nom de l'utilisateur</span>
                        <strong className="text-white">{dep.userName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Montant déclaré</span>
                        <span className="font-mono text-amber-400 font-bold text-sm">
                          +{dep.amount.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Numéro de téléphone</span>
                        <span className="font-mono text-neutral-200">{dep.userPhone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Preuve / Réf SMS</span>
                        <span className="font-mono text-cyan-300">{dep.proofRef || 'Non spécifiée'}</span>
                      </div>
                    </div>

                    {/* Action buttons: Approuver = crédite solde + notif | Rejeter = notif */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => approveDeposit(dep.id, 'Approuvé par Admin après vérification réseau')}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approuver & Créditer</span>
                      </button>
                      <button
                        onClick={() => rejectDeposit(dep.id, 'Transaction non identifiée')}
                        className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 font-bold text-xs transition-colors border border-neutral-700 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Withdrawals List */}
          {pendingSubTab === 'withdrawals' && (
            <div className="space-y-3">
              {pendingWithdrawals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 space-y-1">
                  <CheckCircle className="w-10 h-10 mx-auto text-cyan-500/50" />
                  <p className="text-sm font-bold text-white">Aucun retrait en attente</p>
                  <p className="text-xs">Toutes les demandes de virement sont à jour.</p>
                </div>
              ) : (
                pendingWithdrawals.map((wth) => (
                  <div
                    key={wth.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                          {wth.network}
                        </span>
                        <span className="text-xs text-neutral-300 font-semibold">{wth.country}</span>
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

                    {/* Retrait details: Nom, Montant, Réseau, Numéro, Pays, Date */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Bénéficiaire</span>
                        <strong className="text-white">{wth.userName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Net à Virer</span>
                        <span className="font-mono text-cyan-400 font-bold text-sm">
                          {wth.netAmount.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Numéro de réception</span>
                        <span className="font-mono text-neutral-200">{wth.userPhone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Brut & Frais 15%</span>
                        <span className="font-mono text-neutral-400">
                          {wth.amount.toLocaleString()} F (-{wth.feeAmount.toLocaleString()} F)
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Approuver = confirme débit + notif | Rejeter = rembourse solde + notif */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => approveWithdrawal(wth.id, 'Virement Mobile Money exécuté avec succès')}
                        className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirmer l'envoi du virement</span>
                      </button>
                      <button
                        onClick={() => rejectWithdrawal(wth.id, 'Numéro incorrect ou réseau injoignable')}
                        className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 font-bold text-xs transition-colors border border-neutral-700 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Rejeter (Rembourser)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TABLEAU DE BORD & STATS PAR PAYS (Requirement 7.1) */}
      {currentTab === 'dashboard' && (
        <div className="mx-4 space-y-4">
          {/* Key Overall Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total Utilisateurs</span>
              <span className="font-mono text-xl font-bold text-white mt-1 block">{totalUsersCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Total Investi</span>
              <span className="font-mono text-xl font-bold text-amber-400 mt-1 block">
                {totalInvestedAmount.toLocaleString()} F
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Total Dépôts Validés</span>
              <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">
                {totalDepositedAmount.toLocaleString()} F
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
              <span className="text-[10px] text-cyan-400 uppercase font-semibold block">Total Retraits Versés</span>
              <span className="font-mono text-xl font-bold text-cyan-400 mt-1 block">
                {totalWithdrawnAmount.toLocaleString()} F
              </span>
            </div>
          </div>

          {/* Breakdown per authorized country: Bénin, Cameroun, Côte d'Ivoire, Burkina Faso, Niger */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <h3 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase tracking-wider">
                Statistiques par Pays Autorisé (5 Pays)
              </h3>
            </div>

            <div className="space-y-2.5">
              {countryStats.map((cs) => (
                <div
                  key={cs.name}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{cs.flag}</span>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <span>{cs.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">({cs.code})</span>
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        {cs.userCount} membre(s) enregistré(s)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-right font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-neutral-400 block font-sans">Investi</span>
                      <span className="text-amber-400 font-bold">{cs.investedSum.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block font-sans">Dépôts</span>
                      <span className="text-emerald-400 font-bold">{cs.depositsSum.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block font-sans">Retraits</span>
                      <span className="text-cyan-400 font-bold">{cs.withdrawalsSum.toLocaleString()} F</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GESTION UTILISATEURS (avec filtre pays, détails, ajuster solde, offrir pack) */}
      {currentTab === 'users' && (
        <div className="mx-4 space-y-3">
          {/* Country filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setCountryFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap ${
                countryFilter === 'all'
                  ? 'bg-amber-500 text-black'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Tous les pays ({users.length})
            </button>
            {ALLOWED_COUNTRIES.map((c) => (
              <button
                key={c.name}
                onClick={() => setCountryFilter(c.name)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  countryFilter === c.name
                    ? 'bg-amber-500 text-black'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Users List */}
          <div className="space-y-2.5">
            {filteredUsers.map((u) => {
              const uInvestments = investments.filter((i) => i.userId === u.id && i.active);

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{u.fullName}</h4>
                        {u.isPromoter && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                            Promoteur
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">
                        {u.country} · {u.countryCode} {u.phone}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs uppercase text-neutral-400 block">Solde</span>
                      <span className="font-mono text-base font-bold text-amber-400">
                        {u.balance.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Quick stats for this user */}
                  <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2 rounded-xl text-center text-[10px] font-mono border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 block font-sans">Gains</span>
                      <span className="text-emerald-400 font-bold">+{u.totalEarnings.toLocaleString()} F</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block font-sans">Packs Actifs</span>
                      <span className="text-white font-bold">{uInvestments.length}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block font-sans">Code Parrain</span>
                      <span className="text-amber-400 font-bold">{u.referralCode}</span>
                    </div>
                  </div>

                  {/* Actions for User */}
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-800 text-xs">
                    <button
                      onClick={() => setSelectedUserDetail(u)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détails Compte</span>
                    </button>

                    <button
                      onClick={() => {
                        setAdjustModalUser(u);
                        setAdjustAmount(1000);
                        setAdjustAction('add');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Ajuster Solde (+ / -)</span>
                    </button>

                    <button
                      onClick={() => {
                        setGiftModalUser(u);
                        setGiftProductId(products[0]?.id || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500 hover:text-white font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Offrir un Produit</span>
                    </button>

                    <button
                      onClick={() => togglePromoterStatus(u.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white font-medium cursor-pointer"
                    >
                      {u.isPromoter ? 'Retirer Promoteur' : 'Passer Promoteur'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: HISTORIQUE DES INVESTISSEMENTS (Nom, Téléphone, Modèle, Date et Heure) - Requirement 7.9 */}
      {currentTab === 'investments' && (
        <div className="mx-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-['Cinzel',serif] text-xs font-bold text-white uppercase tracking-wider">
              Historique Global des Investissements ({investments.length})
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">
              Total : {investments.reduce((acc, i) => acc + i.amount, 0).toLocaleString()} FCFA
            </span>
          </div>

          <div className="space-y-2.5">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{inv.userName}</strong>
                    <span className="text-neutral-400 font-mono">({inv.userPhone})</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    inv.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {inv.active ? 'Actif' : 'Terminé'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-[11px] font-mono">
                  <div>
                    <span className="text-neutral-400 block font-sans text-[9px]">Modèle Lexus</span>
                    <strong className="text-amber-400 font-sans">{inv.productModel}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-sans text-[9px]">Montant</span>
                    <span className="text-white font-bold">{inv.amount.toLocaleString()} FCFA</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-sans text-[9px]">Gain / Jour</span>
                    <span className="text-emerald-400 font-bold">+{inv.dailyReturn.toLocaleString()} F/J</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block font-sans text-[9px]">Date et Heure</span>
                    <span className="text-neutral-300">
                      {new Date(inv.startedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Jours : {inv.daysElapsed} écoulés / {inv.daysRemaining} restants (180j)</span>
                  {inv.isGiftFromAdmin && (
                    <span className="text-purple-400 font-semibold">Offert par la direction</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GESTION PRODUITS CRUD (Requirement 7.4) */}
      {currentTab === 'products' && (
        <div className="mx-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Cinzel',serif] text-xs font-bold text-white uppercase tracking-wider">
              Gestion du Catalogue Lexus ({products.length})
            </h3>
            <button
              onClick={() => {
                setIsAddingProduct(true);
                setEditingProduct(null);
                setProductForm({
                  modelName: 'Lexus RX 350 Luxury',
                  price: 20000,
                  dailyReturn: 3200,
                  durationDays: 180,
                  category: 'SUV',
                  imageKey: 'rx',
                  tag: 'Nouveauté',
                  active: true,
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-amber-400"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un modèle</span>
            </button>
          </div>

          {/* Form when adding or editing */}
          {(isAddingProduct || editingProduct) && (
            <form onSubmit={handleSaveProduct} className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/50 shadow-xl space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-400 text-sm">
                  {editingProduct ? `Modifier : ${editingProduct.modelName}` : 'Créer un nouveau produit'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-semibold block">Nom du Modèle</label>
                  <input
                    type="text"
                    required
                    value={productForm.modelName || ''}
                    onChange={(e) => setProductForm({ ...productForm, modelName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-semibold block">Prix de souscription (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price || 0}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-semibold block">Gain Quotidien (FCFA / Jour)</label>
                  <input
                    type="number"
                    required
                    value={productForm.dailyReturn || 0}
                    onChange={(e) => setProductForm({ ...productForm, dailyReturn: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-emerald-400 font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 uppercase font-semibold block">Durée en jours (Par défaut : 180)</label>
                  <input
                    type="number"
                    required
                    value={productForm.durationDays || 180}
                    onChange={(e) => setProductForm({ ...productForm, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 cursor-pointer"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* Products List */}
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{p.modelName}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 bg-neutral-800 text-neutral-300 rounded">
                      {p.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 font-mono text-neutral-300 text-[11px]">
                    <span>Prix : <strong className="text-white">{p.price.toLocaleString()} F</strong></span>
                    <span>Gain : <strong className="text-emerald-400">+{p.dailyReturn.toLocaleString()} F/J</strong></span>
                    <span>Total 180J : <strong className="text-amber-400">{p.totalReturn.toLocaleString()} F</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProductForm(p);
                    }}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                    title="Modifier ce produit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-neutral-400 cursor-pointer"
                    title="Supprimer ce produit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURATION (Lien de Paiement, Liens Telegram, Taux Parrainage) - Requirement 7.5, 7.6, 7.7 */}
      {currentTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="mx-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <h3 className="font-['Cinzel',serif] text-sm font-bold text-white uppercase tracking-wider">
                Paramètres Système & Intégrations
              </h3>
            </div>
            {settingsSaved && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Enregistré !</span>
              </span>
            )}
          </div>

          {/* Lien de Paiement Mobile Money (Requirement 7.5) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-amber-400" />
              <span>Lien de Paiement Mobile Money</span>
            </label>
            <input
              type="url"
              required
              value={settingsForm.paymentUrl}
              onChange={(e) => setSettingsForm({ ...settingsForm, paymentUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 font-mono text-xs outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-400">
              Ce lien est ouvert lorsque l'utilisateur clique sur "Payer" (non visible en clair sur le site).
            </p>
          </div>

          {/* Canal Telegram Officiel (Requirement 7.6) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#0088cc]" />
              <span>Lien du Canal Telegram Officiel</span>
            </label>
            <input
              type="url"
              required
              value={settingsForm.telegramChannelUrl}
              onChange={(e) => setSettingsForm({ ...settingsForm, telegramChannelUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 font-mono text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* Lien Telegram du Popup Info */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Lien Telegram Popup Information (Bouton Bleu)</span>
            </label>
            <input
              type="url"
              required
              value={settingsForm.telegramInfoPopupUrl}
              onChange={(e) => setSettingsForm({ ...settingsForm, telegramInfoPopupUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 font-mono text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* Gestion Parrainage : 25% / 3% / 2% (Requirement 7.7) */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Taux de Commissions d'Affiliation
            </label>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-amber-400 font-bold block">Niveau 1 (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settingsForm.referralLevel1Pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, referralLevel1Pct: Number(e.target.value) })}
                  className="w-full text-center px-2 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 font-bold block">Niveau 2 (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settingsForm.referralLevel2Pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, referralLevel2Pct: Number(e.target.value) })}
                  className="w-full text-center px-2 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-purple-400 font-bold block">Niveau 3 (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settingsForm.referralLevel3Pct}
                  onChange={(e) => setSettingsForm({ ...settingsForm, referralLevel3Pct: Number(e.target.value) })}
                  className="w-full text-center px-2 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Retraits et bonus */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800">
            <div>
              <span className="text-[10px] text-neutral-400 block">Frais Retrait (%)</span>
              <input
                type="number"
                value={settingsForm.withdrawalFeePct}
                onChange={(e) => setSettingsForm({ ...settingsForm, withdrawalFeePct: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Min. Retrait (F)</span>
              <input
                type="number"
                value={settingsForm.minWithdrawal}
                onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawal: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
              />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block">Bonus Inscription (F)</span>
              <input
                type="number"
                value={settingsForm.welcomeBonusAmount}
                onChange={(e) => setSettingsForm({ ...settingsForm, welcomeBonusAmount: Number(e.target.value) })}
                className="w-full px-2 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Enregistrer les modifications
          </button>
        </form>
      )}

      {/* MODAL 1: AJUSTER LE SOLDE (Requirement 7.8) */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 text-neutral-100 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="font-bold text-sm text-white">
                Ajuster Solde : {adjustModalUser.fullName}
              </h4>
              <button onClick={() => setAdjustModalUser(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBalanceSubmit} className="space-y-3">
              <div>
                <span className="text-neutral-400 block text-[11px]">Solde actuel :</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {adjustModalUser.balance.toLocaleString()} FCFA
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('add')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    adjustAction === 'add'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  + Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('subtract')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
                    adjustAction === 'subtract'
                      ? 'bg-red-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  - Retirer
                </button>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block text-[11px]">Montant (FCFA)</label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono text-base outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block text-[11px]">Motif / Raison</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Récompense promotionnelle, régularisation..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer"
              >
                Confirmer l'ajustement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFRIR UN PRODUIT AUX PROMOTEURS (Requirement 7.12) */}
      {giftModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 text-neutral-100 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-sm text-white">
                  Offrir un Pack Lexus
                </h4>
              </div>
              <button onClick={() => setGiftModalUser(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGiftSubmit} className="space-y-3">
              <p className="text-neutral-300">
                Bénéficiaire : <strong className="text-white">{giftModalUser.fullName}</strong> ({giftModalUser.country})
              </p>

              <div>
                <label className="text-neutral-300 font-semibold block text-[11px] mb-1">
                  Sélectionnez le modèle Lexus à offrir :
                </label>
                <select
                  value={giftProductId}
                  onChange={(e) => setGiftProductId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white outline-none focus:border-amber-500 text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.modelName} — {p.price.toLocaleString()} FCFA (+{p.dailyReturn.toLocaleString()} F/J)
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-neutral-400 leading-snug">
                Ce pack sera activé immédiatement avec 0 FCFA débité. L'utilisateur commencera à percevoir les rendements quotidiens dès le prochain cycle.
              </p>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
              >
                Valider l'attribution du cadeau
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VOIR LE COMPTE UTILISATEUR TOUT EN DÉTAILS (Requirement 7.11) */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-5 text-neutral-100 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Détails Compte Client</h4>
                <p className="text-[11px] text-neutral-400 font-mono">ID : {selectedUserDetail.id}</p>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Nom :</span>
                  <span className="text-white font-bold font-sans">{selectedUserDetail.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Téléphone :</span>
                  <span className="text-white">{selectedUserDetail.countryCode} {selectedUserDetail.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Pays :</span>
                  <span className="text-white font-sans">{selectedUserDetail.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Code Parrainage :</span>
                  <span className="text-amber-400 font-bold">{selectedUserDetail.referralCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Inscrit par :</span>
                  <span className="text-neutral-300">{selectedUserDetail.referredBy || 'Aucun (Direct)'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-sans block">Solde Actuel</span>
                  <span className="font-bold text-amber-400 text-sm">{selectedUserDetail.balance.toLocaleString()} F</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-sans block">Total Dividendes</span>
                  <span className="font-bold text-emerald-400 text-sm">+{selectedUserDetail.totalEarnings.toLocaleString()} F</span>
                </div>
              </div>

              {/* User active contracts list */}
              <div>
                <span className="text-neutral-400 font-sans font-semibold block text-[11px] mb-1">
                  Contrats d'investissement souscrits :
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {investments.filter((i) => i.userId === selectedUserDetail.id).length === 0 ? (
                    <p className="text-neutral-400 text-[11px] italic font-sans">Aucun pack souscrit.</p>
                  ) : (
                    investments
                      .filter((i) => i.userId === selectedUserDetail.id)
                      .map((inv) => (
                        <div key={inv.id} className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between text-[10px]">
                          <div>
                            <span className="font-sans font-bold text-white block">{inv.productModel}</span>
                            <span className="text-neutral-400">{inv.daysElapsed}/180 jours</span>
                          </div>
                          <div className="text-right">
                            <span className="text-amber-400">{inv.amount.toLocaleString()} F</span>
                            <span className="block text-emerald-400">+{inv.dailyReturn.toLocaleString()} F/J</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUserDetail(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
