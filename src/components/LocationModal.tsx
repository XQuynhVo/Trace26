import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Camera, 
  Sparkles, 
  Maximize2, 
  Calendar, 
  Plus
} from 'lucide-react';
import { Checkpoint, Photo } from '../types';

interface LocationModalProps {
  checkpoint: Checkpoint | null;
  onClose: () => void;
  onOpenUploadForLocation: (checkpointId: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  checkpoint,
  onClose,
  onOpenUploadForLocation,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!checkpoint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#121110] border border-[#2D2A26] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-[#262421] flex items-center justify-between bg-[#141312]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#1F1E1B] border border-[#E98B50]/50 font-mono text-xs flex items-center justify-center text-[#FEF2A0] font-bold">
              0{checkpoint.sequenceIndex}
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#F3CD97]">
                {checkpoint.city}
              </div>
              <h2 className="font-serif text-base font-medium text-[#FAF8F5]">
                {checkpoint.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1C1A18] border border-[#2D2A26] text-[#8F8477] hover:text-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-3.5 space-y-3 no-scrollbar">
          {/* Metrics Pill Row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1B1917] border border-[#352F27] text-[#FEF2A0]">
              <Clock className="w-3.5 h-3.5 text-[#E98B50]" />
              <span>Stayed {checkpoint.stayDurationFormatted}</span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1B1917] border border-[#352F27] text-[#F3CD97]">
              <Camera className="w-3.5 h-3.5 text-[#E98B50]" />
              <span>{checkpoint.photos.length} Photos</span>
            </div>

            <div className="text-[10px] text-[#8F8477] px-1">
              {new Date(checkpoint.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {new Date(checkpoint.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Highlight Badge if present */}
          {checkpoint.highlightBadge && (
            <div className="bg-[#241A17] border border-[#BC4F4F]/40 rounded-xl p-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E98B50] shrink-0" />
              <div className="text-xs font-mono text-[#FEF2A0]">
                {checkpoint.highlightBadge}
              </div>
            </div>
          )}

          {/* Concise Summary (Less Text) */}
          <div className="bg-[#161513] border border-[#262421] rounded-xl p-3 flex items-start justify-between gap-2">
            <p className="text-xs font-serif text-[#F3CD97] leading-relaxed italic">
              "{checkpoint.summary}"
            </p>
            <span className="text-[9px] font-mono text-[#E98B50] shrink-0 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {checkpoint.lat.toFixed(2)}°, {checkpoint.lng.toFixed(2)}°
            </span>
          </div>

          {/* Photo Gallery Grid Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[10px] font-mono tracking-wider uppercase text-[#8F8477]">
              Photos at this stop ({checkpoint.photos.length})
            </div>
            <button
              onClick={() => onOpenUploadForLocation(checkpoint.id)}
              className="flex items-center gap-1 text-[11px] font-mono text-[#E98B50] hover:text-[#FEF2A0] transition-colors cursor-pointer font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 gap-2">
            {checkpoint.photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative bg-[#181715] border border-[#262421] hover:border-[#E98B50] rounded-xl overflow-hidden cursor-pointer transition-all"
              >
                <div className="aspect-square w-full overflow-hidden bg-[#100F0E]">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="p-2 bg-[#141312]">
                  <div className="text-xs font-serif text-[#FAF8F5] truncate">
                    {photo.title}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#8F8477] mt-0.5">
                    <span>
                      {new Date(photo.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[#F3CD97] capitalize">{photo.category}</span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-[#FEF2A0] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#262421] bg-[#141312] flex items-center justify-between text-xs font-mono">
          <span className="text-[10px] text-[#8F8477]">
            Stop 0{checkpoint.sequenceIndex}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[#201D1A] hover:bg-[#2A2622] border border-[#332E27] text-[#FEF2A0] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-3 animate-in fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-[#1C1A18] border border-[#2D2A26] text-[#FAF8F5] hover:bg-[#262420] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="rounded-2xl overflow-hidden border border-[#2D2A26] bg-[#0E0D0C] shadow-2xl max-h-[60vh] w-full flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="w-full bg-[#141312] border border-[#262421] rounded-xl p-3 mt-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-medium text-[#FAF8F5]">
                  {selectedPhoto.title}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#201D1A] border border-[#352F27] text-[10px] font-mono text-[#FEF2A0] uppercase">
                  {selectedPhoto.category}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-[#8F8477] border-t border-[#22201D]">
                <span>{new Date(selectedPhoto.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>·</span>
                <span className="text-[#E98B50]">{selectedPhoto.locationName}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
