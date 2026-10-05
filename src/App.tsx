/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LexusProvider, useLexus } from './context/LexusContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { InfoPopupModal } from './components/InfoPopupModal';
import { DepositConfirmationModal } from './components/DepositConfirmationModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

import { AuthView } from './views/AuthView';
import { HomeView } from './views/HomeView';
import { InvestView } from './views/InvestView';
import { DepositView } from './views/DepositView';
import { WithdrawView } from './views/WithdrawView';
import { DepositHistoryView } from './views/DepositHistoryView';
import { WithdrawHistoryView } from './views/WithdrawHistoryView';
import { TeamView } from './views/TeamView';
import { ProfileView } from './views/ProfileView';
import { AdminBackofficeView } from './views/AdminBackofficeView';
import { MobileNetwork } from './types';

const MainApp: React.FC = () => {
  const { currentUser, isAdminMode, unconfirmedDepositSession } = useLexus();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<NavTab>('accueil');
  const [subView, setSubView] = useState<'deposit_history' | 'withdraw_history' | null>(null);

  // Modals state
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [depositModalData, setDepositModalData] = useState<{
    amount: number;
    phone: string;
    network: MobileNetwork;
  }>({
    amount: 2000,
    phone: '',
    network: 'Orange Money',
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Trigger popup information at connection (Requirement 2)
  useEffect(() => {
    if (currentUser) {
      const hasSeenInfoThisSession = sessionStorage.getItem(`lexus_seen_info_${currentUser.id}`);
      if (!hasSeenInfoThisSession) {
        const timer = setTimeout(() => {
          setIsInfoModalOpen(true);
          sessionStorage.setItem(`lexus_seen_info_${currentUser.id}`, 'true');
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  // If not logged in, show dedicated authentication view (Login / Register without password)
  if (!currentUser) {
    return <AuthView />;
  }

  // Handler to open confirmation modal with custom data
  const handleOpenDepositModalWithData = (data: {
    amount: number;
    phone: string;
    network: MobileNetwork;
  }) => {
    setDepositModalData(data);
    setIsDepositModalOpen(true);
  };

  const handleTabChange = (tab: NavTab) => {
    setSubView(null);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Mobile-constrained centered container */}
      <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col bg-neutral-950 border-x border-neutral-900 shadow-2xl relative">
        {/* Main Header */}
        <Header
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
        />

        {/* Content routing */}
        <main className="flex-1">
          {isAdminMode && currentUser.role === 'admin' && currentUser.phone === '77409899' ? (
            <AdminBackofficeView />
          ) : subView === 'deposit_history' ? (
            <DepositHistoryView
              onBack={() => setSubView(null)}
              onNavigateToDeposit={() => {
                setSubView(null);
                setCurrentTab('depot');
              }}
            />
          ) : subView === 'withdraw_history' ? (
            <WithdrawHistoryView
              onBack={() => setSubView(null)}
              onNavigateToWithdraw={() => {
                setSubView(null);
                setCurrentTab('retrait');
              }}
            />
          ) : (
            <>
              {currentTab === 'accueil' && (
                <HomeView
                  onNavigate={handleTabChange}
                  onOpenDepositModal={() => {
                    if (unconfirmedDepositSession) {
                      setDepositModalData({
                        amount: unconfirmedDepositSession.amount,
                        phone: unconfirmedDepositSession.phone,
                        network: unconfirmedDepositSession.network,
                      });
                    }
                    setIsDepositModalOpen(true);
                  }}
                />
              )}
              {currentTab === 'investir' && (
                <InvestView onNavigateToDeposit={() => handleTabChange('depot')} />
              )}
              {currentTab === 'depot' && (
                <DepositView
                  onOpenConfirmationModalWithData={handleOpenDepositModalWithData}
                  onNavigateToHistory={() => setSubView('deposit_history')}
                />
              )}
              {currentTab === 'retrait' && (
                <WithdrawView
                  onNavigateToHistory={() => setSubView('withdraw_history')}
                  onNavigateToInvest={() => handleTabChange('investir')}
                />
              )}
              {currentTab === 'equipe' && <TeamView />}
              {currentTab === 'moi' && (
                <ProfileView
                  onNavigate={handleTabChange}
                  onOpenDepositHistory={() => setSubView('deposit_history')}
                  onOpenWithdrawHistory={() => setSubView('withdraw_history')}
                  onOpenInfoModal={() => setIsInfoModalOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation (Hidden when in Admin Backoffice for full focus, with easy return button in Admin header) */}
        {!(isAdminMode && currentUser.role === 'admin' && currentUser.phone === '77409899') && (
          <BottomNav currentTab={currentTab} onSelectTab={handleTabChange} />
        )}

        {/* Modals */}
        <InfoPopupModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
        />

        <DepositConfirmationModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          initialAmount={depositModalData.amount}
          initialPhone={depositModalData.phone}
          initialNetwork={depositModalData.network}
        />

        <NotificationCenterModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LexusProvider>
      <MainApp />
    </LexusProvider>
  );
}
