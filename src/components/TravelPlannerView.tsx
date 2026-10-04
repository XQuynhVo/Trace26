import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  BookmarkPlus,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Trip, ItineraryPlan, PhotoCategory } from '../types';

interface TravelPlannerViewProps {
  pastTrips: Trip[];
  activeTrip: Trip;
  onSaveGeneratedTrip?: (newTrip: Trip) => void;
}

export const TravelPlannerView: React.FC<TravelPlannerViewProps> = ({
  pastTrips,
  activeTrip,
  onSaveGeneratedTrip,
}) => {
  const [destination, setDestination] = useState('Kyoto, Japan');
  const [durationDays, setDurationDays] = useState(2);
  const [arrivalTime, setArrivalTime] = useState('09:30 AM');
  const [departureTime, setDepartureTime] = useState('05:30 PM');
  const [startPoint, setStartPoint] = useState('Kyoto Station');
  const [endPoint, setEndPoint] = useState('Kansai Express Platform');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const destinationSuggestions = [
    { city: 'Kyoto, Japan', duration: 2, start: 'Kyoto Station', end: 'Gion Shijo' },
    { city: 'Seoul, Korea', duration: 3, start: 'Incheon AREX', end: 'Hongdae' },
    { city: 'Rome, Italy', duration: 3, start: 'Roma Termini', end: 'Trastevere' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          durationDays,
          arrivalTime,
          departureTime,
          startPoint,
          endPoint,
          travelDna: activeTrip.travelDna,
          previousTripsSummary: {
            title: activeTrip.title,
            topCheckpoint: 'Tsukiji Outer Market (stayed 2h 17m, 23 photos, revisited)',
            totalDistance: activeTrip.totalDistanceKm,
            dna: activeTrip.travelDna,
          },
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data: ItineraryPlan = await response.json();
      setItinerary(data);

      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#FEF2A0', '#F3CD97', '#E98B50', '#BC4F4F'],
        });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      // Fallback personalized plan
      setItinerary({
        planTitle: `${destination} Personalized Plan`,
        destination,
        durationDays,
        arrivalTime,
        departureTime,
        startPoint,
        endPoint,
        styleRationale: `Tuned to your 50% Food Travel DNA and Tsukiji pacing (2h 17m stay), with dedicated morning market and evening dining slots.`,
        days: [
          {
            dayNumber: 1,
            date: 'Day 1',
            focus: 'Arrival, Historic Market & Evening Alleys',
            items: [
              {
                time: arrivalTime,
                title: `Arrival at ${startPoint}`,
                description: 'Baggage drop and transition to walking route.',
                category: 'arrival',
                duration: '45m',
              },
              {
                time: '11:00 AM',
                title: 'Nishiki Market Culinary Promenade',
                description: 'Dashi tamagoyaki, roasted sesame skewers, and fresh sashimi.',
                category: 'food',
                duration: '2h 15m',
              },
              {
                time: '02:30 PM',
                title: 'Kiyomizu-dera & Sannenzaka Slopes',
                description: 'Contemplative walk through heritage temple pathways.',
                category: 'sightseeing',
                duration: '2h 00m',
              },
              {
                time: '06:00 PM',
                title: 'Gion Shirakawa & Tasting Counter',
                description: 'Unhurried seasonal multi-course dinner matching your Tsukiji pacing.',
                category: 'food',
                duration: '2h 30m',
              },
            ],
          },
          {
            dayNumber: 2,
            date: 'Day 2',
            focus: 'Arashiyama Bamboo & Farewell Tasting',
            items: [
              {
                time: '08:30 AM',
                title: 'Bamboo Grove & Riverside Roaster',
                description: 'Quiet morning walk before crowds; siphon pour-over by river.',
                category: 'streetViews',
                duration: '2h 00m',
              },
              {
                time: '11:30 AM',
                title: 'Tenryu-ji Garden & Buckwheat Soba',
                description: 'UNESCO World Heritage Zen garden followed by walnut broth soba.',
                category: 'food',
                duration: '2h 00m',
              },
              {
                time: departureTime,
                title: `Transfer to ${endPoint}`,
                description: 'Concluding route seamlessly at your departure terminal.',
                category: 'departure',
                duration: '1h 00m',
              },
            ],
          },
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!itinerary) return;
    const text = `${itinerary.planTitle}\n\n${itinerary.styleRationale}\n\n` +
      itinerary.days.map((d) => 
        `${d.date} - ${d.focus}\n` +
        d.items.map((i) => `  ${i.time}: ${i.title} (${i.duration}) - ${i.description}`).join('\n')
      ).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsTrip = () => {
    if (!itinerary || !onSaveGeneratedTrip) return;

    let seq = 1;
    const checkpoints = itinerary.days.flatMap((day, dayIdx) => 
      day.items.map((item) => ({
        id: `gen-cp-${dayIdx}-${seq}`,
        sequenceIndex: seq++,
        name: item.title,
        city: destination.split(',')[0].trim(),
        lat: 35.0116 + seq * 0.005,
        lng: 135.7681 + seq * 0.005,
        arrivalTime: `2026-05-0${day.dayNumber}T${item.time.replace(/[^0-9:]/g, '') || '10:00'}:00`,
        departureTime: `2026-05-0${day.dayNumber}T18:00:00`,
        stayDurationMinutes: 120,
        stayDurationFormatted: item.duration,
        photos: [],
        summary: item.description,
        primaryCategory: (item.category as PhotoCategory) || 'sightseeing',
      }))
    );

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: itinerary.planTitle,
      subtitle: `${destination} · ${durationDays} Days`,
      country: destination.split(',')[1]?.trim() || 'Global',
      city: destination.split(',')[0]?.trim() || destination,
      startDate: '2026-05-01',
      endDate: `2026-05-0${durationDays}`,
      coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
      summary: itinerary.styleRationale,
      checkpoints,
      travelDna: activeTrip.travelDna,
      coreMemories: [],
      totalDistanceKm: 24.5,
      totalDurationDays: durationDays,
    };

    onSaveGeneratedTrip(newTrip);
    setSavedSuccess(true);
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Header Banner */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-1.5">
          <h1 className="font-serif text-base font-medium text-[#FAF8F5]">
            AI Travel Planner
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-[#201B17] border border-[#E98B50]/40 text-[10px] font-mono text-[#FEF2A0]">
            50% Food DNA Tuned
          </span>
        </div>

        {/* Quick Ideas Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
          {destinationSuggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDestination(s.city);
                setDurationDays(s.duration);
                setStartPoint(s.start);
                setEndPoint(s.end);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#1B1917] border border-[#2D2A26] hover:border-[#E98B50] text-[10px] font-mono text-[#F3CD97] whitespace-nowrap cursor-pointer transition-colors"
            >
              {s.city} ({s.duration}d)
            </button>
          ))}
        </div>
      </div>

      {/* Clean Parameters Form */}
      <div className="bg-[#141312] border border-[#262421] rounded-2xl p-3.5 shadow-xl space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Destination */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[9px] font-mono uppercase text-[#8F8477] block mb-0.5">
              Destination
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
              />
              <MapPin className="w-3.5 h-3.5 text-[#E98B50] absolute right-2.5 top-2" />
            </div>
          </div>

          {/* Duration */}
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[9px] font-mono uppercase text-[#8F8477] block mb-0.5">
              Duration
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] font-mono focus:outline-none"
            >
              <option value={1}>1 Day</option>
              <option value={2}>2 Days</option>
              <option value={3}>3 Days</option>
              <option value={4}>4 Days</option>
              <option value={5}>5 Days</option>
            </select>
          </div>
        </div>

        {/* Arrival & Departure Times */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono uppercase text-[#8F8477] block mb-0.5">
              Arrival Time
            </label>
            <input
              type="text"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase text-[#8F8477] block mb-0.5">
              Departure Time
            </label>
            <input
              type="text"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Start & End Points */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-mono uppercase text-[#8F8477] block mb-0.5">
              Start Point
            </label>
            <input
              type="text"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase text-[#8F8477] block mb-0.5">
              End Point
            </label>
            <input
              type="text"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              className="w-full bg-[#100F0E] border border-[#262421] focus:border-[#E98B50] rounded-xl px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Button in #E98B50 / #FEF2A0 */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2 rounded-xl bg-[#E98B50] hover:bg-[#FEF2A0] text-[#0C0B0A] font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg disabled:opacity-50 mt-1"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating Blueprint...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Itinerary</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Itinerary (Streamlined, Less Dense) */}
      {itinerary && (
        <div className="space-y-3 animate-in fade-in">
          {/* Summary Callout */}
          <div className="bg-[#181613] border border-[#3E3426] rounded-2xl p-3 shadow-xl">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#28231B]">
              <span className="text-[10px] font-mono text-[#FEF2A0] uppercase font-bold">
                {itinerary.planTitle}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] font-mono text-[#F3CD97] hover:text-[#FEF2A0]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                {onSaveGeneratedTrip && (
                  <button
                    onClick={handleSaveAsTrip}
                    disabled={savedSuccess}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#E98B50] hover:text-[#FEF2A0]"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-[#F3CD97] font-serif italic">
              "{itinerary.styleRationale}"
            </p>
          </div>

          {/* Days */}
          {itinerary.days.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-[#141312] border border-[#262421] rounded-2xl p-3 shadow-xl space-y-2"
            >
              <div className="flex items-center justify-between border-b border-[#262421] pb-1.5">
                <span className="text-xs font-serif font-medium text-[#FEF2A0]">
                  {day.date} · {day.focus}
                </span>
                <span className="text-[10px] font-mono text-[#8F8477]">
                  {day.items.length} stops
                </span>
              </div>

              <div className="space-y-1.5">
                {day.items.map((item, i) => {
                  const isFood = item.category === 'food';
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-[#181715] border border-[#262421]"
                    >
                      <span className="w-14 shrink-0 font-mono text-[11px] text-[#FEF2A0]">
                        {item.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-serif text-xs font-medium text-[#FAF8F5]">
                            {item.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[#201D1A] text-[9px] font-mono text-[#8F8477]">
                            {item.duration}
                          </span>
                          {isFood && (
                            <span className="px-1.5 py-0.2 rounded bg-[#2D1B14] text-[9px] font-mono text-[#E98B50]">
                              Food DNA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8F8477] font-serif mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
