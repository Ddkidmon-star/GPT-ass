/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { QuickActionGrid } from './components/QuickActionGrid';
import { BigFridayBanner } from './components/BigFridayBanner';
import { RecentActivity } from './components/RecentActivity';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { OfflineIndicator } from './components/OfflineIndicator';

// Views
import { RewardsView } from './views/RewardsView';
import { WealthView } from './views/WealthView';
import { CardsView } from './views/CardsView';
import { MeView } from './views/MeView';
import { TransfersView } from './views/TransfersView';

// Security & Auth Screens
import { AuthScreen } from './components/auth/AuthScreen';
import { SecurityPinSetupModal } from './components/auth/SecurityPinSetupModal';
import { AppLockScreen } from './components/auth/AppLockScreen';

// Modals
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { TransferModal } from './components/modals/TransferModal';
import { AirtimeModal } from './components/modals/AirtimeModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { Transaction } from './types/banking';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error?.message || 'Application error' };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('AppErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121317] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <span className="text-2xl font-black">!</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">GPT BANK Reload</h2>
          <p className="text-xs text-gray-400 mb-4 max-w-xs">{this.state.errorMsg}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            Refresh Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user, isAppLocked, hasCompletedPinSetup, isAuthChecking } = useBanking();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Modal states - MUST BE DECLARED UNCONDITIONALLY AT THE TOP OF COMPONENT
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [isAirtimeOpen, setIsAirtimeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isSecurityPinOpen, setIsSecurityPinOpen] = useState(false);
  const [isTransactionsDrawerOpen, setIsTransactionsDrawerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleOpenTransfer = (defaultRecipient: string = '') => {
    setTransferRecipient(defaultRecipient);
    setIsTransferOpen(true);
  };

  const handleQRScannedRecipient = (scannedTag: string) => {
    handleOpenTransfer(scannedTag);
  };

  // If initial session and security status are still verifying, show clean splash screen to prevent any flicker
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#121317] flex flex-col items-center justify-center text-white selection:bg-emerald-500">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#741622] via-[#561019] to-[#380a11] border border-red-900/40 flex items-center justify-center text-emerald-400 shadow-2xl mb-4 animate-pulse">
          <span className="text-2xl font-black">G</span>
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">GPT BANK</h1>
        <p className="text-xs text-gray-400 mt-1">Securing connection...</p>
      </div>
    );
  }

  // 1. If user is not authenticated, render AuthScreen
  if (!user) {
    return <AuthScreen />;
  }

  // 2. If user hasn't completed Two-Tier PIN setup (6-digit app lock + 4-digit transfer PIN), prompt immediately post-login
  if (!hasCompletedPinSetup) {
    return <SecurityPinSetupModal />;
  }

  // 3. If user has PINs set up and app is locked, show AppLockScreen
  if (isAppLocked) {
    return <AppLockScreen />;
  }

  return (
    <div className="min-h-screen bg-[#121317] text-white flex flex-col selection:bg-rose-700 selection:text-white antialiased">
      {/* Offline connectivity indicator */}
      <OfflineIndicator />

      {/* Top Header matching IMG_5094 */}
      <Header
        onOpenProfile={() => setActiveTab('me')}
        onOpenQR={() => setIsQROpen(true)}
        onOpenSupport={() => setActiveTab('me')}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-2 pb-24 space-y-3">
        {activeTab === 'home' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* 1. Main Available Balance Card with dark red color & + Add Money button */}
            <BalanceCard
              onDeposit={() => setIsDepositOpen(true)}
              onTransactionsClick={() => setIsTransactionsDrawerOpen(true)}
              onSafeBoxClick={() => setActiveTab('wealth')}
              onBusinessClick={() => setIsTransactionsDrawerOpen(true)}
            />

            {/* 2. Primary 4 Action Buttons & 2x4 Services Grid matching IMG_5094 */}
            <QuickActionGrid
              onTransferTag={() => handleOpenTransfer('@gptmember')}
              onTransferBank={() => handleOpenTransfer('')}
              onSaveClick={() => setActiveTab('wealth')}
              onLoanClick={() => alert('GPT BANK Micro-Credit: Credit assessment active. Repay current tier to unlock limits.')}
              onAirtimeClick={() => setIsAirtimeOpen(true)}
              onDataClick={() => setIsAirtimeOpen(true)}
              onBettingClick={() => alert('Betting wallet top-up gateway: Bet9ja, SportyBet, 1xBet active.')}
              onTVClick={() => alert('Cable TV portal: DStv, GOtv, Startimes bills active.')}
              onWealthClick={() => setActiveTab('wealth')}
              onLoanCenterClick={() => alert('Loan Center: Zero collateral loans based on monthly turnover.')}
              onInvitationClick={() => setActiveTab('rewards')}
              onMoreClick={() => setActiveTab('me')}
            />

            {/* 3. Promotional Card: Big Friday, Bigger Returns! */}
            <BigFridayBanner />

            {/* 4. Recent Activity Feed */}
            <RecentActivity
              onSelectTransaction={(tx) => setSelectedTx(tx)}
              onViewMore={() => setIsTransactionsDrawerOpen(true)}
              onDepositClick={() => setIsDepositOpen(true)}
              limit={4}
            />
          </div>
        )}

        {activeTab === 'rewards' && <RewardsView />}

        {activeTab === 'wealth' && <WealthView />}

        {activeTab === 'cards' && <CardsView />}

        {activeTab === 'me' && (
          <MeView
            onOpenSecurityPins={() => setIsSecurityPinOpen(true)}
            onOpenStatement={() => setIsTransactionsDrawerOpen(true)}
          />
        )}
      </main>

      {/* Bottom 5-Tab Navigation Bar matching IMG_5094 */}
      <BottomNavBar activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      {/* Action Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />

      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultRecipient={transferRecipient}
      />

      <AirtimeModal isOpen={isAirtimeOpen} onClose={() => setIsAirtimeOpen(false)} />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <QRScannerModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        onScannedRecipient={handleQRScannedRecipient}
      />

      <ReceiptModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Security PIN Re-configuration Modal if requested from Me tab */}
      {isSecurityPinOpen && (
        <div className="fixed inset-0 z-50">
          <SecurityPinSetupModal />
        </div>
      )}

      {/* Transactions Drawer Modal */}
      {isTransactionsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">All Transaction Records</h3>
              <button
                onClick={() => setIsTransactionsDrawerOpen(false)}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300"
              >
                Close
              </button>
            </div>
            <div className="mt-3">
              <RecentActivity
                onSelectTransaction={(tx) => setSelectedTx(tx)}
                onViewMore={() => {}}
                onDepositClick={() => {
                  setIsTransactionsDrawerOpen(false);
                  setIsDepositOpen(true);
                }}
                limit={50}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BankingProvider>
        <MainApp />
      </BankingProvider>
    </AppErrorBoundary>
  );
}
