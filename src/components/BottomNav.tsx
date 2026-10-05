import React from 'react';
import { Home, TrendingUp, Wallet, Users, User, ArrowDownToLine } from 'lucide-react';

export type NavTab = 'accueil' | 'investir' | 'depot' | 'retrait' | 'equipe' | 'moi';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'accueil' as NavTab, label: 'Accueil', icon: Home },
    { id: 'investir' as NavTab, label: 'Investir', icon: TrendingUp },
    { id: 'depot' as NavTab, label: 'Dépôt', icon: Wallet },
    { id: 'retrait' as NavTab, label: 'Retrait', icon: ArrowDownToLine },
    { id: 'equipe' as NavTab, label: 'Équipe', icon: Users },
    { id: 'moi' as NavTab, label: 'Moi', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/90 max-w-lg mx-auto">
      <div className="grid grid-cols-6 items-center px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
                isActive ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
              )}
              <div
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'scale-110 bg-amber-500/10' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
