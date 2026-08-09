import { create } from 'zustand';
import type { Role, User } from '../types';

interface AppState {
  activeTab: string;
  role: Role;
  userProfile: User | null;
  showPresensiModal: boolean;
  presensiStep: 'gps' | 'face' | 'success';
  hasPresensiToday: boolean;
  userLocation: { lat: number; lng: number } | null;
  showAiChat: boolean;
  
  // Actions
  setActiveTab: (tab: string) => void;
  setRole: (role: Role) => void;
  setUserProfile: (profile: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setShowPresensiModal: (show: boolean) => void;
  setPresensiStep: (step: 'gps' | 'face' | 'success') => void;
  setHasPresensiToday: (has: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  setShowAiChat: (show: boolean) => void;
  startPresensi: () => void;
}

const defaultProfile: User = {
  id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  full_name: 'Budi Setiawan',
  username: 'budis',
  email: 'budi@sekolah.id',
  role_type: 'siswa',
  avatar_url: '/assets/budi.png',
  nisn: '0089271822',
  nis: '21221001',
  class_name: 'XI RPL 1',
  behavior_points: 100,
};

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'home',
  role: 'siswa',
  userProfile: defaultProfile,
  showPresensiModal: false,
  presensiStep: 'gps',
  hasPresensiToday: false,
  userLocation: null,
  showAiChat: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setRole: (role) => set({ role }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  updateUserProfile: (updates) => {
    const currentProfile = get().userProfile;
    if (currentProfile) {
      set({ userProfile: { ...currentProfile, ...updates } });
    }
  },
  setShowPresensiModal: (show) => set({ showPresensiModal: show }),
  setPresensiStep: (step) => set({ presensiStep: step }),
  setHasPresensiToday: (has) => set({ hasPresensiToday: has }),
  setUserLocation: (loc) => set({ userLocation: loc }),
  setShowAiChat: (show) => set({ showAiChat: show }),
  
  startPresensi: () => {
    set({ showPresensiModal: true, presensiStep: 'gps' });
    setTimeout(() => {
      set({ userLocation: { lat: -6.2088, lng: 106.8456 }, presensiStep: 'face' });
    }, 2000);
  },
}));
