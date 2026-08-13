export * from './User';
export type Role = 'siswa' | 'guru';

export interface Notification {
  id: number;
  title: string;
  time: string;
  desc: string;
  type: 'info' | 'tugas' | 'poin';
}

export interface TugasItem {
  id: string;
  subject: string;
  title: string;
  due: string;
  desc: string;
  points: number;
  status: 'Selesai' | 'Belum Dikerjakan' | 'Terlewat' | 'Minta Izin' | 'Izin Diberikan' | 'Izin Ditolak' | 'Aktif';
  submittedFile?: string;
}

export interface JurnalTimeline {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  topic: string;
  hasTask: boolean;
  notes?: string;
  postedAt: string;
  likes: number;
  comments: number;
  teaching_date?: string;
  start_time?: string;
  end_time?: string;
  link?: string;
  images?: string[];
  isLiked: boolean;
  has_scanned?: boolean;
  has_rated?: boolean;
}

export interface PoinMutasi {
  id: number;
  title: string;
  date: string;
  points: number;
  type: 'prestasi' | 'pelanggaran';
  notes: string;
}

export interface HabitItem {
  id: string;
  title: string;
  desc: string;
  iconName: any;
  colorClass: string;
  isDone: boolean;
  streak: number;
}
