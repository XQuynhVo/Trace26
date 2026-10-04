import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isPhoneFrame: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isPhoneFrame }) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isPhoneFrame) {
    return (
      <div className="min-h-screen bg-[#0C0B0A] text-[#F3ECE1] flex justify-center">
        <div className="w-full max-w-lg min-h-screen relative flex flex-col bg-[#0C0B0A] shadow-2xl border-x border-[#201E1A]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080707] text-[#F3ECE1] flex items-center justify-center p-0 md:p-6 lg:p-8">
      {/* Mobile Device Mockup Bezel */}
      <div className="w-full max-w-md h-full md:h-[92vh] md:max-h-[890px] bg-[#0C0B0A] md:rounded-[44px] shadow-[0_0_60px_rgba(0,0,0,0.8)] border-0 md:border-[7px] md:border-[#24221F] ring-1 md:ring-[#3B362E]/60 flex flex-col relative overflow-hidden">
        {/* Dynamic Island / Notch + Mobile Status Bar */}
        <div className="sticky top-0 z-50 bg-[#0C0B0A]/95 backdrop-blur-md px-6 pt-2.5 pb-1 flex items-center justify-between text-xs font-mono text-[#F3CD97] select-none shrink-0 border-b border-[#1C1A17]">
          <span className="font-semibold text-[13px] tracking-tight text-[#FEF2A0]">{currentTime}</span>

          {/* Minimalist Camera / Sensor Pill */}
          <div className="w-20 h-4 bg-[#181614] border border-[#262420] rounded-full hidden sm:flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#0C0B0A] mr-2"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F2C33]"></span>
          </div>

          <div className="flex items-center gap-1.5 text-[#F3CD97]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-[#E98B50]" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="hidden md:flex justify-center pb-2 pt-1 bg-[#0C0B0A] shrink-0 border-t border-[#1C1A17]">
          <div className="w-32 h-1 bg-[#3A362E] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
