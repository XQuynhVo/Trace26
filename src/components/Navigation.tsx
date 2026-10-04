import React from 'react';
import { MapPin, Image as ImageIcon, Sparkles, PieChart, CalendarCheck } from 'lucide-react';

export type NavTab = 'route' | 'timeline' | 'memories' | 'dna' | 'planner';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  photoCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  photoCount,
}) => {
  const tabs = [
    {
      id: 'route' as NavTab,
      label: 'Route',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'timeline' as NavTab,
      label: 'Photos',
      icon: ImageIcon,
      badge: photoCount > 0 ? photoCount : null,
    },
    {
      id: 'memories' as NavTab,
      label: 'Memories',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'dna' as NavTab,
      label: 'DNA',
      icon: PieChart,
      badge: null,
    },
    {
      id: 'planner' as NavTab,
      label: 'Planner',
      icon: CalendarCheck,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0C0B0A]/95 backdrop-blur-md border-t border-[#262421] px-3 py-1.5 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 transition-all relative cursor-pointer min-w-[52px] ${
                isActive ? 'text-[#FEF2A0]' : 'text-[#8F8477] hover:text-[#F3CD97]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#FEF2A0]' : ''
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.7}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-[#BC4F4F] text-[9px] font-mono text-[#FEF2A0] rounded-full min-w-3.5 text-center leading-tight font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-medium transition-colors ${
                  isActive ? 'text-[#FEF2A0] font-semibold' : 'text-[#8F8477]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#E98B50] mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
