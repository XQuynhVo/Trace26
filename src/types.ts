export type PhotoCategory = 'food' | 'sightseeing' | 'groupPhoto' | 'selfie' | 'streetViews';

export interface Photo {
  id: string;
  url: string;
  title: string;
  takenAt: string; // ISO string e.g. "2026-04-15T11:42:00"
  locationId: string;
  locationName: string;
  lat: number;
  lng: number;
  category: PhotoCategory;
  caption?: string;
  isFavorite?: boolean;
  fileSize?: string;
  cameraModel?: string;
}

export interface Checkpoint {
  id: string;
  sequenceIndex: number;
  name: string;
  japaneseName?: string;
  city: string;
  lat: number;
  lng: number;
  arrivalTime: string;
  departureTime: string;
  stayDurationMinutes: number;
  stayDurationFormatted: string; // e.g. "2h 17m"
  photos: Photo[];
  summary: string;
  highlightBadge?: string; // e.g. "Longest food stop of the trip"
  isRevisited?: boolean;
  revisitNote?: string;
  distanceFromPrevKm?: number;
  transitTimeToPrevMinutes?: number;
  primaryCategory: PhotoCategory;
}

export interface TravelDna {
  food: number; // e.g. 50
  sightseeing: number; // e.g. 20
  groupPhoto: number; // e.g. 10
  selfie: number; // e.g. 10
  streetViews: number; // e.g. 10
  personaTitle: string; // e.g. "Sensory Epicurean & Street Archivist"
  personaDescription: string;
  yearlyTripsLogged: number;
  totalPhotosCaptured: number;
}

export interface CoreMemory {
  id: string;
  title: string; // "The best meal of the trip"
  locationName: string; // "Tsukiji Market"
  dateFormatted: string; // "April 15"
  badge: string; // "Your longest food stop of the trip"
  photoUrl: string;
  stayDuration: string; // "2h 17m"
  photoCount: number; // 23
  isRevisited: boolean;
  narrative: string; // "You stayed here for 2h 17m, You took 23 photos, you revisited this place later, It was one of the most unique places on your trip"
  tags: string[];
}

export interface Trip {
  id: string;
  title: string;
  subtitle: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
  coverPhoto: string;
  summary: string;
  checkpoints: Checkpoint[];
  travelDna: TravelDna;
  coreMemories: CoreMemory[];
  totalDistanceKm: number;
  totalDurationDays: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  handle: string;
  homeCity: string;
  memberSince: string;
  tripsCount: number;
  countriesVisited: number;
  travelArchetype: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  category: PhotoCategory | 'arrival' | 'departure';
  duration: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  focus: string;
  items: ItineraryItem[];
}

export interface ItineraryPlan {
  planTitle: string;
  destination: string;
  durationDays: number;
  arrivalTime: string;
  departureTime: string;
  startPoint: string;
  endPoint: string;
  styleRationale: string;
  days: ItineraryDay[];
  source?: string;
}
