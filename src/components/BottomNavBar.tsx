import React from 'react';
import { RotateCw, Award, TrendingUp, CreditCard, User } from 'lucide-react';

export type TabType = 'home' | 'rewards' | 'wealth' | 'cards' | 'me';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: RotateCw },
    { id: 'rewards' as TabType, label: 'Rewards', icon: Award },
    { id: 'wealth' as TabType, label: 'Wealth', icon: TrendingUp },
    { id: 'cards' as TabType, label: 'Cards', icon: CreditCard },
    { id: 'me' as TabType, label: 'Me', icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#121317]/95 backdrop-blur-md border-t border-white/10 shadow-2xl"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition group rounded-xl ${
                isActive ? 'text-[#00D18F]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-[#00D18F] font-bold' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
