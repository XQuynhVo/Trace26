import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Clock, 
  Check, 
  Sparkles
} from 'lucide-react';
import exifr from 'exifr';
import { Photo, Checkpoint, PhotoCategory } from '../types';

interface UploadModalProps {
  checkpoints: Checkpoint[];
  defaultCheckpointId?: string;
  onClose: () => void;
  onAddPhotos: (newPhotos: Photo[], newCheckpoints?: Checkpoint[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  checkpoints,
  defaultCheckpointId,
  onClose,
  onAddPhotos,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewItems, setPreviewItems] = useState<Array<{
    file: File;
    previewUrl: string;
    extractedDate?: string;
    extractedLat?: number;
    extractedLng?: number;
    title: string;
    category: PhotoCategory;
    locationName: string;
    assignedCheckpointId: string;
  }>>([]);

  const [activeStep, setActiveStep] = useState<'select' | 'review'>('select');

  // Quick Presets with the new color aesthetic
  const samplePresets = [
    {
      title: 'A5 Wagyu Beef Skewer at Tsukiji',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      category: 'food' as PhotoCategory,
      locationName: 'Tsukiji Outer Market',
      checkpointId: 'cp-02',
      date: '2026-04-15T11:05:00',
      lat: 35.6655,
      lng: 139.7708,
    },
    {
      title: 'Golden Lantern at Senso-ji',
      url: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=800&auto=format&fit=crop&q=80',
      category: 'sightseeing' as PhotoCategory,
      locationName: 'Senso-ji Temple & Asakusa',
      checkpointId: 'cp-03',
      date: '2026-04-15T14:45:00',
      lat: 35.7148,
      lng: 139.7967,
    },
  ];

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const items = [];

    for (const file of fileArray) {
      const previewUrl = URL.createObjectURL(file);
      let extractedDate: string | undefined;
      let extractedLat: number | undefined;
      let extractedLng: number | undefined;

      try {
        const parsed = await exifr.parse(file, {
          pick: ['DateTimeOriginal', 'CreateDate', 'latitude', 'longitude'],
        });

        if (parsed) {
          if (parsed.DateTimeOriginal || parsed.CreateDate) {
            const d = new Date(parsed.DateTimeOriginal || parsed.CreateDate);
            if (!isNaN(d.getTime())) extractedDate = d.toISOString();
          }
          if (parsed.latitude && parsed.longitude) {
            extractedLat = parsed.latitude;
            extractedLng = parsed.longitude;
          }
        }
      } catch (err) {
        // fallback
      }

      if (!extractedDate) {
        extractedDate = new Date(file.lastModified || Date.now()).toISOString();
      }

      let assignedCp = defaultCheckpointId || (checkpoints.length > 0 ? checkpoints[0].id : 'new');
      let locationName = checkpoints.find((c) => c.id === assignedCp)?.name || 'Checkpoint';

      items.push({
        file,
        previewUrl,
        extractedDate,
        extractedLat,
        extractedLng,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        category: 'food' as PhotoCategory,
        locationName,
        assignedCheckpointId: assignedCp,
      });
    }

    setPreviewItems(items);
    setActiveStep('review');
  };

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    const newPhoto: Photo = {
      id: `photo-sample-${Date.now()}`,
      url: preset.url,
      title: preset.title,
      takenAt: preset.date,
      locationId: preset.checkpointId,
      locationName: preset.locationName,
      lat: preset.lat,
      lng: preset.lng,
      category: preset.category,
      caption: `Captured at ${new Date(preset.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    };

    onAddPhotos([newPhoto]);
    onClose();
  };

  const handleConfirmUpload = () => {
    const newPhotos: Photo[] = previewItems.map((item, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url: item.previewUrl,
      title: item.title,
      takenAt: item.extractedDate || new Date().toISOString(),
      locationId: item.assignedCheckpointId,
      locationName: item.locationName,
      lat: item.extractedLat || 35.6762,
      lng: item.extractedLng || 139.6503,
      category: item.category,
    }));

    onAddPhotos(newPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="bg-[#121110] border border-[#2D2A26] rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-[#262421] flex items-center justify-between bg-[#141312]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#E98B50]" />
            <h2 className="font-serif text-sm font-medium text-[#FAF8F5]">
              {activeStep === 'select' ? 'Upload Pictures' : 'Confirm Metadata'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-[#1C1A18] text-[#8F8477] hover:text-[#FAF8F5]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-3.5 space-y-3 no-scrollbar">
          {activeStep === 'select' ? (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-[#2D2924] hover:border-[#E98B50] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#151412] hover:bg-[#1A1815]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) handleFiles(e.target.files);
                  }}
                />

                <div className="w-10 h-10 rounded-full bg-[#201D1A] flex items-center justify-center mx-auto mb-2 text-[#E98B50]">
                  <Upload className="w-5 h-5" />
                </div>

                <div className="font-serif text-xs font-medium text-[#FAF8F5]">
                  Select or Drag Photos
                </div>
                <div className="text-[10px] text-[#FEF2A0] font-mono mt-1">
                  Auto-extracts date, time & location
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[9px] font-mono text-[#8F8477] uppercase">
                  Quick Demo Shots
                </div>
                {samplePresets.map((preset, i) => (
                  <div
                    key={i}
                    onClick={() => handleApplyPreset(preset)}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#161513] border border-[#262421] hover:border-[#E98B50] cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div className="text-xs font-serif text-[#FAF8F5]">
                        {preset.title}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#201D1A] text-[9px] font-mono text-[#FEF2A0]">
                      + Add
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {previewItems.map((item, index) => (
                <div key={index} className="p-2.5 rounded-xl bg-[#161513] border border-[#262421] space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={item.previewUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...previewItems];
                        updated[index].title = e.target.value;
                        setPreviewItems(updated);
                      }}
                      className="flex-1 bg-[#100F0E] border border-[#262421] rounded px-2 py-1 text-xs text-[#FAF8F5]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <select
                      value={item.assignedCheckpointId}
                      onChange={(e) => {
                        const updated = [...previewItems];
                        updated[index].assignedCheckpointId = e.target.value;
                        setPreviewItems(updated);
                      }}
                      className="bg-[#100F0E] border border-[#262421] rounded p-1 text-[#F3CD97]"
                    >
                      {checkpoints.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={item.category}
                      onChange={(e) => {
                        const updated = [...previewItems];
                        updated[index].category = e.target.value as PhotoCategory;
                        setPreviewItems(updated);
                      }}
                      className="bg-[#100F0E] border border-[#262421] rounded p-1 text-[#FEF2A0]"
                    >
                      <option value="food">Food</option>
                      <option value="sightseeing">Sightseeing</option>
                      <option value="streetViews">Street</option>
                      <option value="groupPhoto">Group</option>
                      <option value="selfie">Selfie</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#262421] bg-[#141312] flex items-center justify-between text-xs font-mono">
          {activeStep === 'review' ? (
            <>
              <button
                onClick={() => setActiveStep('select')}
                className="text-[10px] text-[#8F8477]"
              >
                Back
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-3.5 py-1.5 rounded-xl bg-[#E98B50] hover:bg-[#FEF2A0] text-[#0C0B0A] font-bold text-xs"
              >
                Save Photos
              </button>
            </>
          ) : (
            <span className="text-[10px] text-[#8F8477]">
              Photos sort chronologically.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
