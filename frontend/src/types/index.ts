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
  id: number;
  subject: string;
  title: string;
  due: string;
  desc: string;
  points: number;
  status: 'Belum Dikerjakan' | 'Selesai' | 'Terlewat';
  submittedFile?: string;
}

export interface JurnalTimeline {
  id: number;
  time: string;
  subject: string;
  teacher: string;
  topic: string;
  hasTask: boolean;
  notes?: string;
  postedAt: string;
  likes: number;
  comments: number;
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
