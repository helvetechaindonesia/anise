import { create } from 'zustand';
import type { Role, User } from '../types';

interface AppState {
  activeTab: string;
  isAuthenticated: boolean;
  isInitializing: boolean;
  token: string | null;
  role: Role;
  userProfile: User | null;
  showPresensiModal: boolean;
  presensiStep: 'gps' | 'face' | 'success';
  hasPresensiToday: boolean;
  userLocation: { lat: number; lng: number } | null;
  showAiChat: boolean;
  selectedTeacherFilter: { id: string; name: string } | null;
  
  // Actions
  setIsAuthenticated: (auth: boolean) => void;
  setIsInitializing: (init: boolean) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setActiveTab: (tab: string) => void;
  setRole: (role: Role) => void;
  setUserProfile: (profile: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  setShowPresensiModal: (show: boolean) => void;
  setPresensiStep: (step: 'gps' | 'face' | 'success') => void;
  setHasPresensiToday: (has: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  setShowAiChat: (show: boolean) => void;
  setSelectedTeacherFilter: (filter: { id: string; name: string } | null) => void;
  startPresensi: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'home',
  isAuthenticated: false,
  isInitializing: true,
  token: localStorage.getItem('anise_token'),
  role: 'siswa',
  userProfile: null,
  showPresensiModal: false,
  presensiStep: 'gps',
  hasPresensiToday: false,
  userLocation: null,
  showAiChat: false,
  selectedTeacherFilter: null,

  setIsAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setIsInitializing: (init) => set({ isInitializing: init }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('anise_token', token);
    } else {
      localStorage.removeItem('anise_token');
    }
    set({ token });
  },
  logout: async () => {
    const token = get().token;
    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('anise_token');
    set({ isAuthenticated: false, userProfile: null, token: null });
  },
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
  setSelectedTeacherFilter: (filter) => set({ selectedTeacherFilter: filter }),
  
  startPresensi: () => {
    set({ showPresensiModal: true, presensiStep: 'gps' });
    setTimeout(() => {
      set({ userLocation: { lat: -6.2088, lng: 106.8456 }, presensiStep: 'face' });
    }, 2000);
  },
}));
