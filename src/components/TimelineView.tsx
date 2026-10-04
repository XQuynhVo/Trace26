import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Plus, 
  ChevronRight
} from 'lucide-react';
import { Trip, Photo, PhotoCategory, Checkpoint } from '../types';

interface TimelineViewProps {
  trip: Trip;
  onOpenUpload: () => void;
  onSelectCheckpoint: (checkpoint: Checkpoint) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  trip,
  onOpenUpload,
  onSelectCheckpoint,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const allPhotos: Photo[] = trip.checkpoints.flatMap((cp) => cp.photos);

  const sortedPhotos = [...allPhotos].sort(
    (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
  );

  const filteredPhotos = sortedPhotos.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const groupedByDay: { [dateStr: string]: Photo[] } = {};
  filteredPhotos.forEach((photo) => {
    const dayKey = new Date(photo.takenAt).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(photo);
  });

  return (
    <div className="space-y-3 pb-24">
      {/* Top Banner */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3.5 shadow-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-widest uppercase text-[#F3CD97]">
            TIME-SORTED STREAM
          </div>
          <h1 className="font-serif text-base font-medium text-[#FAF8F5]">
            Photos & Moments
          </h1>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E98B50] hover:bg-[#FEF2A0] text-[#0C0B0A] font-mono text-xs font-bold transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#FEF2A0] text-[#0C0B0A] font-semibold'
              : 'bg-[#181715] text-[#8F8477] border border-[#262421]'
          }`}
        >
          All ({allPhotos.length})
        </button>
        <button
          onClick={() => setSelectedCategory('food')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'food'
              ? 'bg-[#E98B50] text-[#0C0B0A] font-semibold'
              : 'bg-[#181715] text-[#8F8477] border border-[#262421]'
          }`}
        >
          Food (50%)
        </button>
        <button
          onClick={() => setSelectedCategory('sightseeing')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'sightseeing'
              ? 'bg-[#F3CD97] text-[#0C0B0A] font-semibold'
              : 'bg-[#181715] text-[#8F8477] border border-[#262421]'
          }`}
        >
          Sightseeing
        </button>
        <button
          onClick={() => setSelectedCategory('streetViews')}
          className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'streetViews'
              ? 'bg-[#FEF2A0] text-[#0C0B0A] font-semibold'
              : 'bg-[#181715] text-[#8F8477] border border-[#262421]'
          }`}
        >
          Street
        </button>
      </div>

      {/* Photos Grouped by Date */}
      <div className="space-y-4">
        {Object.entries(groupedByDay).map(([dayLabel, photos]) => (
          <div key={dayLabel} className="space-y-2">
            <div className="sticky top-12 z-20 bg-[#0C0B0A]/90 backdrop-blur-md py-1 px-1 flex items-center justify-between border-b border-[#262421]">
              <span className="font-serif text-xs font-medium text-[#FEF2A0]">
                {dayLabel}
              </span>
              <span className="text-[10px] font-mono text-[#8F8477]">
                {photos.length} shots
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => {
                const parentCheckpoint = trip.checkpoints.find((c) => c.id === photo.locationId);

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="bg-[#141312] border border-[#262421] hover:border-[#E98B50] rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-[#100F0E] relative">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#FEF2A0] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#E98B50]" />
                        <span>
                          {new Date(photo.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <h3 className="font-serif text-xs text-[#FAF8F5] truncate">
                        {photo.title}
                      </h3>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (parentCheckpoint) onSelectCheckpoint(parentCheckpoint);
                        }}
                        className="flex items-center justify-between text-[9px] font-mono text-[#8F8477] hover:text-[#FEF2A0] mt-1 pt-1 border-t border-[#201E1A]"
                      >
                        <span className="truncate max-w-[100px] text-[#F3CD97]">{photo.locationName}</span>
                        <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex items-center justify-center p-3 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-md w-full bg-[#141312] border border-[#2D2A26] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[55vh] bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[55vh] w-auto object-contain"
              />
            </div>

            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-medium text-[#FAF8F5]">
                  {selectedPhoto.title}
                </h3>
                <span className="text-[10px] font-mono text-[#FEF2A0] uppercase">
                  {selectedPhoto.category}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#262421] text-[10px] font-mono text-[#8F8477]">
                <span>{new Date(selectedPhoto.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[#E98B50]">{selectedPhoto.locationName}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
