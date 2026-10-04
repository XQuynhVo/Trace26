import React from 'react';
import { Sparkles, User, Smartphone, Monitor, ChevronDown, Plus } from 'lucide-react';
import { Trip, UserProfile } from '../types';

interface HeaderProps {
  currentTrip: Trip;
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onNewTrip: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenAiResearch: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  trips,
  onSelectTrip,
  onNewTrip,
  currentUser,
  onOpenAuth,
  onOpenAiResearch,
  isPhoneFrame,
  onTogglePhoneFrame,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0C0B0A]/90 backdrop-blur-md border-b border-[#262421] px-4 py-2.5">
      <div className="flex items-center justify-between">
        {/* Brand & Journey Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer group text-left"
          >
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-serif tracking-widest text-[11px] uppercase text-[#F3CD97] font-semibold">
                  KOMOREBI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E98B50]"></span>
                <span className="text-[10px] tracking-wider font-mono text-[#FEF2A0]">
                  {currentTrip.city}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#FAF8F5] font-serif text-sm group-hover:text-[#F3CD97] transition-colors mt-0.5">
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentTrip.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#F3CD97] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Trip Selector Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-60 bg-[#141312] border border-[#2D2A26] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#8F8477] px-2.5 py-1">
                Your Journeys
              </div>
              <div className="py-1 max-h-56 overflow-y-auto no-scrollbar">
                {trips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTrip(t);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      t.id === currentTrip.id
                        ? 'bg-[#221F1B] text-[#FEF2A0] font-medium'
                        : 'text-[#F3CD97] hover:bg-[#1B1917]'
                    }`}
                  >
                    <div>
                      <div className="truncate">{t.title}</div>
                      <div className="text-[10px] text-[#8F8477] font-mono">{t.city}</div>
                    </div>
                    {t.id === currentTrip.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E98B50]"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-1 border-t border-[#262421]">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNewTrip();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#E98B50] hover:bg-[#201D1A] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Journey</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* AI Research / Best Free API trigger */}
          <button
            onClick={onOpenAiResearch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1815] border border-[#352F27] hover:border-[#E98B50] text-[#FEF2A0] text-xs transition-all cursor-pointer"
            title="Free AI Engine Research"
          >
            <Sparkles className="w-3 h-3 text-[#E98B50]" />
            <span className="text-[10px] font-mono font-medium">Free AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FEF2A0] animate-pulse"></span>
          </button>

          {/* Desktop/Phone Viewport Toggle */}
          <button
            onClick={onTogglePhoneFrame}
            className="p-1.5 rounded-full bg-[#1A1815] border border-[#2D2A26] text-[#F3CD97] hover:text-[#FEF2A0] transition-colors cursor-pointer hidden md:flex"
            title={isPhoneFrame ? 'Full View' : 'Phone Frame'}
          >
            {isPhoneFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
          </button>

          {/* User Sign In / Profile */}
          <button
            onClick={onOpenAuth}
            className="p-1 rounded-full bg-[#1A1815] border border-[#352F27] hover:border-[#E98B50] transition-all cursor-pointer"
            title="Profile & Sign In"
          >
            {currentUser ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#E98B50]"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#201D1A] flex items-center justify-center text-[#F3CD97]">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
