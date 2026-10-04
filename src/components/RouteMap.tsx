import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  ChevronRight, 
  Utensils, 
  Camera, 
  Building2, 
  Compass,
  Repeat,
  Sparkles
} from 'lucide-react';
import { Trip, Checkpoint } from '../types';

interface RouteMapProps {
  trip: Trip;
  onSelectCheckpoint: (checkpoint: Checkpoint) => void;
  onOpenUpload: () => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  trip,
  onSelectCheckpoint,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'food' | 'sightseeing' | 'streetViews'>('all');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Sorted strictly by arrival time
  const sortedCheckpoints = [...trip.checkpoints].sort(
    (a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
  );

  const filteredCheckpoints = sortedCheckpoints.filter((cp) => {
    if (activeFilter === 'all') return true;
    return cp.primaryCategory === activeFilter;
  });

  // Calculate SVG bounds for vector cartography
  const lats = sortedCheckpoints.map((c) => c.lat);
  const lngs = sortedCheckpoints.map((c) => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(0.01, maxLat - minLat);
  const lngSpan = Math.max(0.01, maxLng - minLng);

  const padding = 32;
  const svgWidth = 380;
  const svgHeight = 220;

  const points = sortedCheckpoints.map((cp) => {
    const x = padding + ((cp.lng - minLng) / lngSpan) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((cp.lat - minLat) / latSpan) * (svgHeight - padding * 2);
    return { ...cp, x, y };
  });

  const pathD = points.reduce((acc, pt, index) => {
    if (index === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[index - 1];
    return `${acc} Q ${prev.x} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="space-y-3 pb-24">
      {/* Clean High-Level Metrics (Less Text, High Visual Impact) */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E98B50]"></span>
            <span className="font-serif text-sm font-medium text-[#FAF8F5]">
              {trip.city} Route Flow
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#201D1A] border border-[#3A3329] text-[10px] font-mono text-[#FEF2A0]">
            Start → End (8 Checkpoints)
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-[#191816] py-1.5 px-2 rounded-xl border border-[#262421]">
            <div className="text-[9px] text-[#8F8477]">DISTANCE</div>
            <div className="text-xs font-bold text-[#FEF2A0]">{trip.totalDistanceKm} km</div>
          </div>
          <div className="bg-[#191816] py-1.5 px-2 rounded-xl border border-[#262421]">
            <div className="text-[9px] text-[#8F8477]">DURATION</div>
            <div className="text-xs font-bold text-[#F3CD97]">{trip.totalDurationDays} Days</div>
          </div>
          <div className="bg-[#191816] py-1.5 px-2 rounded-xl border border-[#262421]">
            <div className="text-[9px] text-[#8F8477]">PHOTOS</div>
            <div className="text-xs font-bold text-[#E98B50]">
              {sortedCheckpoints.reduce((acc, c) => acc + c.photos.length, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Vector Route Map Visualizer */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#F3CD97] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#E98B50]" />
            <span>Connected Waypoints</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#FEF2A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E98B50] animate-ping"></span>
            <span>Live Route</span>
          </div>
        </div>

        {/* Stylized Map Canvas with #FEF2A0 -> #F3CD97 -> #E98B50 -> #BC4F4F gradient */}
        <div className="relative bg-[#0E0D0C] rounded-xl border border-[#262421] overflow-hidden">
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#F3CD97 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-52 transition-all duration-300 select-none"
          >
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF2A0" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#F3CD97" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#E98B50" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#BC4F4F" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Stylized background terrain contours */}
            <path d="M 20 160 Q 140 140 220 180 T 360 190" fill="none" stroke="#201E1A" strokeWidth="1" />
            <path d="M 40 40 Q 160 70 260 45 T 360 80" fill="none" stroke="#1A1815" strokeWidth="1" />

            {/* Connected Route Path */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              className="animate-pulse-subtle"
            />

            {/* Directional Waypoints */}
            {points.map((pt, idx) => {
              const isStart = idx === 0;
              const isEnd = idx === points.length - 1;
              const isSelected = activeNodeId === pt.id;
              const isTsukiji = pt.name.includes('Tsukiji');

              let nodeStroke = '#F3CD97';
              if (isStart) nodeStroke = '#FEF2A0';
              else if (isTsukiji) nodeStroke = '#E98B50';
              else if (isEnd) nodeStroke = '#BC4F4F';

              return (
                <g
                  key={pt.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectCheckpoint(pt)}
                  onMouseEnter={() => setActiveNodeId(pt.id)}
                  onMouseLeave={() => setActiveNodeId(null)}
                >
                  {(isSelected || isTsukiji) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="14"
                      fill="#E98B50"
                      fillOpacity={isSelected ? 0.25 : 0.15}
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 9 : 7.5}
                    fill="#141312"
                    stroke={nodeStroke}
                    strokeWidth={isSelected ? '2.5' : '2'}
                  />

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3"
                    fill={isTsukiji ? '#E98B50' : isEnd ? '#BC4F4F' : '#FEF2A0'}
                  />

                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill={isSelected ? '#FEF2A0' : '#8F8477'}
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    0{pt.sequenceIndex}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Tap Tooltip */}
          {activeNodeId && (
            <div className="absolute bottom-2 left-2 right-2 bg-[#171614]/95 backdrop-blur border border-[#3E3529] rounded-lg p-2 flex items-center justify-between text-xs animate-in fade-in">
              {(() => {
                const target = points.find((p) => p.id === activeNodeId);
                if (!target) return null;
                return (
                  <>
                    <div className="truncate pr-2">
                      <div className="font-serif font-medium text-[#FAF8F5] truncate text-xs">
                        {target.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#FEF2A0]">
                        {target.stayDurationFormatted} · {target.photos.length} photos
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectCheckpoint(target)}
                      className="px-2 py-1 rounded bg-[#E98B50] text-[#0C0B0A] text-[10px] font-mono font-semibold"
                    >
                      View Photos
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#262421] text-[9px] font-mono text-[#8F8477]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FEF2A0]"></span>
            <span>Start</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E98B50]"></span>
            <span>Highlight</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#BC4F4F]"></span>
            <span>End Stop</span>
          </span>
        </div>
      </div>

      {/* Filter Chips using theme colors */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#FEF2A0] text-[#0C0B0A] font-semibold'
              : 'bg-[#191816] text-[#8F8477] border border-[#2D2A26]'
          }`}
        >
          All ({sortedCheckpoints.length})
        </button>
        <button
          onClick={() => setActiveFilter('food')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeFilter === 'food'
              ? 'bg-[#E98B50] text-[#0C0B0A] font-semibold'
              : 'bg-[#191816] text-[#8F8477] border border-[#2D2A26]'
          }`}
        >
          <Utensils className="w-3 h-3 text-[#E98B50]" />
          <span>Food (50%)</span>
        </button>
        <button
          onClick={() => setActiveFilter('sightseeing')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeFilter === 'sightseeing'
              ? 'bg-[#F3CD97] text-[#0C0B0A] font-semibold'
              : 'bg-[#191816] text-[#8F8477] border border-[#2D2A26]'
          }`}
        >
          <Building2 className="w-3 h-3 text-[#F3CD97]" />
          <span>Sightseeing</span>
        </button>
        <button
          onClick={() => setActiveFilter('streetViews')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeFilter === 'streetViews'
              ? 'bg-[#FEF2A0] text-[#0C0B0A] font-semibold'
              : 'bg-[#191816] text-[#8F8477] border border-[#2D2A26]'
          }`}
        >
          <Camera className="w-3 h-3 text-[#FEF2A0]" />
          <span>Street</span>
        </button>
      </div>

      {/* Sequential Checkpoints List (Streamlined & Less Dense) */}
      <div className="space-y-2.5">
        {filteredCheckpoints.map((checkpoint) => {
          const isTsukiji = checkpoint.name.includes('Tsukiji');

          return (
            <div
              key={checkpoint.id}
              onClick={() => onSelectCheckpoint(checkpoint)}
              className={`bg-[#141312] hover:bg-[#1A1916] border rounded-2xl p-3 transition-all duration-200 cursor-pointer shadow-md ${
                isTsukiji
                  ? 'border-[#E98B50]/70 ring-1 ring-[#E98B50]/20'
                  : 'border-[#262421] hover:border-[#38332A]'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                      isTsukiji
                        ? 'bg-[#E98B50] text-[#0C0B0A]'
                        : 'bg-[#1F1E1B] text-[#FEF2A0] border border-[#353129]'
                    }`}
                  >
                    0{checkpoint.sequenceIndex}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="font-serif text-sm font-medium text-[#FAF8F5] truncate">
                        {checkpoint.name}
                      </h2>
                      {checkpoint.isRevisited && (
                        <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#2D1B1B] border border-[#BC4F4F]/40 text-[9px] font-mono text-[#FEF2A0]">
                          <Repeat className="w-2.5 h-2.5 text-[#BC4F4F]" />
                          <span>Revisited</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#8F8477] shrink-0" />
              </div>

              {/* Compact Badges Row */}
              <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#8F8477]">
                <div className="flex items-center gap-1 text-[#F3CD97]">
                  <Clock className="w-3 h-3 text-[#E98B50]" />
                  <span>
                    {new Date(checkpoint.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span>·</span>
                <span className="px-2 py-0.5 rounded-full bg-[#1C1A17] border border-[#2E2922] text-[#FEF2A0]">
                  Stayed {checkpoint.stayDurationFormatted}
                </span>
                <span>·</span>
                <span className="text-[#E98B50]">
                  {checkpoint.photos.length} photos
                </span>
                {checkpoint.distanceFromPrevKm ? (
                  <>
                    <span>·</span>
                    <span>+{checkpoint.distanceFromPrevKm}km</span>
                  </>
                ) : null}
              </div>

              {/* Highlight Pill if present */}
              {checkpoint.highlightBadge && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#251A14] border border-[#E98B50]/40 text-[10px] font-mono text-[#FEF2A0]">
                  <Sparkles className="w-3 h-3 text-[#E98B50]" />
                  <span>{checkpoint.highlightBadge}</span>
                </div>
              )}

              {/* Photo Thumbnails */}
              {checkpoint.photos.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                  {checkpoint.photos.slice(0, 4).map((photo) => (
                    <div
                      key={photo.id}
                      className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#262421]"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                  {checkpoint.photos.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-[#1C1B18] border border-[#2D2A26] flex items-center justify-center text-[10px] font-mono text-[#F3CD97] shrink-0">
                      +{checkpoint.photos.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
