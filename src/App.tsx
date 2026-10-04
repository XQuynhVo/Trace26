/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Checkpoint, Photo, UserProfile, TravelDna } from './types';
import { INITIAL_TRIPS, INITIAL_USER } from './data/initialTrips';
import { MobileFrame } from './components/MobileFrame';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { RouteMap } from './components/RouteMap';
import { TimelineView } from './components/TimelineView';
import { CoreMemoriesView } from './components/CoreMemoriesView';
import { TravelDnaView } from './components/TravelDnaView';
import { TravelPlannerView } from './components/TravelPlannerView';
import { LocationModal } from './components/LocationModal';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { AiResearchModal } from './components/AiResearchModal';

const STORAGE_KEY = 'komorebi_trips_v1';
const USER_KEY = 'komorebi_user_v1';

export default function App() {
  // Trips state
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved trips:', e);
    }
    return INITIAL_TRIPS;
  });

  const [activeTripId, setActiveTripId] = useState<string>(INITIAL_TRIPS[0].id);

  // User auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read user profile:', e);
    }
    return INITIAL_USER;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('route');

  // Modals state
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetCheckpointId, setUploadTargetCheckpointId] = useState<string | undefined>(undefined);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAiResearchOpen, setIsAiResearchOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.warn('Failed to save trips:', e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to save user:', e);
    }
  }, [currentUser]);

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  // Helper: Recalculate Travel DNA percentages from all photos in trip
  const recalculateTravelDna = (checkpoints: Checkpoint[]): TravelDna => {
    const allPhotos = checkpoints.flatMap((c) => c.photos);
    if (allPhotos.length === 0) return activeTrip.travelDna;

    let foodCount = 0;
    let sightCount = 0;
    let groupCount = 0;
    let selfieCount = 0;
    let streetCount = 0;

    allPhotos.forEach((p) => {
      if (p.category === 'food') foodCount++;
      else if (p.category === 'sightseeing') sightCount++;
      else if (p.category === 'groupPhoto') groupCount++;
      else if (p.category === 'selfie') selfieCount++;
      else if (p.category === 'streetViews') streetCount++;
    });

    const total = allPhotos.length;
    // Normalize to percentages that sum to 100
    const food = Math.round((foodCount / total) * 100) || 50;
    const sightseeing = Math.round((sightCount / total) * 100) || 20;
    const groupPhoto = Math.round((groupCount / total) * 100) || 10;
    const selfie = Math.round((selfieCount / total) * 100) || 10;
    const streetViews = Math.max(0, 100 - (food + sightseeing + groupPhoto + selfie));

    return {
      food,
      sightseeing,
      groupPhoto,
      selfie,
      streetViews,
      personaTitle: food >= 45 ? 'Epicurean Flâneur' : 'Cultural Archivist',
      personaDescription:
        food >= 45
          ? 'Your journey is led by palate first: dedicating half your expedition to unhurried culinary tastings, interspersed with contemplative temples and architectural street vistas.'
          : 'A balanced explorer prioritizing heritage landmarks, urban textures, and intimate portraits.',
      yearlyTripsLogged: activeTrip.travelDna.yearlyTripsLogged,
      totalPhotosCaptured: allPhotos.length,
    };
  };

  // Adding photos workflow
  const handleAddPhotos = (newPhotos: Photo[]) => {
    const updatedCheckpoints = activeTrip.checkpoints.map((cp) => {
      const photosForThisCp = newPhotos.filter((p) => p.locationId === cp.id);
      if (photosForThisCp.length === 0) return cp;

      const combinedPhotos = [...cp.photos, ...photosForThisCp].sort(
        (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
      );

      // Recalculate stay duration if multiple photos
      let stayMin = cp.stayDurationMinutes;
      if (combinedPhotos.length > 1) {
        const first = new Date(combinedPhotos[0].takenAt).getTime();
        const last = new Date(combinedPhotos[combinedPhotos.length - 1].takenAt).getTime();
        const diffMin = Math.max(30, Math.round((last - first) / (1000 * 60)));
        stayMin = diffMin;
      }

      const hours = Math.floor(stayMin / 60);
      const minutes = stayMin % 60;
      const stayDurationFormatted = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

      return {
        ...cp,
        photos: combinedPhotos,
        stayDurationMinutes: stayMin,
        stayDurationFormatted,
      };
    });

    // Re-sort checkpoints strictly chronologically
    updatedCheckpoints.sort(
      (a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
    );

    // Re-index sequence 1..N
    const reindexedCheckpoints = updatedCheckpoints.map((cp, idx) => ({
      ...cp,
      sequenceIndex: idx + 1,
    }));

    const updatedDna = recalculateTravelDna(reindexedCheckpoints);

    const updatedTrip: Trip = {
      ...activeTrip,
      checkpoints: reindexedCheckpoints,
      travelDna: updatedDna,
    };

    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));

    // If modal is currently open for that checkpoint, update the open instance
    if (selectedCheckpoint) {
      const refreshed = reindexedCheckpoints.find((c) => c.id === selectedCheckpoint.id);
      if (refreshed) setSelectedCheckpoint(refreshed);
    }
  };

  // AI synthesize core memories
  const handleAiSynthesize = async () => {
    setIsAiAnalyzing(true);
    try {
      const photoDescriptions = activeTrip.checkpoints.flatMap((cp) =>
        cp.photos.map((p) => ({
          title: p.title,
          category: p.category,
          location: p.locationName,
          time: p.takenAt,
        }))
      );

      const res = await fetch('/api/analyze-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: activeTrip.title,
          photoDescriptions,
          existingLocations: activeTrip.checkpoints.map((c) => c.name),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.coreMemory) {
          const newCoreMemory = {
            id: `cm-ai-${Date.now()}`,
            title: data.coreMemory.title || 'The Sensory Apex of Tokyo',
            locationName: data.coreMemory.locationName || 'Tsukiji Market',
            dateFormatted: data.coreMemory.date || 'April 15',
            badge: data.coreMemory.badge || 'Longest food stop of the trip',
            photoUrl:
              activeTrip.checkpoints.find((c) => c.name.includes('Tsukiji'))?.photos[0]?.url ||
              activeTrip.coverPhoto,
            stayDuration: data.coreMemory.duration || '2h 17m',
            photoCount: data.coreMemory.photoCount || 23,
            isRevisited: true,
            narrative:
              data.coreMemory.narrative ||
              'You stayed here for 2h 17m, You took 23 photos, you revisited this place later, It was one of the most unique places on your trip.',
            tags: ['AI Synthesized', 'Gastronomy Peak', 'Deep Stay'],
          };

          const updatedTrip = {
            ...activeTrip,
            coreMemories: [newCoreMemory, ...activeTrip.coreMemories],
          };
          setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
        }
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSaveGeneratedTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    setActiveTab('route');
  };

  const handleCreateNewTrip = () => {
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: 'Kyoto Teahouses & Zen Arcs',
      subtitle: 'May 2026 · Kansai, Japan',
      country: 'Japan',
      city: 'Kyoto',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80',
      summary: 'Exploring century-old teahouses along the Kamogawa river, bamboo groves at dawn, and ceramic workshops.',
      checkpoints: [
        {
          id: 'cp-kyoto-01',
          sequenceIndex: 1,
          name: 'Kyoto Central Station Arrival',
          japaneseName: '京都駅',
          city: 'Kyoto',
          lat: 34.9858,
          lng: 135.7588,
          arrivalTime: '2026-05-01T09:30:00',
          departureTime: '2026-05-01T10:45:00',
          stayDurationMinutes: 75,
          stayDurationFormatted: '1h 15m',
          photos: [],
          summary: 'Arrival beneath modern steel lattice roof before heading into historic quarters.',
          primaryCategory: 'streetViews',
        },
        {
          id: 'cp-kyoto-02',
          sequenceIndex: 2,
          name: 'Nishiki Market Culinary Promenade',
          japaneseName: '錦市場',
          city: 'Kyoto',
          lat: 35.0050,
          lng: 135.7649,
          arrivalTime: '2026-05-01T11:15:00',
          departureTime: '2026-05-01T13:30:00',
          stayDurationMinutes: 135,
          stayDurationFormatted: '2h 15m',
          photos: [],
          summary: 'The kitchen of Kyoto with dashi omelettes and sweet soy glazed skewers.',
          primaryCategory: 'food',
        },
      ],
      travelDna: {
        food: 50,
        sightseeing: 20,
        groupPhoto: 10,
        selfie: 10,
        streetViews: 10,
        personaTitle: 'Epicurean Flâneur',
        personaDescription: 'Prioritizing culinary stalls and morning markets.',
        yearlyTripsLogged: 5,
        totalPhotosCaptured: 28,
      },
      coreMemories: [],
      totalDistanceKm: 18.2,
      totalDurationDays: 2,
    };

    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
  };

  return (
    <MobileFrame isPhoneFrame={isPhoneFrame}>
      {/* Top Header */}
      <Header
        currentTrip={activeTrip}
        trips={trips}
        onSelectTrip={(t) => setActiveTripId(t.id)}
        onNewTrip={handleCreateNewTrip}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAiResearch={() => setIsAiResearchOpen(true)}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 p-3.5 sm:p-4">
        {activeTab === 'route' && (
          <RouteMap
            trip={activeTrip}
            onSelectCheckpoint={(cp) => setSelectedCheckpoint(cp)}
            onOpenUpload={() => {
              setUploadTargetCheckpointId(undefined);
              setIsUploadOpen(true);
            }}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            trip={activeTrip}
            onOpenUpload={() => {
              setUploadTargetCheckpointId(undefined);
              setIsUploadOpen(true);
            }}
            onSelectCheckpoint={(cp) => setSelectedCheckpoint(cp)}
          />
        )}

        {activeTab === 'memories' && (
          <CoreMemoriesView
            trip={activeTrip}
            onSelectMemoryLocation={(locName) => {
              const cp = activeTrip.checkpoints.find((c) =>
                locName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
              );
              if (cp) setSelectedCheckpoint(cp);
            }}
            onRefreshAiMemories={handleAiSynthesize}
            isAiAnalyzing={isAiAnalyzing}
          />
        )}

        {activeTab === 'dna' && (
          <TravelDnaView
            trip={activeTrip}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />
        )}

        {activeTab === 'planner' && (
          <TravelPlannerView
            pastTrips={trips}
            activeTrip={activeTrip}
            onSaveGeneratedTrip={handleSaveGeneratedTrip}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        photoCount={activeTrip.checkpoints.reduce((acc, c) => acc + c.photos.length, 0)}
      />

      {/* Location Detail Pop-up Window */}
      {selectedCheckpoint && (
        <LocationModal
          checkpoint={selectedCheckpoint}
          onClose={() => setSelectedCheckpoint(null)}
          onOpenUploadForLocation={(cpId) => {
            setUploadTargetCheckpointId(cpId);
            setIsUploadOpen(true);
          }}
        />
      )}

      {/* Upload Pictures & EXIF Extraction Modal */}
      {isUploadOpen && (
        <UploadModal
          checkpoints={activeTrip.checkpoints}
          defaultCheckpointId={uploadTargetCheckpointId}
          onClose={() => setIsUploadOpen(false)}
          onAddPhotos={handleAddPhotos}
        />
      )}

      {/* Sign In & User Profile Modal */}
      {isAuthOpen && (
        <AuthModal
          currentUser={currentUser}
          onClose={() => setIsAuthOpen(false)}
          onSignIn={(user) => setCurrentUser(user)}
          onSignOut={() => setCurrentUser(null)}
        />
      )}

      {/* AI Research / Best Free API Comparison Modal */}
      {isAiResearchOpen && (
        <AiResearchModal onClose={() => setIsAiResearchOpen(false)} />
      )}
    </MobileFrame>
  );
}
