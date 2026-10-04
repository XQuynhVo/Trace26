import React from 'react';
import { 
  Utensils, 
  Building2, 
  Users, 
  Camera, 
  Compass, 
  ArrowUpRight,
  Flame
} from 'lucide-react';
import { Trip } from '../types';

interface TravelDnaViewProps {
  trip: Trip;
  onNavigateToPlanner: () => void;
}

export const TravelDnaView: React.FC<TravelDnaViewProps> = ({
  trip,
  onNavigateToPlanner,
}) => {
  const dna = trip.travelDna;

  const categories = [
    {
      id: 'food',
      label: 'Food & Culinary',
      pct: dna.food, // 50%
      color: '#E98B50',
      icon: Utensils,
      stat: '2h 08m avg. per food stop',
    },
    {
      id: 'sightseeing',
      label: 'Sightseeing & Heritage',
      pct: dna.sightseeing, // 20%
      color: '#F3CD97',
      icon: Building2,
      stat: 'Shrines, towers & gardens',
    },
    {
      id: 'streetViews',
      label: 'Street Views',
      pct: dna.streetViews, // 10%
      color: '#FEF2A0',
      icon: Compass,
      stat: 'Alleys & architecture',
    },
    {
      id: 'groupPhoto',
      label: 'Group Photos',
      pct: dna.groupPhoto, // 10%
      color: '#BC4F4F',
      icon: Users,
      stat: 'Companion & chef portraits',
    },
    {
      id: 'selfie',
      label: 'Selfies',
      pct: dna.selfie, // 10%
      color: '#D47D68',
      icon: Camera,
      stat: 'Scenic personal memories',
    },
  ];

  return (
    <div className="space-y-3 pb-24">
      {/* Top Archetype Banner */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#F3CD97]">
              PHOTO COMPOSITION
            </div>
            <h1 className="font-serif text-base font-medium text-[#FAF8F5]">
              Travel DNA
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#201B17] border border-[#E98B50]/40 text-xs font-mono text-[#FEF2A0] font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#E98B50]" />
            <span>{dna.personaTitle}</span>
          </span>
        </div>

        {/* Visual Segmented DNA Bar with 4 Colors */}
        <div className="mt-3">
          <div className="h-3.5 w-full rounded-full bg-[#181715] overflow-hidden flex p-0.5 border border-[#262421]">
            {categories.map((c) => (
              <div
                key={c.id}
                style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                title={`${c.label}: ${c.pct}%`}
              />
            ))}
          </div>

          {/* Quick Legend Labels */}
          <div className="grid grid-cols-5 gap-1 text-center font-mono text-[10px] mt-2">
            {categories.map((c) => (
              <div key={c.id}>
                <div className="font-bold text-xs" style={{ color: c.color }}>{c.pct}%</div>
                <div className="truncate text-[9px] uppercase tracking-tight text-[#8F8477]">{c.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards (Compact & Clean) */}
      <div className="space-y-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isDominant = cat.pct >= 50;

          return (
            <div
              key={cat.id}
              className={`bg-[#141312] border rounded-xl p-3 transition-all flex items-center justify-between ${
                isDominant
                  ? 'border-[#E98B50]/70 bg-gradient-to-r from-[#1A1612] to-[#141312]'
                  : 'border-[#262421]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    borderColor: `${cat.color}40`,
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-medium text-[#FAF8F5]">
                      {cat.label}
                    </span>
                    {isDominant && (
                      <span className="px-1.5 py-0.2 rounded bg-[#2D1D16] border border-[#E98B50]/40 text-[9px] font-mono text-[#FEF2A0]">
                        Top Drive
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[#8F8477]">
                    {cat.stat}
                  </div>
                </div>
              </div>

              <div
                className="font-mono text-base font-bold shrink-0"
                style={{ color: cat.color }}
              >
                {cat.pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Action to Planner */}
      <div className="bg-[#191714] border border-[#3E3426] rounded-2xl p-3 shadow-xl flex items-center justify-between">
        <div>
          <div className="font-serif text-xs font-medium text-[#FAF8F5]">
            Plan around your 50% Food DNA
          </div>
          <div className="text-[10px] text-[#F3CD97] font-serif">
            Generates unhurried morning market itineraries.
          </div>
        </div>
        <button
          onClick={onNavigateToPlanner}
          className="px-3 py-1.5 rounded-xl bg-[#E98B50] hover:bg-[#FEF2A0] text-[#0C0B0A] font-mono text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <span>AI Planner</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
