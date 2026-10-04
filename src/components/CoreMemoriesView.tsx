import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Camera, 
  Repeat, 
  Bookmark,
  Award
} from 'lucide-react';
import { Trip } from '../types';

interface CoreMemoriesViewProps {
  trip: Trip;
  onSelectMemoryLocation?: (locationName: string) => void;
  onRefreshAiMemories?: () => void;
  isAiAnalyzing?: boolean;
}

export const CoreMemoriesView: React.FC<CoreMemoriesViewProps> = ({
  trip,
  onRefreshAiMemories,
  isAiAnalyzing,
}) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['cm-tsukiji']);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Top Header */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3.5 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#F3CD97]">
            CURATED HIGHLIGHTS
          </div>
          <h1 className="font-serif text-base font-medium text-[#FAF8F5]">
            Core Memories
          </h1>
        </div>

        <button
          onClick={onRefreshAiMemories}
          disabled={isAiAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#201D1A] hover:bg-[#28231E] border border-[#3A3329] text-xs font-mono text-[#FEF2A0] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-[#E98B50] ${isAiAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAiAnalyzing ? 'Synthesizing...' : 'AI Synthesize'}</span>
        </button>
      </div>

      {/* Memory Cards (High Visual Impact, Less Clutter) */}
      <div className="space-y-3.5">
        {trip.coreMemories.map((memory) => {
          const isTsukiji = memory.locationName.includes('Tsukiji');
          const isBookmarked = bookmarkedIds.includes(memory.id);

          return (
            <div
              key={memory.id}
              className={`bg-[#141312] border rounded-2xl overflow-hidden shadow-xl transition-all relative group ${
                isTsukiji
                  ? 'border-[#E98B50]/70 ring-1 ring-[#E98B50]/20'
                  : 'border-[#262421]'
              }`}
            >
              {/* Photo Banner with Badges */}
              <div className="relative h-60 w-full overflow-hidden bg-[#0E0D0C]">
                <img
                  src={memory.photoUrl}
                  alt={memory.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-[#141312]/20 to-black/40" />

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121110]/85 backdrop-blur-md border border-[#BC4F4F]/60 text-[10px] font-mono text-[#FEF2A0]">
                    <Award className="w-3 h-3 text-[#BC4F4F]" />
                    <span>{memory.badge}</span>
                  </div>

                  <button
                    onClick={(e) => toggleBookmark(memory.id, e)}
                    className="p-1.5 rounded-full bg-[#121110]/85 backdrop-blur-md border border-[#332E27] text-[#FAF8F5] hover:text-[#FEF2A0] cursor-pointer"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isBookmarked ? 'fill-[#FEF2A0] text-[#FEF2A0]' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#F3CD97]">
                    {memory.locationName} · {memory.dateFormatted}
                  </div>
                  <h2 className="font-serif text-lg font-medium text-[#FAF8F5] leading-tight">
                    {memory.title}
                  </h2>
                </div>
              </div>

              {/* Memory Details & Metrics */}
              <div className="p-3.5 space-y-2.5">
                {/* Metric Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#1B1917] border border-[#2D2A26] text-[#FEF2A0]">
                    <Clock className="w-3 h-3 text-[#E98B50]" />
                    <span>Stayed {memory.stayDuration}</span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#1B1917] border border-[#2D2A26] text-[#F3CD97]">
                    <Camera className="w-3 h-3 text-[#E98B50]" />
                    <span>{memory.photoCount} photos</span>
                  </div>

                  {memory.isRevisited && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2B1B1B] border border-[#BC4F4F]/50 text-[#FEF2A0]">
                      <Repeat className="w-3 h-3 text-[#BC4F4F]" />
                      <span>Revisited later</span>
                    </div>
                  )}
                </div>

                {/* Clean Pull Quote */}
                <p className="border-l-2 border-[#E98B50] pl-3 py-0.5 font-serif text-xs text-[#F3CD97] leading-relaxed italic">
                  "{memory.narrative}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {memory.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#181715] border border-[#262421] text-[9px] font-mono text-[#8F8477]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
