import React, { useEffect, useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck
} from 'lucide-react';

interface AiResearchModalProps {
  onClose: () => void;
}

export const AiResearchModal: React.FC<AiResearchModalProps> = ({ onClose }) => {
  const [serverStatus, setServerStatus] = useState<{
    status?: string;
    aiProvider?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.warn('Status check:', err));
  }, []);

  const apiComparison = [
    {
      provider: 'Google Gemini 2.5/3.8 Flash',
      tier: 'Free Tier (15 RPM / 1M TPM)',
      vision: true,
      verdict: 'Best Choice for Komorebi',
      isWinner: true,
      pros: 'Free native multimodal photo recognition (identifies food & shrines without GPS) + structured JSON itineraries.',
    },
    {
      provider: 'OpenAI GPT-4o mini',
      tier: 'Paid Credits Required',
      vision: true,
      verdict: 'Requires Payment Card',
      isWinner: false,
      pros: 'Strong reasoning but lacks a permanent free vision tier.',
    },
    {
      provider: 'Groq (Llama 3.3)',
      tier: 'Free Cloud Tier',
      vision: false,
      verdict: 'Text Only (No Photos)',
      isWinner: false,
      pros: 'Fast text generation, but cannot process photo pixels or scenes.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#121110] border border-[#2D2A26] rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-[#262421] flex items-center justify-between bg-[#141312]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E98B50]" />
            <h2 className="font-serif text-sm font-medium text-[#FAF8F5]">
              Best Free AI API Research
            </h2>
          </div>

          <button onClick={onClose} className="p-1 rounded-full bg-[#1C1A18] text-[#8F8477]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-3.5 space-y-2.5 no-scrollbar">
          {/* Active Engine Card */}
          <div className="bg-[#1B1713] border border-[#E98B50]/40 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#FEF2A0] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E98B50]" />
                <span>Active Integrated Engine</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400">● Free Tier</span>
            </div>
            <div className="font-serif text-sm font-medium text-[#FAF8F5]">
              {serverStatus?.aiProvider || 'Google Gemini 2.5 / 3.8 Flash'}
            </div>
            <p className="text-xs text-[#F3CD97] font-serif">
              Powers photo landmark recognition, Travel DNA, and personalized itineraries at zero cost.
            </p>
          </div>

          {/* Quick Comparison Cards */}
          <div className="space-y-1.5 pt-1">
            {apiComparison.map((item, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-xl border transition-all ${
                  item.isWinner
                    ? 'bg-[#181512] border-[#E98B50]/60'
                    : 'bg-[#141312] border-[#262421]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-serif text-xs font-medium text-[#FAF8F5]">
                    {item.provider}
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                      item.isWinner ? 'bg-[#2A1D16] text-[#FEF2A0]' : 'text-[#8F8477]'
                    }`}
                  >
                    {item.verdict}
                  </span>
                </div>
                <div className="text-[10px] text-[#8F8477] font-serif mt-0.5">
                  {item.pros}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-[#F3CD97]">
                  <span className="flex items-center gap-1">
                    {item.vision ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <XCircle className="w-2.5 h-2.5 text-[#BC4F4F]" />}
                    <span>{item.vision ? 'Photo Vision' : 'Text Only'}</span>
                  </span>
                  <span>·</span>
                  <span>{item.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#262421] bg-[#141312] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#201D1A] text-xs font-mono text-[#FEF2A0] hover:bg-[#2A2622]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
