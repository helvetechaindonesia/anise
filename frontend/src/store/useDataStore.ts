import { create } from 'zustand';
import type { Notification, TugasItem, JurnalTimeline, PoinMutasi, HabitItem } from '../types';
import { Sun, Star, Basketball, ForkKnife, BookOpen, UsersThree, Moon } from '@phosphor-icons/react';

interface DataState {
  notifications: Notification[];
  tugasList: TugasItem[];
  jurnalList: JurnalTimeline[];
  mutasiPoin: PoinMutasi[];
  habits: HabitItem[];
  chatMessages: { sender: 'user' | 'bot', text: string }[];
  kpiGuruData: {
    periode: string;
    praktikKinerja: string;
    perilakuKerja: string;
    predikatAkhir: string;
    aspekBerAkhlak: Array<{nama: string, nilai: string, desc: string}>;
    score: number;
  };
  
  // Actions
  setJurnalList: (jurnals: JurnalTimeline[]) => void;
  addNotification: (notif: Notification) => void;
  updateTugasStatus: (id: string, status: TugasItem['status']) => void;
  addPoinMutasi: (mutasi: PoinMutasi) => void;
  toggleHabit: (id: string) => void;
  setHabitsData: (doneToday: string[], streaks: Record<string, number>) => void;
  addChatMessage: (msg: { sender: 'user' | 'bot', text: string }) => void;
}

