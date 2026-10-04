import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Check, 
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/initialTrips';

interface AuthModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onSignIn: (user: UserProfile) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onClose,
  onSignIn,
  onSignOut,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      handle: `@${(name || email.split('@')[0]).toLowerCase()}`,
      homeCity: 'Kyoto / SF',
      memberSince: 'October 2026',
      tripsCount: 1,
      countriesVisited: 3,
      travelArchetype: 'Epicurean Flâneur (50% Food)',
    };

    onSignIn(user);
    onClose();
  };

  const handleSelectDemo = (user: UserProfile) => {
    onSignIn(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#121110] border border-[#2D2A26] rounded-3xl w-full max-w-sm max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-[#262421] flex items-center justify-between bg-[#141312]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#E98B50]" />
            <h2 className="font-serif text-sm font-medium text-[#FAF8F5]">
              {currentUser ? 'Explorer Profile' : mode === 'signin' ? 'Sign In' : 'Join'}
            </h2>
          </div>

          <button onClick={onClose} className="p-1 rounded-full bg-[#1C1A18] text-[#8F8477]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-3.5 space-y-3 no-scrollbar">
          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161513] border border-[#262421]">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E98B50]"
                />
                <div>
                  <h3 className="font-serif text-sm font-medium text-[#FAF8F5]">
                    {currentUser.name}
                  </h3>
                  <div className="text-[10px] text-[#FEF2A0] font-mono">{currentUser.handle}</div>
                  <div className="text-[10px] text-[#F3CD97] font-serif">
                    {currentUser.travelArchetype}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-[#181715] border border-[#262421]">
                  <div className="text-[9px] text-[#8F8477]">TRIPS</div>
                  <div className="text-sm font-bold text-[#FEF2A0]">{currentUser.tripsCount}</div>
                </div>
                <div className="p-2 rounded-xl bg-[#181715] border border-[#262421]">
                  <div className="text-[9px] text-[#8F8477]">COUNTRIES</div>
                  <div className="text-sm font-bold text-[#F3CD97]">{currentUser.countriesVisited}</div>
                </div>
              </div>

              {/* Demo Persona Switcher */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[9px] font-mono text-[#8F8477] uppercase">
                  Switch Persona
                </div>
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => handleSelectDemo(demo)}
                    className={`w-full p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      demo.id === currentUser.id
                        ? 'bg-[#221B17] border border-[#E98B50]/50'
                        : 'bg-[#161513] border border-[#262421]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={demo.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-serif text-xs text-[#FAF8F5]">{demo.name}</span>
                    </div>
                    {demo.id === currentUser.id && (
                      <Check className="w-3.5 h-3.5 text-[#FEF2A0]" />
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full py-2 rounded-xl border border-[#BC4F4F]/40 hover:bg-[#251515] text-xs font-mono text-[#FEF2A0] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-[#BC4F4F]" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#E98B50] text-[#0C0B0A] font-mono text-xs font-bold hover:bg-[#FEF2A0] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </form>

              {/* Demo 1-Click */}
              <div className="space-y-1 pt-1 border-t border-[#262421]">
                <div className="text-[9px] font-mono text-[#8F8477] uppercase text-center">
                  Instant Demo
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleSelectDemo(demo)}
                      className="p-1.5 rounded-lg bg-[#161513] border border-[#262421] text-left hover:border-[#E98B50] cursor-pointer"
                    >
                      <div className="font-serif text-xs text-[#FAF8F5] truncate">{demo.name}</div>
                      <div className="text-[9px] font-mono text-[#FEF2A0]">Active Explorer</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
