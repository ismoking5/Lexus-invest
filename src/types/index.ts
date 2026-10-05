export type AllowedCountry = 'Bénin' | 'Cameroun' | "Côte d'Ivoire" | 'Burkina Faso' | 'Niger';

export interface CountryInfo {
  name: AllowedCountry;
  code: string;
  flag: string;
  currency: string;
  phonePlaceholder: string;
}

export const ALLOWED_COUNTRIES: CountryInfo[] = [
  { name: 'Bénin', code: '+229', flag: '🇧🇯', currency: 'FCFA', phonePlaceholder: '60123456' },
  { name: 'Cameroun', code: '+237', flag: '🇨🇲', currency: 'FCFA', phonePlaceholder: '670123456' },
  { name: "Côte d'Ivoire", code: '+225', flag: '🇨🇮', currency: 'FCFA', phonePlaceholder: '0701234567' },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫', currency: 'FCFA', phonePlaceholder: '70123456' },
  { name: 'Niger', code: '+227', flag: '🇳🇪', currency: 'FCFA', phonePlaceholder: '90123456' },
];

export type MobileNetwork = 'Orange Money' | 'Moov Money' | 'MTN Money' | 'Wave';

export interface User {
  id: string;
  fullName: string;
  phone: string;
  country: AllowedCountry;
  countryCode: string;
  balance: number; // in FCFA
  totalEarnings: number; // in FCFA
  totalDeposited: number;
  totalWithdrawn: number;
  referralCode: string;
  referredBy?: string; // referralCode of referrer
  createdAt: string;
  role: 'user' | 'admin';
  isPromoter?: boolean;
  password?: string;
}

export interface Product {
  id: string;
  modelName: string;
  price: number; // FCFA
  dailyReturn: number; // FCFA / day
  totalReturn: number; // FCFA total over 180 days
  durationDays: number; // 180
  imageKey: 'lbx' | 'ux' | 'nx' | 'rx' | 'rz' | 'gx' | 'lx' | 'lc' | 'lfa' | string;
  tag?: string;
  category: 'Compact' | 'SUV' | 'Electrique' | 'Flagship' | 'Sport';
  active: boolean;
  featured?: boolean;
}

export interface Investment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  productId: string;
  productModel: string;
  amount: number;
  dailyReturn: number;
  totalExpected: number;
  daysElapsed: number;
  daysRemaining: number;
  lastDistributionDate?: string; // YYYY-MM-DD to avoid double credits in 24h
  lastDistributionTimestamp?: number;
  startedAt: string; // ISO date string with exact time
  active: boolean;
  isGiftFromAdmin?: boolean;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  country: AllowedCountry;
  network: MobileNetwork;
  amount: number;
  proofRef?: string;
  receiptImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  country: AllowedCountry;
  network: MobileNetwork;
  amount: number; // Gross amount
  feeAmount: number; // 15% fee
  netAmount: number; // 85% received
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'deposit' | 'withdrawal' | 'investment' | 'bonus' | 'earning' | 'system';
}

export interface AdminSettings {
  paymentUrl: string;
  telegramChannelUrl: string;
  telegramInfoPopupUrl: string;
  referralLevel1Pct: number; // 25%
  referralLevel2Pct: number; // 3%
  referralLevel3Pct: number; // 2%
  welcomeBonusAmount: number; // 500 FCFA
  minDeposit: number; // 2000 FCFA
  minWithdrawal: number; // 800 FCFA
  withdrawalFeePct: number; // 15%
}

export interface BalanceLog {
  id: string;
  userId: string;
  userName: string;
  previousBalance: number;
  newBalance: number;
  delta: number;
  reason: string;
  adminId: string;
  date: string;
}