export const useDataStore = create<DataState>((set) => ({
  notifications: [
    { id: 1, title: 'Tugas Matematika Baru', time: '10m lalu', desc: 'Bab Trigonometri halaman 45', type: 'tugas' },
    { id: 2, title: 'Presensi Berhasil', time: '2j lalu', desc: 'Scan wajah sukses pada 07:12 WIB', type: 'info' },
    { id: 3, title: 'Prestasi: Juara 1 Lomba Coding', time: '1d lalu', desc: 'Mendapat tambahan +50 Poin', type: 'poin' }
  ],
  tugasList: [
    { id: '1', subject: 'Matematika Peminatan', title: 'Trigonometri Lanjut & Analisis Gelombang', due: 'Besok, 12:00 WIB', desc: 'Kerjakan soal latihan A-C pada buku paket halaman 45-47. Tulis tangan dan upload format PDF.', points: 100, status: 'Belum Dikerjakan' },
    { id: '2', subject: 'Bahasa Inggris', title: 'Analytical Exposition Writing Essay', due: '12 Aug, 23:59 WIB', desc: 'Write a 500-word essay about the impact of artificial intelligence in modern classroom management.', points: 80, status: 'Belum Dikerjakan' },
    { id: '3', subject: 'Fisika', title: 'Laporan Praktikum Efek Fotolistrik', due: 'Kemarin', desc: 'Tugas praktikum laboratorium minggu lalu.', points: 150, status: 'Terlewat' },
    { id: '4', subject: 'Kimia', title: 'Senyawa Turunan Benzena', due: 'Selesai 3 hari lalu', desc: 'Tugas mandiri tata nama benzena.', points: 90, status: 'Selesai', submittedFile: 'tugas_benzena_budi.pdf' }
  ],
  jurnalList: [],
  mutasiPoin: [
    { id: 1, title: 'Juara 1 Lomba Coding Nasional', date: '06 Aug 2026', points: 50, type: 'prestasi', notes: 'Diberikan langsung oleh Kepala Sekolah' },
    { id: 2, title: 'Terlambat Masuk Sekolah (>15 Menit)', date: '04 Aug 2026', points: -10, type: 'pelanggaran', notes: 'Toleransi keterlambatan habis' },
    { id: 3, title: 'Membantu Merapikan Perpustakaan', date: '01 Aug 2026', points: 15, type: 'prestasi', notes: 'Apresiasi dari staff pustakawan' },
    { id: 4, title: 'Atribut Seragam Tidak Lengkap', date: '28 Jul 2026', points: -5, type: 'pelanggaran', notes: 'Tidak menggunakan dasi resmi sekolah' }
  ],
  habits: [
    { id: 'h1', title: 'Bangun Pagi', desc: 'Sebelum jam 05:00', iconName: Sun, colorClass: 'bg-amber-100 text-amber-600 border-amber-200', isDone: false, streak: 0 },
    { id: 'h2', title: 'Beribadah', desc: 'Sesuai agama masing-masing', iconName: Star, colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200', isDone: false, streak: 0 },
    { id: 'h3', title: 'Berolahraga', desc: 'Minimal 15 menit', iconName: Basketball, colorClass: 'bg-rose-100 text-rose-600 border-rose-200', isDone: false, streak: 0 },
    { id: 'h4', title: 'Makan Sehat & Bergizi', desc: 'Sayur, lauk, dan buah', iconName: ForkKnife, colorClass: 'bg-orange-100 text-orange-600 border-orange-200', isDone: false, streak: 0 },
    { id: 'h5', title: 'Gemar Belajar', desc: 'Membaca atau mengulang materi', iconName: BookOpen, colorClass: 'bg-blue-100 text-blue-600 border-blue-200', isDone: false, streak: 0 },
    { id: 'h6', title: 'Bermasyarakat', desc: 'Bersosialisasi & berbuat baik', iconName: UsersThree, colorClass: 'bg-indigo-100 text-indigo-600 border-indigo-200', isDone: false, streak: 0 },
    { id: 'h7', title: 'Tidur Cepat', desc: 'Sebelum jam 22:00', iconName: Moon, colorClass: 'bg-purple-100 text-purple-600 border-purple-200', isDone: false, streak: 0 }
  ],
  chatMessages: [
    { sender: 'bot', text: 'Halo Budi! Saya adalah Anise AI Assistant. Ada yang bisa saya bantu terkait jadwal pelajaran, tugas, atau poin prestasi Anda?' }
  ],
  kpiGuruData: {
    periode: 'Juli - Desember 2026',
    praktikKinerja: 'Sesuai Ekspektasi',
    perilakuKerja: 'Sesuai Ekspektasi',
    predikatAkhir: 'Baik',
    score: 88,
    aspekBerAkhlak: [
      { nama: 'Berorientasi Pelayanan', nilai: 'Diatas Ekspektasi', desc: 'Selalu ramah dan cekatan melayani siswa/wali.' },
      { nama: 'Akuntabel', nilai: 'Sesuai Ekspektasi', desc: 'Melaksanakan tugas mengajar dengan jujur dan disiplin.' },
      { nama: 'Kompeten', nilai: 'Sesuai Ekspektasi', desc: 'Terus belajar dan mengembangkan kapabilitas keguruan.' },
      { nama: 'Harmonis', nilai: 'Diatas Ekspektasi', desc: 'Membangun lingkungan kerja yang kondusif.' },
      { nama: 'Loyal', nilai: 'Sesuai Ekspektasi', desc: 'Menjaga nama baik sesama guru, pimpinan, dan sekolah.' },
      { nama: 'Adaptif', nilai: 'Sesuai Ekspektasi', desc: 'Berinovasi dan antusias dalam menggerakkan perubahan.' },
      { nama: 'Kolaboratif', nilai: 'Sesuai Ekspektasi', desc: 'Membangun kerja sama yang sinergis dalam MGMP.' }
    ]
  },

  setJurnalList: (jurnals) => set({ jurnalList: jurnals }),
  addNotification: (notif) => set((state) => ({ notifications: [notif, ...state.notifications] })),
  updateTugasStatus: (id, status) => set((state) => ({
    tugasList: state.tugasList.map(t => t.id === id ? { ...t, status } : t)
  })),
  addPoinMutasi: (mutasi) => set((state) => ({ mutasiPoin: [mutasi, ...state.mutasiPoin] })),
  toggleHabit: (id) => set((state) => ({
    habits: state.habits.map(h => {
      if (h.id === id) {
        const newlyDone = !h.isDone;
        return { ...h, isDone: newlyDone, streak: newlyDone ? h.streak + 1 : Math.max(0, h.streak - 1) };
      }
      return h;
    })
  })),
  setHabitsData: (doneToday, streaks) => set((state) => ({
    habits: state.habits.map(h => ({
      ...h,
      isDone: doneToday.includes(h.id),
      streak: streaks[h.id] || 0
    }))
  })),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] }))
}));
