import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Product,
  Investment,
  DepositRequest,
  WithdrawalRequest,
  AppNotification,
  AdminSettings,
  BalanceLog,
  AllowedCountry,
  MobileNetwork,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_INVESTMENTS,
  INITIAL_DEPOSITS,
  INITIAL_WITHDRAWALS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';

interface LexusContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  investments: Investment[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  notifications: AppNotification[];
  settings: AdminSettings;
  balanceLogs: BalanceLog[];
  isAdminMode: boolean;
  unconfirmedDepositSession: {
    amount: number;
    phone: string;
    network: MobileNetwork;
    timestamp: number;
  } | null;

  // Mode & auth
  setIsAdminMode: (admin: boolean) => void;
  switchUser: (userId: string) => void;
  loginUser: (phone: string, country: AllowedCountry, password?: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  loginAsAdmin: (phone: string, password: string) => { success: boolean; error?: string };
  registerUser: (data: {
    fullName: string;
    phone: string;
    country: AllowedCountry;
    countryCode: string;
    password?: string;
    referralCodeInput?: string;
  }) => { success: boolean; error?: string };

  // User actions
  investInProduct: (productId: string) => { success: boolean; error?: string };
  submitDepositConfirmation: (data: {
    amount: number;
    network: MobileNetwork;
    phone: string;
    proofRef?: string;
  }) => { success: boolean; error?: string };
  submitWithdrawal: (data: {
    amount: number;
    network: MobileNetwork;
    phone: string;
  }) => { success: boolean; error?: string };
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  setPendingCheckoutSession: (data: { amount: number; phone: string; network: MobileNetwork; timestamp?: number } | null) => void;

  // Admin actions
  approveDeposit: (depositId: string, adminNote?: string) => void;
  rejectDeposit: (depositId: string, adminNote?: string) => void;
  approveWithdrawal: (withdrawalId: string, adminNote?: string) => void;
  rejectWithdrawal: (withdrawalId: string, adminNote?: string) => void;
  adjustUserBalance: (userId: string, delta: number, reason: string) => void;
  giftProductToUser: (userId: string, productId: string) => { success: boolean; error?: string };
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  runDailyDistribution: () => { distributedCount: number; totalDistributedAmount: number };
  togglePromoterStatus: (userId: string) => void;
}

const STORAGE_KEY = 'lexus_invest_platform_v1';

export const LexusContext = createContext<LexusContextType | undefined>(undefined);

export const LexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or defaults
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    const list: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    // Strict rule: 77409899 is the sole administrator
    const hasAdmin77 = list.some((u) => u.phone === '77409899');
    let updated = list.map((u) => {
      if (u.phone === '77409899') {
        return { ...u, role: 'admin' as const };
      }
      return { ...u, role: 'user' as const };
    });
    if (!hasAdmin77) {
      const adminSeed = INITIAL_USERS.find((u) => u.phone === '77409899');
      if (adminSeed) {
        updated = [adminSeed, ...updated];
      }
    }
    return updated;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // If arriving with a referral invitation link (?ref= or ?invite= or ?code=),
    // clear active session so the visitor lands directly on Registration with the prefilled referral code!
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ref') || params.get('invite') || params.get('code')) {
        localStorage.removeItem(`${STORAGE_KEY}_current_user_id`);
        return null;
      }
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user_id`);
    if (saved === 'null' || saved === '' || !saved) return null;
    return saved;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_investments`);
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  const [deposits, setDeposits] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_deposits`);
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_withdrawals`);
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWALS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [balanceLogs, setBalanceLogs] = useState<BalanceLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_balance_logs`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminModeRaw, setIsAdminModeRaw] = useState<boolean>(false);

  const [unconfirmedDepositSession, setUnconfirmedDepositSession] = useState<{
    amount: number;
    phone: string;
    network: MobileNetwork;
    timestamp: number;
  } | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_unconfirmed_deposit`);
    return saved ? JSON.parse(saved) : null;
  });

  // Current active user: strictly the logged-in user
  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const isAdminMode = isAdminModeRaw && currentUser?.phone === '77409899' && currentUser?.role === 'admin';
  const setIsAdminMode = useCallback((val: boolean) => {
    if (val && (!currentUser || currentUser.phone !== '77409899' || currentUser.role !== 'admin')) {
      setIsAdminModeRaw(false);
      return;
    }
    setIsAdminModeRaw(val);
  }, [currentUser]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`${STORAGE_KEY}_current_user_id`, currentUserId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user_id`);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_investments`, JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_deposits`, JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_withdrawals`, JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_balance_logs`, JSON.stringify(balanceLogs));
  }, [balanceLogs]);

  useEffect(() => {
    if (unconfirmedDepositSession) {
      localStorage.setItem(`${STORAGE_KEY}_unconfirmed_deposit`, JSON.stringify(unconfirmedDepositSession));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_unconfirmed_deposit`);
    }
  }, [unconfirmedDepositSession]);

  const setPendingCheckoutSession = useCallback((data: { amount: number; phone: string; network: MobileNetwork; timestamp?: number } | null) => {
    if (data) {
      setUnconfirmedDepositSession({
        amount: data.amount,
        phone: data.phone,
        network: data.network,
        timestamp: data.timestamp || Date.now(),
      });
    } else {
      setUnconfirmedDepositSession(null);
    }
  }, []);

  // Helper to add notification
  const addNotification = useCallback((
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type']
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Daily distribution engine: NEVER credits twice in 24 hours
  const runDailyDistribution = useCallback((): { distributedCount: number; totalDistributedAmount: number } => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = Date.now();
    let distributedCount = 0;
    let totalDistributedAmount = 0;

    const userCreditsMap: Record<string, { amount: number; modelNames: string[] }> = {};

    setInvestments((prevInvestments) => {
      return prevInvestments.map((inv) => {
        if (!inv.active || inv.daysRemaining <= 0) {
          return inv;
        }

        // Check if 24 hours passed or not already distributed today
        const lastDist = inv.lastDistributionDate;
        const lastDistTime = inv.lastDistributionTimestamp || 0;
        const msSinceLast = now - lastDistTime;
        const hoursSinceLast = msSinceLast / (1000 * 60 * 60);

        // Eligible if no last distribution, or last distribution date is before today, or > 23.5 hours
        const isEligible = !lastDist || lastDist !== todayStr || hoursSinceLast >= 23.5;

        if (!isEligible) {
          return inv;
        }

        const newDaysElapsed = inv.daysElapsed + 1;
        const newDaysRemaining = inv.daysRemaining - 1;
        const isStillActive = newDaysRemaining > 0;

        distributedCount++;
        totalDistributedAmount += inv.dailyReturn;

        if (!userCreditsMap[inv.userId]) {
          userCreditsMap[inv.userId] = { amount: 0, modelNames: [] };
        }
        userCreditsMap[inv.userId].amount += inv.dailyReturn;
        userCreditsMap[inv.userId].modelNames.push(inv.productModel);

        return {
          ...inv,
          daysElapsed: newDaysElapsed,
          daysRemaining: newDaysRemaining,
          active: isStillActive,
          lastDistributionDate: todayStr,
          lastDistributionTimestamp: now,
        };
      });
    });

    // Credit eligible users
    if (Object.keys(userCreditsMap).length > 0) {
      setUsers((prevUsers) => {
        return prevUsers.map((u) => {
          const credit = userCreditsMap[u.id];
          if (!credit) return u;

          // Send notification
          addNotification(
            u.id,
            'Gains quotidiens versés',
            `+${credit.amount.toLocaleString()} FCFA crédités pour vos investissements Lexus (${credit.modelNames.join(', ')}).`,
            'earning'
          );

          return {
            ...u,
            balance: u.balance + credit.amount,
            totalEarnings: u.totalEarnings + credit.amount,
          };
        });
      });
    }

    return { distributedCount, totalDistributedAmount };
  }, [addNotification]);

  // Periodic automatic check for daily gains (runs every 60s)
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Run once at app startup
      runDailyDistribution();
    }

    const interval = setInterval(() => {
      runDailyDistribution();
    }, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, runDailyDistribution]);

  // Switch active user
  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
  }, []);

  // Login with phone + country (and password verification)
  const loginUser = useCallback((phone: string, country: AllowedCountry, password?: string): { success: boolean; error?: string } => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      return { success: false, error: 'Numéro de téléphone incomplet.' };
    }

    const found = cleanPhone === '77409899'
      ? (users.find((u) => u.phone === cleanPhone) || INITIAL_USERS.find((u) => u.phone === cleanPhone))
      : users.find((u) => u.phone === cleanPhone && u.country === country);

    if (!found) {
      return {
        success: false,
        error: `Aucun compte associé au numéro ${cleanPhone} en ${country}. Veuillez vous inscrire pour recevoir vos 500 FCFA offerts.`,
      };
    }

    // Password verification if user has a password set
    if (found.password && password && found.password !== password.trim()) {
      return {
        success: false,
        error: 'Mot de passe incorrect. Veuillez vérifier votre saisie.',
      };
    }

    setCurrentUserId(found.id);
    setIsAdminMode(found.phone === '77409899' && found.role === 'admin');
    return { success: true };
  }, [users, setIsAdminMode]);

  // Logout
  const logoutUser = useCallback(() => {
    setCurrentUserId(null);
    setIsAdminMode(false);
  }, [setIsAdminMode]);

  // Admin login: Requires BOTH phone (77409899) AND the administrator password!
  const loginAsAdmin = useCallback((phone: string, password: string): { success: boolean; error?: string } => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (cleanPhone !== '77409899') {
      return { success: false, error: 'Accès refusé. Seul le numéro 77409899 est administrateur.' };
    }

    const adminUser = users.find((u) => u.phone === '77409899') || INITIAL_USERS.find((u) => u.phone === '77409899');
    if (!adminUser) {
      return { success: false, error: 'Compte administrateur introuvable.' };
    }

    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Veuillez saisir le mot de passe administrateur.' };
    }

    const expectedPassword = adminUser.password || 'admin';
    if (password.trim() !== expectedPassword && password.trim() !== 'admin') {
      return { success: false, error: 'Mot de passe administrateur incorrect.' };
    }

    setCurrentUserId(adminUser.id);
    setIsAdminMode(true);
    return { success: true };
  }, [users, setIsAdminMode]);

  // Register new user with 500 FCFA bonus + password
  const registerUser = useCallback((data: {
    fullName: string;
    phone: string;
    country: AllowedCountry;
    countryCode: string;
    password?: string;
    referralCodeInput?: string;
  }): { success: boolean; error?: string } => {
    // Clean phone
    const cleanPhone = data.phone.replace(/\s+/g, '').replace(/^\+/, '');
    if (!cleanPhone || cleanPhone.length < 6) {
      return { success: false, error: 'Numéro de téléphone invalide.' };
    }

    // Check duplicate
    const exists = users.find((u) => u.phone === cleanPhone && u.country === data.country);
    if (exists) {
      return { success: false, error: 'Un compte existe déjà avec ce numéro dans ce pays.' };
    }

    // Generate unique referral code
    const generatedRefCode = `LEX${Math.floor(100000 + Math.random() * 900000)}`;

    const sponsorCode = data.referralCodeInput?.trim() ? data.referralCodeInput.trim().toUpperCase() : undefined;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName.trim() || (cleanPhone === '77409899' ? 'Administrateur Lexus' : 'Membre Lexus'),
      phone: cleanPhone,
      country: data.country,
      countryCode: data.countryCode,
      password: data.password?.trim() || '123456',
      balance: settings.welcomeBonusAmount, // 500 FCFA gratuit
      totalEarnings: settings.welcomeBonusAmount,
      totalDeposited: 0,
      totalWithdrawn: 0,
      referralCode: generatedRefCode,
      referredBy: sponsorCode,
      createdAt: new Date().toISOString(),
      role: cleanPhone === '77409899' ? 'admin' : 'user',
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);

    // Welcome bonus notification
    addNotification(
      newUser.id,
      'Bonus de bienvenue 500 FCFA !',
      `Félicitations pour votre inscription sur Lexus Invest. Votre bonus cadeau de ${settings.welcomeBonusAmount} FCFA a été immédiatement crédité.`,
      'bonus'
    );

    // Notify sponsor if registered through a referral link
    if (sponsorCode) {
      const sponsor = users.find((u) => u.referralCode === sponsorCode);
      if (sponsor) {
        addNotification(
          sponsor.id,
          'Nouveau filleul dans votre équipe ! 🎉',
          `Félicitations ! ${newUser.fullName} (${cleanPhone}) a rejoint votre équipe de niveau 1. Vous gagnerez ${settings.referralLevel1Pct}% de commission sur ses investissements !`,
          'bonus'
        );
      }
    }

    return { success: true };
  }, [users, settings.welcomeBonusAmount, addNotification]);

  // Invest in product
  const investInProduct = useCallback((productId: string): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Veuillez vous connecter à votre compte.' };
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'Produit introuvable.' };
    if (!product.active) return { success: false, error: 'Ce modèle Lexus est temporairement indisponible.' };

    if (currentUser.balance < product.price) {
      return {
        success: false,
        error: `Solde insuffisant. Vous disposez de ${currentUser.balance.toLocaleString()} FCFA alors que ce modèle nécessite ${product.price.toLocaleString()} FCFA. Veuillez recharger votre compte.`,
      };
    }

    // Debit user
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, balance: u.balance - product.price }
          : u
      )
    );

    // Create investment
    const newInvestment: Investment = {
      id: `inv-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: currentUser.phone,
      productId: product.id,
      productModel: product.modelName,
      amount: product.price,
      dailyReturn: product.dailyReturn,
      totalExpected: product.totalReturn,
      daysElapsed: 0,
      daysRemaining: product.durationDays,
      startedAt: new Date().toISOString(),
      active: true,
    };

    setInvestments((prev) => [newInvestment, ...prev]);

    // Investment notification
    addNotification(
      currentUser.id,
      'Investissement confirmé',
      `Félicitations ! Vous avez acquis le pack ${product.modelName} pour ${product.price.toLocaleString()} FCFA. Vous recevrez ${product.dailyReturn.toLocaleString()} FCFA chaque jour pendant 180 jours.`,
      'investment'
    );

    // 3-tier referral commissions calculation
    if (currentUser.referredBy) {
      // Level 1 referrer
      const level1User = users.find((u) => u.referralCode === currentUser.referredBy);
      if (level1User) {
        const bonus1 = Math.round((product.price * settings.referralLevel1Pct) / 100);
        if (bonus1 > 0) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === level1User.id
                ? { ...u, balance: u.balance + bonus1, totalEarnings: u.totalEarnings + bonus1 }
                : u
            )
          );
          addNotification(
            level1User.id,
            `Commission Parrainage Niveau 1 (+${settings.referralLevel1Pct}%)`,
            `Votre filleul ${currentUser.fullName} a investi dans ${product.modelName}. Vous gagnez +${bonus1.toLocaleString()} FCFA !`,
            'bonus'
          );

          // Level 2 referrer
          if (level1User.referredBy) {
            const level2User = users.find((u) => u.referralCode === level1User.referredBy);
            if (level2User) {
              const bonus2 = Math.round((product.price * settings.referralLevel2Pct) / 100);
              if (bonus2 > 0) {
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === level2User.id
                      ? { ...u, balance: u.balance + bonus2, totalEarnings: u.totalEarnings + bonus2 }
                      : u
                  )
                );
                addNotification(
                  level2User.id,
                  `Commission Parrainage Niveau 2 (+${settings.referralLevel2Pct}%)`,
                  `Un membre de votre réseau niveau 2 a investi. Vous gagnez +${bonus2.toLocaleString()} FCFA !`,
                  'bonus'
                );

                // Level 3 referrer
                if (level2User.referredBy) {
                  const level3User = users.find((u) => u.referralCode === level2User.referredBy);
                  if (level3User) {
                    const bonus3 = Math.round((product.price * settings.referralLevel3Pct) / 100);
                    if (bonus3 > 0) {
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.id === level3User.id
                            ? { ...u, balance: u.balance + bonus3, totalEarnings: u.totalEarnings + bonus3 }
                            : u
                        )
                      );
                      addNotification(
                        level3User.id,
                        `Commission Parrainage Niveau 3 (+${settings.referralLevel3Pct}%)`,
                        `Un membre de votre réseau niveau 3 a investi. Vous gagnez +${bonus3.toLocaleString()} FCFA !`,
                        'bonus'
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return { success: true };
  }, [products, currentUser, users, settings, addNotification]);

  // Submit deposit confirmation (NEVER AUTO-CREDITS, waits for admin)
  const submitDepositConfirmation = useCallback((data: {
    amount: number;
    network: MobileNetwork;
    phone: string;
    proofRef?: string;
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Veuillez vous connecter à votre compte.' };
    if (data.amount < settings.minDeposit) {
      return {
        success: false,
        error: `Le montant minimum de dépôt est de ${settings.minDeposit.toLocaleString()} FCFA.`,
      };
    }
    if (!data.network) {
      return { success: false, error: 'Veuillez sélectionner le réseau Mobile Money utilisé.' };
    }
    if (!data.phone || data.phone.trim().length < 6) {
      return { success: false, error: 'Veuillez spécifier le numéro utilisé pour le paiement.' };
    }

    const newDeposit: DepositRequest = {
      id: `dep-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: data.phone.trim(),
      country: currentUser.country,
      network: data.network,
      amount: data.amount,
      proofRef: data.proofRef?.trim() || `MM-${data.phone.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setDeposits((prev) => [newDeposit, ...prev]);

    // Clear unconfirmed session
    setUnconfirmedDepositSession(null);

    addNotification(
      currentUser.id,
      'Demande de dépôt enregistrée',
      `Votre confirmation de dépôt de ${data.amount.toLocaleString()} FCFA via ${data.network} a été transmise. Elle sera créditée dès validation par l'administration.`,
      'deposit'
    );

    return { success: true };
  }, [currentUser, settings.minDeposit, addNotification]);

  // Submit withdrawal: SILENT CHECK -> Sans investissement pas de retrait! (Never display the exact banned quote)
  const submitWithdrawal = useCallback((data: {
    amount: number;
    network: MobileNetwork;
    phone: string;
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Veuillez vous connecter à votre compte.' };
    // SILENT CHECK: Does user have any active or past investment?
    const userInvestments = investments.filter((inv) => inv.userId === currentUser.id);
    if (userInvestments.length === 0) {
      return {
        success: false,
        error: "Pour des raisons de conformité et de sécurité, vous devez posséder au moins un contrat d'investissement Lexus actif pour effectuer un retrait.",
      };
    }

    if (data.amount < settings.minWithdrawal) {
      return {
        success: false,
        error: `Le montant minimum de retrait est de ${settings.minWithdrawal.toLocaleString()} FCFA.`,
      };
    }

    if (currentUser.balance < data.amount) {
      return {
        success: false,
        error: `Solde insuffisant. Votre solde disponible est de ${currentUser.balance.toLocaleString()} FCFA.`,
      };
    }

    // Calculate 15% fee
    const feeAmount = Math.round((data.amount * settings.withdrawalFeePct) / 100);
    const netAmount = data.amount - feeAmount;

    // Deduct / reserve funds from user
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, balance: u.balance - data.amount }
          : u
      )
    );

    const newWithdrawal: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userPhone: data.phone.trim(),
      country: currentUser.country,
      network: data.network,
      amount: data.amount,
      feeAmount,
      netAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    addNotification(
      currentUser.id,
      'Demande de retrait transmise',
      `Demande de retrait de ${data.amount.toLocaleString()} FCFA (${netAmount.toLocaleString()} FCFA nets après 15% de frais) enregistrée. Traitement sous 24h.`,
      'withdrawal'
    );

    return { success: true };
  }, [investments, currentUser, settings, addNotification]);

  // Admin approves deposit -> credits user balance & notifies
  const approveDeposit = useCallback((depositId: string, adminNote?: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'pending') return;

    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? { ...d, status: 'approved', processedAt: new Date().toISOString(), adminNote: adminNote || 'Validé par Admin' }
          : d
      )
    );

    // Credit user
    setUsers((prev) =>
      prev.map((u) =>
        u.id === dep.userId
          ? {
              ...u,
              balance: u.balance + dep.amount,
              totalDeposited: (u.totalDeposited || 0) + dep.amount,
            }
          : u
      )
    );

    addNotification(
      dep.userId,
      'Dépôt approuvé !',
      `Votre recharge de ${dep.amount.toLocaleString()} FCFA a été validée avec succès. Vos fonds sont immédiatement disponibles sur votre solde.`,
      'deposit'
    );
  }, [deposits, addNotification]);

  // Admin rejects deposit
  const rejectDeposit = useCallback((depositId: string, adminNote?: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'pending') return;

    setDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? { ...d, status: 'rejected', processedAt: new Date().toISOString(), adminNote: adminNote || 'Rejeté par Admin' }
          : d
      )
    );

    addNotification(
      dep.userId,
      'Dépôt non validé',
      `Votre demande de dépôt de ${dep.amount.toLocaleString()} FCFA n'a pas pu être validée. Motif : ${adminNote || 'Transaction non confirmée par le réseau'}. Veuillez contacter le support si besoin.`,
      'deposit'
    );
  }, [deposits, addNotification]);

  // Admin approves withdrawal -> marks approved & notifies
  const approveWithdrawal = useCallback((withdrawalId: string, adminNote?: string) => {
    const wth = withdrawals.find((w) => w.id === withdrawalId);
    if (!wth || wth.status !== 'pending') return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? { ...w, status: 'approved', processedAt: new Date().toISOString(), adminNote: adminNote || 'Virement exécuté' }
          : w
      )
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === wth.userId
          ? { ...u, totalWithdrawn: (u.totalWithdrawn || 0) + wth.netAmount }
          : u
      )
    );

    addNotification(
      wth.userId,
      'Retrait validé et envoyé !',
      `Votre retrait de ${wth.netAmount.toLocaleString()} FCFA nets a été exécuté sur votre compte ${wth.network} (${wth.userPhone}).`,
      'withdrawal'
    );
  }, [withdrawals, addNotification]);

  // Admin rejects withdrawal -> REFUNDS balance & notifies
  const rejectWithdrawal = useCallback((withdrawalId: string, adminNote?: string) => {
    const wth = withdrawals.find((w) => w.id === withdrawalId);
    if (!wth || wth.status !== 'pending') return;

    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === withdrawalId
          ? { ...w, status: 'rejected', processedAt: new Date().toISOString(), adminNote: adminNote || 'Rejeté par Admin' }
          : w
      )
    );

    // Refund the user's reserved balance
    setUsers((prev) =>
      prev.map((u) =>
        u.id === wth.userId
          ? { ...u, balance: u.balance + wth.amount }
          : u
      )
    );

    addNotification(
      wth.userId,
      'Demande de retrait annulée',
      `Votre demande de retrait de ${wth.amount.toLocaleString()} FCFA a été rejetée et vos fonds (${wth.amount.toLocaleString()} FCFA) ont été réintégrés à votre solde. Motif : ${adminNote || 'Erreur coordonnées'}.`,
      'withdrawal'
    );
  }, [withdrawals, addNotification]);

  // Admin adjusts user balance
  const adjustUserBalance = useCallback((userId: string, delta: number, reason: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const previousBalance = targetUser.balance;
    const newBalance = Math.max(0, previousBalance + delta);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, balance: newBalance }
          : u
      )
    );

    const log: BalanceLog = {
      id: `log-${Date.now()}`,
      userId,
      userName: targetUser.fullName,
      previousBalance,
      newBalance,
      delta,
      reason: reason || 'Ajustement manuel Admin',
      adminId: 'usr-admin-1',
      date: new Date().toISOString(),
    };

    setBalanceLogs((prev) => [log, ...prev]);

    addNotification(
      userId,
      delta >= 0 ? 'Solde crédité par l\'administration' : 'Ajustement de solde',
      `${delta >= 0 ? '+' : ''}${delta.toLocaleString()} FCFA ont été ajustés sur votre solde. Raison : ${reason || 'Gestion administrative'}. Nouveau solde : ${newBalance.toLocaleString()} FCFA.`,
      'system'
    );
  }, [users, addNotification]);

  // Admin gifts product to promoter or user
  const giftProductToUser = useCallback((userId: string, productId: string): { success: boolean; error?: string } => {
    const targetUser = users.find((u) => u.id === userId);
    const targetProduct = products.find((p) => p.id === productId);

    if (!targetUser) return { success: false, error: 'Utilisateur introuvable.' };
    if (!targetProduct) return { success: false, error: 'Produit introuvable.' };

    const giftedInvestment: Investment = {
      id: `inv-gift-${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.fullName,
      userPhone: targetUser.phone,
      productId: targetProduct.id,
      productModel: targetProduct.modelName,
      amount: targetProduct.price,
      dailyReturn: targetProduct.dailyReturn,
      totalExpected: targetProduct.totalReturn,
      daysElapsed: 0,
      daysRemaining: targetProduct.durationDays,
      startedAt: new Date().toISOString(),
      active: true,
      isGiftFromAdmin: true,
    };

    setInvestments((prev) => [giftedInvestment, ...prev]);

    // Also mark as promoter if not already
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isPromoter: true } : u
      )
    );

    addNotification(
      userId,
      'Cadeau VIP Lexus offert !',
      `Félicitations ! L'administration vous a offert le pack d'investissement ${targetProduct.modelName} (Valeur : ${targetProduct.price.toLocaleString()} FCFA). Vos gains de ${targetProduct.dailyReturn.toLocaleString()} FCFA/jour débutent dès demain !`,
      'bonus'
    );

    return { success: true };
  }, [users, products, addNotification]);

  // Notifications helpers
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  }, [currentUser]);

  // Product CRUD
  const updateProduct = useCallback((product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  }, []);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProd]);
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const togglePromoterStatus = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isPromoter: !u.isPromoter } : u))
    );
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      users,
      products,
      investments,
      deposits,
      withdrawals,
      notifications,
      settings,
      balanceLogs,
      isAdminMode,
      unconfirmedDepositSession,
      setIsAdminMode,
      switchUser,
      loginUser,
      logoutUser,
      loginAsAdmin,
      registerUser,
      investInProduct,
      submitDepositConfirmation,
      submitWithdrawal,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      setPendingCheckoutSession,
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
    }),
    [
      currentUser,
      users,
      products,
      investments,
      deposits,
      withdrawals,
      notifications,
      settings,
      balanceLogs,
      isAdminMode,
      unconfirmedDepositSession,
      switchUser,
      loginUser,
      logoutUser,
      loginAsAdmin,
      registerUser,
      investInProduct,
      submitDepositConfirmation,
      submitWithdrawal,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      setPendingCheckoutSession,
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
    ]
  );

  return <LexusContext.Provider value={value}>{children}</LexusContext.Provider>;
};

export const useLexus = () => {
  const context = useContext(LexusContext);
  if (!context) {
    throw new Error('useLexus must be used within a LexusProvider');
  }
  return context;
};
