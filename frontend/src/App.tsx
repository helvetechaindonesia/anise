import { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DigitalCard from './components/DigitalCard';
import QuickMenu from './components/QuickMenu';
import { 
  TrendUp,
  Clock,
  CheckCircle,
  UploadSimple,
  CaretRight,
  ShieldCheck,
  Bookmarks,
  Question,
  Sparkle,
  Camera,
  Check,
  ChatCircleText,
  MapPin,
  Notebook,
  BookOpen,
  User,
  WarningCircle,
  Heart,
  PushPin,
  CellSignalFull,
  WifiHigh,
  BatteryFull,
  Sun,
  Star,
  Basketball,
  ForkKnife,
  UsersThree,
  Moon,
  Fire
} from '@phosphor-icons/react';

// --- TYPES & DUMMY DATA ---
type Role = 'siswa' | 'guru';

interface Notification {
  id: number;
  title: string;
  time: string;
  desc: string;
  type: 'info' | 'tugas' | 'poin';
}

interface TugasItem {
  id: number;
  subject: string;
  title: string;
  due: string;
  desc: string;
  points: number;
  status: 'Belum Dikerjakan' | 'Selesai' | 'Terlewat';
  submittedFile?: string;
}

interface JurnalTimeline {
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

interface PoinMutasi {
  id: number;
  title: string;
  date: string;
  points: number;
  type: 'prestasi' | 'pelanggaran';
  notes: string;
}

interface HabitItem {
  id: string;
  title: string;
  desc: string;
  iconName: any;
  colorClass: string;
  isDone: boolean;
  streak: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [role, setRole] = useState<Role>('siswa');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Tugas Matematika Baru', time: '10m lalu', desc: 'Bab Trigonometri halaman 45', type: 'tugas' },
    { id: 2, title: 'Presensi Berhasil', time: '2j lalu', desc: 'Scan wajah sukses pada 07:12 WIB', type: 'info' },
    { id: 3, title: 'Prestasi: Juara 1 Lomba Coding', time: '1d lalu', desc: 'Mendapat tambahan +50 Poin', type: 'poin' }
  ]);

  // State Presensi (Face Tracking dummy)
  const [showPresensiModal, setShowPresensiModal] = useState(false);
  const [presensiStep, setPresensiStep] = useState<'gps' | 'face' | 'success'>('gps');
  const [hasPresensiToday, setHasPresensiToday] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // State AI Chat
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
    { sender: 'bot', text: 'Halo Budi! Saya adalah Anise AI Assistant. Ada yang bisa saya bantu terkait jadwal pelajaran, tugas, atau poin prestasi Anda?' }
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  // State Tugas
  const [tugasTab, setTugasTab] = useState<'Belum Dikerjakan' | 'Selesai' | 'Terlewat'>('Belum Dikerjakan');
  const [selectedTugas, setSelectedTugas] = useState<TugasItem | null>(null);

  // --- JURNAL TIMELINE DUMMY DATA ---
  const [jurnalList] = useState<JurnalTimeline[]>([
    {
      id: 1,
      time: '07:00 - 08:30',
      subject: 'Matematika Peminatan',
      teacher: 'Bpk. Ahmad Susanto',
      topic: 'Trigonometri Lanjut & Analisis Gelombang',
      hasTask: true,
      postedAt: '5 menit yang lalu',
      likes: 24,
      comments: 12
    },
    {
      id: 2,
      time: '08:30 - 10:00',
      subject: 'Sejarah Indonesia',
      teacher: 'Ibu Ratna Kumala',
      topic: 'Perang Dunia II & Kemerdekaan RI',
      hasTask: false,
      notes: '"Jangan lupa bawa buku cetak Sejarah Jilid 2 besok ya anak-anak!"',
      postedAt: '2 jam yang lalu',
      likes: 45,
      comments: 8
    }
  ]);
  const [uploadFile, setUploadFile] = useState<string>('');

  const [tugasList, setTugasList] = useState<TugasItem[]>([
    { id: 1, subject: 'Matematika Peminatan', title: 'Trigonometri Lanjut & Analisis Gelombang', due: 'Besok, 12:00 WIB', desc: 'Kerjakan soal latihan A-C pada buku paket halaman 45-47. Tulis tangan dan upload format PDF.', points: 100, status: 'Belum Dikerjakan' },
    { id: 2, subject: 'Bahasa Inggris', title: 'Analytical Exposition Writing Essay', due: '12 Aug, 23:59 WIB', desc: 'Write a 500-word essay about the impact of artificial intelligence in modern classroom management.', points: 80, status: 'Belum Dikerjakan' },
    { id: 3, subject: 'Fisika', title: 'Laporan Praktikum Efek Fotolistrik', due: 'Kemarin', desc: 'Tugas praktikum laboratorium minggu lalu.', points: 150, status: 'Terlewat' },
    { id: 4, subject: 'Kimia', title: 'Senyawa Turunan Benzena', due: 'Selesai 3 hari lalu', desc: 'Tugas mandiri tata nama benzena.', points: 90, status: 'Selesai', submittedFile: 'tugas_benzena_budi.pdf' }
  ]);

  // State Poin
  const [mutasiPoin, setMutasiPoin] = useState<PoinMutasi[]>([
    { id: 1, title: 'Juara 1 Lomba Coding Nasional', date: '06 Aug 2026', points: 50, type: 'prestasi', notes: 'Diberikan langsung oleh Kepala Sekolah' },
    { id: 2, title: 'Terlambat Masuk Sekolah (>15 Menit)', date: '04 Aug 2026', points: -10, type: 'pelanggaran', notes: 'Toleransi keterlambatan habis' },
    { id: 3, title: 'Membantu Merapikan Perpustakaan', date: '01 Aug 2026', points: 15, type: 'prestasi', notes: 'Apresiasi dari staff pustakawan' },
    { id: 4, title: 'Atribut Seragam Tidak Lengkap', date: '28 Jul 2026', points: -5, type: 'pelanggaran', notes: 'Tidak menggunakan dasi resmi sekolah' }
  ]);

  // Tambah Poin Baru (Simulasi Guru input)
  const [newPoinTitle, setNewPoinTitle] = useState('');
  const [newPoinValue, setNewPoinValue] = useState(10);
  const [newPoinType, setNewPoinType] = useState<'prestasi' | 'pelanggaran'>('prestasi');

  const handleAddPoin = () => {
    if (!newPoinTitle.trim()) return;
    const newMutasi: PoinMutasi = {
      id: Date.now(),
      title: newPoinTitle,
      date: 'Hari ini',
      points: newPoinType === 'prestasi' ? Number(newPoinValue) : -Number(newPoinValue),
      type: newPoinType,
      notes: 'Diinput oleh Guru (Demo Mode)'
    };
    setMutasiPoin([newMutasi, ...mutasiPoin]);
    setNewPoinTitle('');
  };

  const totalPoin = 100 + mutasiPoin.reduce((acc, curr) => acc + curr.points, 0);

  // Simulasi Flow Presensi
  const startPresensi = () => {
    setShowPresensiModal(true);
    setPresensiStep('gps');
    setTimeout(() => {
      setUserLocation({ lat: -6.2088, lng: 106.8456 });
      setPresensiStep('face');
    }, 2000);
  };

  // State Pembiasaan (Habit Tracker)
  const [habits, setHabits] = useState<HabitItem[]>([
    { id: 'h1', title: 'Bangun Pagi', desc: 'Sebelum jam 05:00', iconName: Sun, colorClass: 'bg-amber-100 text-amber-600 border-amber-200', isDone: true, streak: 12 },
    { id: 'h2', title: 'Beribadah', desc: 'Sesuai agama masing-masing', iconName: Star, colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200', isDone: true, streak: 8 },
    { id: 'h3', title: 'Berolahraga', desc: 'Minimal 15 menit', iconName: Basketball, colorClass: 'bg-rose-100 text-rose-600 border-rose-200', isDone: false, streak: 2 },
    { id: 'h4', title: 'Makan Sehat & Bergizi', desc: 'Sayur, lauk, dan buah', iconName: ForkKnife, colorClass: 'bg-orange-100 text-orange-600 border-orange-200', isDone: false, streak: 0 },
    { id: 'h5', title: 'Gemar Belajar', desc: 'Membaca atau mengulang materi', iconName: BookOpen, colorClass: 'bg-blue-100 text-blue-600 border-blue-200', isDone: false, streak: 5 },
    { id: 'h6', title: 'Bermasyarakat', desc: 'Bersosialisasi & berbuat baik', iconName: UsersThree, colorClass: 'bg-indigo-100 text-indigo-600 border-indigo-200', isDone: true, streak: 3 },
    { id: 'h7', title: 'Tidur Cepat', desc: 'Sebelum jam 22:00', iconName: Moon, colorClass: 'bg-purple-100 text-purple-600 border-purple-200', isDone: false, streak: 1 }
  ]);
  const [pembiasaanTab, setPembiasaanTab] = useState<'hari_ini' | 'rekap_bulanan'>('hari_ini');

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        const newlyDone = !h.isDone;
        return {
          ...h,
          isDone: newlyDone,
          streak: newlyDone ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    }));
  };

  const doneHabitsCount = habits.filter(h => h.isDone).length;
  const habitProgress = Math.round((doneHabitsCount / habits.length) * 100);

  const finishFaceTracking = () => {
    setPresensiStep('success');
    setTimeout(() => {
      setShowPresensiModal(false);
      setHasPresensiToday(true);
      // Tambah notifikasi presensi sukses
      setNotifications([
        { id: Date.now(), title: 'Presensi Sukses (Wajah + GPS)', time: 'Baru saja', desc: 'Kehadiran tercatat di area sekolah', type: 'info' },
        ...notifications
      ]);
    }, 2000);
  };

  const handleSendChatMessage = () => {
    if (!newChatInput.trim()) return;
    const userMsg = newChatInput;
    const updatedMessages = [...chatMessages, { sender: 'user' as const, text: userMsg }];
    setChatMessages(updatedMessages);
    setNewChatInput('');

    // Simulated AI response
    setTimeout(() => {
      let botResponse = 'Maaf, saya tidak mengerti pertanyaan tersebut. Coba tanyakan mengenai "tenggat tugas" atau "poin prestasi".';
      const msgLower = userMsg.toLowerCase();
      if (msgLower.includes('tugas') || msgLower.includes('pr')) {
        botResponse = 'Anda memiliki 2 tugas yang ditugaskan. Tugas terdekat adalah "Trigonometri Lanjut & Analisis Gelombang" di kelas Matematika Peminatan yang dikumpulkan Besok pukul 12:00 WIB.';
      } else if (msgLower.includes('poin') || msgLower.includes('prestasi') || msgLower.includes('pelanggaran')) {
        botResponse = `Saat ini saldo poin karakter Anda adalah ${totalPoin} Poin. Anda berada di peringkat 5 terbaik se-kelas!`;
      } else if (msgLower.includes('absen') || msgLower.includes('presensi') || msgLower.includes('hadir')) {
        botResponse = hasPresensiToday 
          ? 'Anda sudah melakukan presensi masuk hari ini pada pukul 07:12 WIB dengan status HADIR.' 
          : 'Anda belum melakukan presensi hari ini. Silakan klik tombol "Presensi" di layanan cepat untuk melakukan scan wajah & GPS.';
      } else if (msgLower.includes('halo') || msgLower.includes('hai')) {
        botResponse = 'Halo Budi! Ada yang bisa saya bantu untuk kegiatan belajarmu hari ini?';
      }
      setChatMessages([...updatedMessages, { sender: 'bot' as const, text: botResponse }]);
    }, 1000);
  };

  const handleSubmitTugas = (tugasId: number) => {
    setTugasList(tugasList.map(t => {
      if (t.id === tugasId) {
        return { ...t, status: 'Selesai', submittedFile: uploadFile || 'file_tugas_terunggah.pdf' };
      }
      return t;
    }));
    setSelectedTugas(null);
    setUploadFile('');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212]/5 w-full p-2 sm:p-6 overflow-hidden">
      {/* Outer Phone Bezel - Realistic iPhone Mockup */}
      <div className="relative h-[95vh] max-h-[900px] aspect-[9/19.5] bg-black rounded-[45px] sm:rounded-[55px] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.8)] p-1.5 sm:p-2.5 overflow-hidden border-[6px] sm:border-[8px] border-zinc-800 flex flex-col shrink-0 mx-auto ring-1 ring-zinc-700/50">
        
        {/* Fake Status Bar */}
        <div className="absolute top-2 sm:top-3 left-0 right-0 h-7 flex justify-between items-center px-6 sm:px-8 z-50 text-black pointer-events-none">
          <span className="text-[10px] sm:text-[12px] font-bold tracking-tight w-[54px] text-center mt-0.5">09:41</span>
          
          {/* Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[90px] sm:w-[110px] h-[26px] sm:h-[32px] bg-black rounded-full flex justify-end items-center px-2 sm:px-2.5 shadow-[0_0_1px_rgba(255,255,255,0.2)_inset]">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/10 border border-white/5 mr-0.5 sm:mr-1"></div>
          </div>
          
          <div className="flex items-center justify-end gap-1 sm:gap-1.5 opacity-80 w-[54px]">
            <CellSignalFull className="w-3 h-3 sm:w-3.5 sm:h-3.5" weight="fill" />
            <WifiHigh className="w-3 h-3 sm:w-3.5 sm:h-3.5" weight="bold" />
            <BatteryFull className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" weight="fill" />
          </div>
        </div>

        {/* Fake Home Indicator */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-[4px] sm:h-[5px] bg-black/60 rounded-full z-50 pointer-events-none"></div>

        {/* INNER SCREEN CONTAINER (FLEX COL, NO SCROLL) */}
        <div className="relative flex flex-col w-full h-full bg-[#fcfbf7] rounded-[36px] sm:rounded-[44px] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset]">
          
          {/* TOP BAR / HEADER (TRANSPARAN SEAMLESS) */}
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* PAGE BODY SWITCHER (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto px-5 pt-0 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-4">

              <div className="flex flex-col gap-1.5 pt-5">

                {/* Progress Card */}
                <div 
                  onClick={() => setActiveTab('poin')}
                  className="rounded-[10px] bg-gradient-to-b from-transparent via-black/5 to-black/30 p-[1px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="bg-white rounded-[9px] p-3 h-full w-full">
                    <div className="mb-2">
                      <h2 className="text-[15px] font-extrabold text-[#19414d] tracking-tight">
                        Selamat {new Date().getHours() < 11 ? 'Pagi' : new Date().getHours() < 15 ? 'Siang' : new Date().getHours() < 18 ? 'Sore' : 'Malam'}, Budi!!
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((totalPoin / 100) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#6b6375] shrink-0">{Math.min(totalPoin, 100)} / 100 Poin</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pelajar Card / ID Card Digital - Fluid Responsive Component */}
              <DigitalCard hasPresensiToday={hasPresensiToday} role={role} setActiveTab={setActiveTab} />

              {/* Quick Menu (Circular Buttons Layout) */}
              <QuickMenu startPresensi={startPresensi} setActiveTab={setActiveTab} />

              {/* Program Section (Horizontal Scroll Mockup Layout with Image backgrounds) */}
              <div className="!mt-8">
                <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-3">Program Utama</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                  
                  {/* Card 1 */}
                  <div 
                    style={{ backgroundImage: 'url("/assets/coding.png")' }}
                    className="w-[145px] h-[135px] shrink-0 bg-cover bg-center rounded-2xl overflow-hidden relative shadow-md snap-start hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end">
                      <h5 className="text-xs font-black uppercase tracking-tight text-white">Ekskul Coding</h5>
                      <p className="text-[9px] text-[#fcfbf7]/80 font-semibold mt-0.5 leading-tight">Belajar Web & App Dev</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div 
                    style={{ backgroundImage: 'url("/assets/robotics.png")' }}
                    className="w-[145px] h-[135px] shrink-0 bg-cover bg-center rounded-2xl overflow-hidden relative shadow-md snap-start hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end">
                      <h5 className="text-xs font-black uppercase tracking-tight text-white">Robotika</h5>
                      <p className="text-[9px] text-[#fcfbf7]/80 font-semibold mt-0.5 leading-tight">Assembly & Arduino IoT</p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div 
                    style={{ backgroundImage: 'url("/assets/science.png")' }}
                    className="w-[145px] h-[135px] shrink-0 bg-cover bg-center rounded-2xl overflow-hidden relative shadow-md snap-start hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end">
                      <h5 className="text-xs font-black uppercase tracking-tight text-white">Olimpiade IPA</h5>
                      <p className="text-[9px] text-[#fcfbf7]/80 font-semibold mt-0.5 leading-tight">Persiapan KSN Fisika</p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div 
                    style={{ backgroundImage: 'url("/assets/pramuka.png")' }}
                    className="w-[145px] h-[135px] shrink-0 bg-cover bg-center rounded-2xl overflow-hidden relative shadow-md snap-start hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 flex flex-col justify-end">
                      <h5 className="text-xs font-black uppercase tracking-tight text-white">Pramuka Inti</h5>
                      <p className="text-[9px] text-[#fcfbf7]/80 font-semibold mt-0.5 leading-tight">Pembinaan Karakter</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Slider Info / Info Pengumuman */}
              <div className="!mt-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider">Pengumuman & Agenda</h4>
                  <CaretRight className="w-4 h-4 text-[#6b6375]" />
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e5e4e7] space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-800 p-2 rounded-lg text-xs font-bold">17 Agt</div>
                    <div>
                      <h5 className="text-xs font-bold text-[#121212]">Upacara Hari Kemerdekaan RI ke-81</h5>
                      <p className="text-[11px] text-[#6b6375] mt-0.5">Seluruh siswa dan guru diwajibkan menggunakan baju adat nusantara.</p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-[#e5e4e7]" />
                  <div className="flex items-start gap-3">
                    <div className="bg-[#19414d]/10 text-[#19414d] p-2 rounded-lg text-xs font-bold">20 Agt</div>
                    <div>
                      <h5 className="text-xs font-bold text-[#121212]">Ujian Tengah Semester Ganjil</h5>
                      <p className="text-[11px] text-[#6b6375] mt-0.5">Persiapkan kartu ujian digital Anda di profil.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JURNAL HARIAN */}
          {activeTab === 'jurnal' && (
            <div className="space-y-5 pt-5">
              <div>
                <h2 className="text-xl font-bold text-[#19414d]">Jurnal Harian</h2>
                <p className="text-xs text-[#6b6375]">Rekap materi harian dan penugasan aktif Anda</p>
              </div>

              {/* Lihat Tugas Card */}
              <div 
                onClick={() => setActiveTab('daftar_tugas')}
                className="bg-gradient-to-br from-[#19414d] to-[#122e36] rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-[#19414d]/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-6 h-6 text-emerald-400" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-[#fcfbf7]">Lihat Daftar Tugas</h3>
                    <p className="text-[11px] text-[#fcfbf7]/80 mt-0.5">Kelola PR dan tenggat waktu Anda</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <CaretRight className="w-4 h-4 text-white" weight="bold" />
                </div>
              </div>

              {/* JURNAL TIMELINE FEED */}
              <div className="space-y-4 pt-2">
                {jurnalList.map((j) => (
                  <div key={j.id} className="p-4 rounded-2xl bg-white border border-[#e5e4e7] shadow-sm hover:shadow-md transition-all">
                    {/* Social Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#19414d] text-white flex items-center justify-center font-bold flex-shrink-0">
                        {j.teacher.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[#121212] leading-none">{j.teacher}</h4>
                        <p className="text-[11px] text-[#6b6375] mt-1 font-medium flex items-center gap-1.5">
                          <span className="text-[#19414d]">{j.subject}</span>
                          <span>•</span>
                          <span>{j.postedAt}</span>
                        </p>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="space-y-3 mb-4 pl-1">
                      <div>
                        <p className="text-xs font-bold text-[#19414d] flex items-center gap-1.5 mb-1">
                          <PushPin className="w-4 h-4 text-rose-500" weight="fill" /> MATERI HARI INI:
                        </p>
                        <p className="text-sm font-semibold text-[#121212] leading-relaxed">{j.topic}</p>
                      </div>

                      {j.notes && (
                        <div className="pt-2">
                          <p className="text-xs font-bold text-[#19414d] flex items-center gap-1.5 mb-1">
                            <ChatCircleText className="w-4 h-4 text-[#19414d]" weight="fill" /> PESAN DARI GURU:
                          </p>
                          <p className="text-[13px] text-[#121212] leading-relaxed italic border-l-2 border-[#19414d]/20 pl-2">
                            {j.notes}
                          </p>
                        </div>
                      )}
                      
                      {j.hasTask && (
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <CheckCircle className="w-3 h-3" weight="fill" /> Dilengkapi Tugas Baru
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Social Footer */}
                    <div className="pt-3 border-t border-[#e5e4e7] flex flex-wrap items-center gap-4 text-xs font-bold text-[#6b6375]">
                      <button className="flex items-center gap-1.5 hover:text-[#19414d] transition-colors">
                        <ChatCircleText className="w-5 h-5" weight="duotone" /> {j.comments} Komentar
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                        <Heart className="w-5 h-5" weight="duotone" /> {j.likes} Suka
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DAFTAR TUGAS */}
          {activeTab === 'daftar_tugas' && (
            <div className="space-y-5 pt-5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('jurnal')}
                  className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors"
                >
                  <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#19414d]">Daftar Tugas</h2>
                  <p className="text-xs text-[#6b6375]">Kelola PR dan tenggat waktu akademis Anda</p>
                </div>
              </div>

              {/* Tab Category Filter */}
              <div className="flex rounded-lg bg-white p-1 border border-[#e5e4e7] gap-0.5 overflow-x-auto custom-scrollbar">
                {(['Belum Dikerjakan', 'Selesai', 'Terlewat'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTugasTab(tab)}
                    className={`flex-1 min-w-max text-center px-4 py-2 text-[10px] sm:text-xs font-bold rounded-md capitalize transition-all ${
                      tugasTab === tab 
                        ? 'bg-[#19414d] text-white shadow-sm' 
                        : 'text-[#6b6375] hover:text-[#121212]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tugas List */}
              <div className="space-y-3">
                {tugasList.filter(t => t.status === tugasTab).length === 0 ? (
                  <div className="bg-white rounded-xl p-8 border border-[#e5e4e7] text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto opacity-40 mb-2" weight="duotone" />
                    <p className="text-xs font-medium text-[#6b6375]">Tidak ada tugas di kategori ini.</p>
                  </div>
                ) : (
                  tugasList.filter(t => t.status === tugasTab).map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTugas(t)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-[#e5e4e7] hover:border-[#19414d] transition-all cursor-pointer space-y-2.5 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {t.subject}
                        </span>
                        <span className="text-[10px] text-[#6b6375] font-semibold">{t.points} Poin</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#121212] leading-tight">{t.title}</h4>
                        <p className="text-xs text-[#6b6375] line-clamp-2 mt-1">{t.desc}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[#e5e4e7] text-[10px] font-semibold">
                        <span className={`flex items-center gap-1 ${
                          t.status === 'Terlewat' ? 'text-rose-500' : 
                          t.status === 'Selesai' ? 'text-emerald-500' : 'text-amber-600'
                        }`}>
                          {t.status === 'Selesai' ? <CheckCircle className="w-3.5 h-3.5" weight="fill" /> : <Clock className="w-3.5 h-3.5" />}
                          {t.due}
                        </span>
                        <span className="text-[#19414d] flex items-center gap-1 font-bold">
                          Buka Detail <CaretRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: PEMBIASAAN (HABIT TRACKER) */}
          {activeTab === 'pembiasaan' && (
            <div className="space-y-6 pt-5">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors"
                >
                  <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#19414d]">Pembiasaan</h2>
                  <p className="text-xs text-[#6b6375]">Track 7 Karakter Unggul Harian Anda</p>
                </div>
              </div>

              {/* Tab Hari Ini vs Rekap Bulanan */}
              <div className="flex bg-[#19414d]/5 rounded-xl p-1.5 border border-[#19414d]/10">
                <button
                  onClick={() => setPembiasaanTab('hari_ini')}
                  className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all ${
                    pembiasaanTab === 'hari_ini'
                      ? 'bg-white text-[#19414d] shadow-sm'
                      : 'text-[#6b6375] hover:text-[#19414d]'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setPembiasaanTab('rekap_bulanan')}
                  className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all ${
                    pembiasaanTab === 'rekap_bulanan'
                      ? 'bg-white text-[#19414d] shadow-sm'
                      : 'text-[#6b6375] hover:text-[#19414d]'
                  }`}
                >
                  Rekap Bulan Ini
                </button>
              </div>

              {pembiasaanTab === 'hari_ini' && (
                <>
                  {/* Habit Progress Banner */}
                  <div className="bg-gradient-to-br from-[#19414d] to-[#122e36] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">PROGRES HARI INI</span>
                          <h3 className="text-2xl font-black">{doneHabitsCount} <span className="text-sm font-medium text-white/60">/ 7 Selesai</span></h3>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                          <Fire className="w-6 h-6 text-amber-400" weight="fill" />
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${habitProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-white/70 mt-2 font-medium">
                        {habitProgress === 100 ? 'Luar Biasa! Semua pembiasaan tercapai hari ini! 🎉' : 'Ayo selesaikan pembiasaanmu hari ini! 💪'}
                      </p>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-24 h-24 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
                  </div>

                  {/* Habit List */}
                  <div className="space-y-3">
                {habits.map(habit => {
                  const Icon = habit.iconName;
                  return (
                    <div 
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className={`relative overflow-hidden flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        habit.isDone 
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                          : 'bg-white border-[#e5e4e7] hover:border-[#19414d]/30 hover:shadow-sm'
                      }`}
                    >
                      {/* Left Icon Area */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        habit.isDone ? 'bg-emerald-500 text-white border-emerald-600' : habit.colorClass
                      } transition-colors duration-300`}>
                        <Icon className="w-6 h-6" weight={habit.isDone ? 'fill' : 'duotone'} />
                      </div>

                      {/* Text Content */}
                      <div className="ml-4 flex-1">
                        <h4 className={`text-sm font-bold transition-colors duration-300 ${habit.isDone ? 'text-emerald-900' : 'text-[#121212]'}`}>
                          {habit.title}
                        </h4>
                        <p className={`text-[11px] font-medium mt-0.5 transition-colors duration-300 ${habit.isDone ? 'text-emerald-700/70' : 'text-[#6b6375]'}`}>
                          {habit.desc}
                        </p>
                      </div>

                      {/* Right Side: Streak & Checkmark */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className={`flex flex-col items-center justify-center px-2 py-1 rounded-md ${
                          habit.isDone ? 'bg-emerald-100' : 'bg-[#fcfbf7]'
                        }`}>
                          <span className={`text-[9px] font-bold flex items-center gap-0.5 ${
                            habit.streak > 0 ? 'text-amber-500' : 'text-[#6b6375]/50'
                          }`}>
                            <Fire className="w-3 h-3" weight={habit.streak > 0 ? "fill" : "regular"} /> {habit.streak}
                          </span>
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          habit.isDone ? 'bg-emerald-500 border-emerald-500 text-white scale-110' : 'bg-transparent border-[#e5e4e7] text-transparent'
                        }`}>
                          <Check className="w-4 h-4" weight="bold" />
                        </div>
                      </div>

                      {/* Done overlay ripple effect (aesthetic only) */}
                      {habit.isDone && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-transparent pointer-events-none" />
                      )}
                    </div>
                  );
                })}
                  </div>
                </>
              )}

              {pembiasaanTab === 'rekap_bulanan' && (
                <div className="space-y-5">
                  {/* Monthly Stats */}
                  <div className="bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#121212]">Agustus 2026</h3>
                      <p className="text-[11px] text-[#6b6375] font-medium mt-1">15 / 20 Hari Sempurna (75%)</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <Star className="w-6 h-6" weight="fill" />
                    </div>
                  </div>

                  {/* Contribution Grid */}
                  <div className="bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold text-[#19414d] uppercase tracking-wider">Peta Konsistensi</h4>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500"></div><span className="text-[9px] text-[#6b6375] font-bold">Penuh</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-200"></div><span className="text-[9px] text-[#6b6375] font-bold">Sebagian</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-100"></div><span className="text-[9px] text-[#6b6375] font-bold">Kosong</span></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {['S','S','R','K','J','S','M'].map((day, i) => (
                        <div key={i} className="text-[9px] font-bold text-center text-[#6b6375] mb-1">{day}</div>
                      ))}
                      
                      {/* Simulating 4 weeks of a month */}
                      {Array.from({length: 28}, (_, i) => {
                        const isWeekend = (i % 7 === 5) || (i % 7 === 6);
                        
                        let bgColor = 'bg-gray-100 border-transparent';
                        if (isWeekend) {
                          bgColor = 'bg-gray-50 flex items-center justify-center text-[8px] text-gray-300';
                        } else {
                          // Dummy distribution
                          const rand = Math.random();
                          if (rand > 0.4) bgColor = 'bg-emerald-500 shadow-sm border-emerald-600';
                          else if (rand > 0.15) bgColor = 'bg-emerald-200 border-emerald-300';
                        }

                        return (
                          <div 
                            key={i} 
                            className={`aspect-square rounded-md border ${bgColor} transition-transform hover:scale-110 cursor-default`}
                          >
                            {isWeekend ? '💤' : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POIN */}
          {activeTab === 'poin' && (
            <div className="space-y-6 pt-5">
              <div>
                <h2 className="text-xl font-bold text-[#19414d]">Dashboard Poin & Prestasi</h2>
                <p className="text-xs text-[#6b6375]">Sistem penjaminan mutu karakter siswa & guru</p>
              </div>

              {/* Total Poin Card */}
              <div className="bg-gradient-to-br from-[#19414d] to-[#122e36] text-white p-5 rounded-2xl shadow-lg flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#fcfbf7]/60 block font-semibold">Total Saldo Poin Karakter</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold tracking-tight">{totalPoin}</span>
                    <span className="text-xs font-semibold text-emerald-400">Poin Aktif</span>
                  </div>
                  <span className="text-[10px] text-[#fcfbf7]/70 block mt-2">Peringkat 5 Terbaik dari 32 Siswa</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <TrendUp className="w-7 h-7 text-emerald-400" />
                </div>
              </div>

              {/* SIMULASI GURU INPUT (Untuk demo kelayakan fitur KPI) */}
              <div className="bg-white p-4 rounded-xl border border-[#e5e4e7] space-y-3.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-[#19414d] uppercase tracking-wider">Simulasi Pemberian Poin (Demo Guru)</h3>
                  <span className="text-[9px] px-2 py-0.5 bg-[#19414d]/10 text-[#19414d] font-bold rounded">GURU ROLE</span>
                </div>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Nama Prestasi / Pelanggaran..." 
                    value={newPoinTitle}
                    onChange={(e) => setNewPoinTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={newPoinType}
                      onChange={(e) => setNewPoinType(e.target.value as any)}
                      className="text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                    >
                      <option value="prestasi">Prestasi (+)</option>
                      <option value="pelanggaran">Pelanggaran (-)</option>
                    </select>
                    <input 
                      type="number" 
                      value={newPoinValue}
                      onChange={(e) => setNewPoinValue(Number(e.target.value))}
                      className="text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                      placeholder="Nilai Poin"
                    />
                  </div>
                  <button 
                    onClick={handleAddPoin}
                    className="w-full py-2.5 bg-[#19414d] hover:bg-[#19414d]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Sparkle className="w-3.5 h-3.5" weight="duotone" />
                    Terbitkan Poin Baru
                  </button>
                </div>
              </div>

              {/* Riwayat Mutasi Poin */}
              <div>
                <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider mb-3">Riwayat Mutasi Poin</h4>
                <div className="space-y-2">
                  {mutasiPoin.map(m => (
                    <div key={m.id} className="bg-white p-3.5 rounded-xl border border-[#e5e4e7] flex justify-between items-center hover:shadow-sm transition-all">
                      <div>
                        <h5 className="text-xs font-bold text-[#121212]">{m.title}</h5>
                        <span className="text-[10px] text-[#6b6375] font-light block mt-0.5">{m.date} • {m.notes}</span>
                      </div>
                      <span className={`text-xs font-black shrink-0 ${m.type === 'prestasi' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.points > 0 ? `+${m.points}` : m.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFIKASI (HALAMAN UTUH) */}
          {activeTab === 'notifikasi' && (
            <div className="space-y-5 pt-5 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#19414d]">Kotak Masuk Notifikasi</h2>
                  <p className="text-xs text-[#6b6375]">Pemberitahuan akademik, presensi, dan poin karakter Anda</p>
                </div>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="px-3.5 py-1.5 bg-[#19414d]/10 hover:bg-[#19414d]/20 transition-all rounded-lg text-xs font-bold text-[#19414d]"
                >
                  Kembali
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e4e7] overflow-hidden divide-y divide-[#e5e4e7] shadow-sm">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-[#19414d]/5 transition-colors space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-sm text-[#19414d] flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${n.type === 'tugas' ? 'bg-amber-500' : n.type === 'poin' ? 'bg-emerald-500' : 'bg-[#19414d]'}`} />
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[#6b6375] font-semibold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#6b6375] leading-relaxed pl-3.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 pt-5">
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#19414d] to-teal-500 rounded-full mx-auto p-0.5 shadow-md overflow-hidden">
                  <img 
                    src="/assets/budi.png" 
                    alt="Budi Setiawan" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-base font-bold text-[#121212] mt-3">Budi Setiawan</h3>
                <p className="text-xs text-[#6b6375]">Siswa XI RPL 1 • NISN. 0089271822</p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-[#e5e4e7] text-center">
                  <span className="text-[9px] uppercase tracking-wider text-[#6b6375] block">Kehadiran Bulanan</span>
                  <span className="text-base font-extrabold text-[#19414d] mt-1 block">97.8%</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#e5e4e7] text-center">
                  <span className="text-[9px] uppercase tracking-wider text-[#6b6375] block">Status PWA</span>
                  <span className="text-base font-extrabold text-[#19414d] mt-1 block">Tersedia</span>
                </div>
              </div>

              {/* Settings list */}
              <div className="bg-white rounded-xl border border-[#e5e4e7] overflow-hidden divide-y divide-[#e5e4e7]">
                <div className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5 font-bold text-[#121212]">
                    <ShieldCheck className="w-5 h-5 text-[#19414d]" weight="duotone" />
                    Keamanan Akun
                  </div>
                  <CaretRight className="w-4 h-4 text-[#6b6375]" />
                </div>
                <div className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5 font-bold text-[#121212]">
                    <Bookmarks className="w-5 h-5 text-[#19414d]" weight="duotone" />
                    Kurikulum & Silabus
                  </div>
                  <CaretRight className="w-4 h-4 text-[#6b6375]" />
                </div>
                <div className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5 font-bold text-[#121212]">
                    <Question className="w-5 h-5 text-[#19414d]" weight="duotone" />
                    Pusat Bantuan
                  </div>
                  <CaretRight className="w-4 h-4 text-[#6b6375]" />
                </div>
              </div>

              {/* Demo Mode / Switch Role & PWA Install Button */}
              <div className="space-y-3">
                <button 
                  onClick={() => alert('PWA sudah siap di-install! Silakan tambahkan aplikasi ke beranda Anda melalui menu peramban Anda.')}
                  className="w-full py-3 bg-[#19414d] hover:bg-[#19414d]/90 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                >
                  Install Aplikasi ke Layar Utama
                </button>
                <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-[10px] text-amber-800 font-bold block">Demo Integrasi Stack</span>
                    <span className="text-[9px] text-amber-700">Simulasikan switch role untuk test API endpoint</span>
                  </div>
                  <button 
                    onClick={() => {
                      setRole(role === 'siswa' ? 'guru' : 'siswa');
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Pindah ke {role === 'siswa' ? 'Guru' : 'Siswa'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} startPresensi={startPresensi} />

        {/* FLOATING ACTION BUTTON (AI CHAT) - Fixed floating above bottom navbar inside mobile screen */}
        <div className="absolute bottom-24 sm:bottom-28 right-4 z-40">
          <button 
            onClick={() => setShowAiChat(!showAiChat)}
            className="w-13 h-13 rounded-full bg-[#19414d] text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-[#fcfbf7]/25"
          >
            <ChatCircleText className="w-6.5 h-6.5" weight="duotone" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#fcfbf7]" />
          </button>
        </div>

        {/* MODAL DETIAL TUGAS */}
        {selectedTugas && (
          <div className="absolute inset-0 z-50 bg-[#121212]/60 flex items-end justify-center px-4 pb-4 max-w-[430px] mx-auto rounded-[36px] sm:rounded-[44px] overflow-hidden">
            <div className="bg-white w-full rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-[#19414d] bg-[#19414d]/10 px-2.5 py-1 rounded-full uppercase">
                  {selectedTugas.subject}
                </span>
                <button 
                  onClick={() => setSelectedTugas(null)} 
                  className="text-xs font-bold text-[#6b6375] hover:text-[#121212]"
                >
                  Tutup
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#121212]">{selectedTugas.title}</h3>
                <span className="text-[10px] text-rose-500 font-bold block mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Batas Pengumpulan: {selectedTugas.due}
                </span>
              </div>

              <div className="p-4 bg-[#19414d]/5 rounded-xl border border-[#19414d]/10 mb-6 text-sm text-[#121212] leading-relaxed">
                {selectedTugas.desc}
              </div>
              {selectedTugas.status === 'Belum Dikerjakan' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-[#e5e4e7] rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#fcfbf7] hover:bg-[#19414d]/5 hover:border-[#19414d]/30 transition-colors cursor-pointer group">
                    <UploadSimple className="w-8 h-8 text-[#19414d] mb-2 group-hover:-translate-y-1 transition-transform" />
                    <p className="text-sm font-bold text-[#19414d]">Upload File Tugas</p>
                    <p className="text-xs text-[#6b6375] mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Pesan tambahan untuk guru..." 
                    value={uploadFile}
                    onChange={(e) => setUploadFile(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                  />
                  <button 
                    onClick={() => {
                      handleSubmitTugas(selectedTugas.id);
                      setSelectedTugas(null);
                    }}
                    className="w-full bg-[#19414d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#19414d]/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                  >
                    Submit Tugas Sekarang
                  </button>
                </div>
              )}

              {selectedTugas.status === 'Selesai' && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-medium flex items-center gap-2">
                  <Check className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Tugas Anda telah terkumpul: <span className="font-bold">{selectedTugas.submittedFile}</span></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL PRESENSI GEOLOKASI + FACE TRACKING */}
        {showPresensiModal && (
          <div className="fixed inset-0 z-50 bg-[#121212]/80 flex items-center justify-center p-4 max-w-[430px] mx-auto">
            <div className="bg-white w-full max-w-[360px] rounded-2xl p-5 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              
              {/* STEP 1: DETEKSI GPS */}
              {presensiStep === 'gps' && (
                <div className="space-y-3.5">
                  <div className="w-14 h-14 bg-[#19414d]/10 rounded-full flex items-center justify-center mx-auto text-[#19414d] animate-bounce">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#121212]">Memverifikasi Lokasi</h3>
                    <p className="text-xs text-[#6b6375] mt-1">Mengukur jarak perangkat ke koordinat instansi pendidikan...</p>
                  </div>
                  <div className="flex justify-center items-center gap-2 text-xs font-semibold text-[#19414d]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Mendeteksi satelit GPS... {userLocation ? `(${userLocation.lat}, ${userLocation.lng})` : ''}</span>
                  </div>
                </div>
              )}

              {/* STEP 2: FACE TRACKING */}
              {presensiStep === 'face' && (
                <div className="space-y-4">
                  <div className="relative w-48 h-48 mx-auto rounded-full border-4 border-dashed border-[#19414d] overflow-hidden flex items-center justify-center bg-zinc-900 shadow-inner">
                    {/* Simulated Camera View */}
                    <div className="absolute inset-0 opacity-40 bg-radial-gradient from-teal-500 via-transparent to-transparent flex items-center justify-center">
                      <Camera className="w-12 h-12 text-white animate-pulse" />
                    </div>
                    {/* Face Scan Reticle overlay */}
                    <div className="absolute inset-4 rounded-full border-2 border-emerald-500/60 border-t-transparent border-b-transparent animate-spin duration-[4000ms]" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase z-10 drop-shadow">Kamera Aktif</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#121212]">Scan Wajah Presensi</h3>
                    <p className="text-xs text-[#6b6375] mt-1">Posisikan wajah Anda tepat di tengah bingkai kamera</p>
                  </div>
                  <button 
                    onClick={finishFaceTracking}
                    className="w-full py-2.5 bg-[#19414d] hover:bg-[#19414d]/90 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Simulasi Deteksi Wajah Cocok
                  </button>
                </div>
              )}

              {/* STEP 3: SUKSES */}
              {presensiStep === 'success' && (
                <div className="space-y-3.5">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#121212]">Presensi Berhasil!</h3>
                    <p className="text-xs text-[#6b6375] mt-1">Presensi Budi Setiawan tercatat pukul 07:12 WIB di koordinat sekolah.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* MODAL AI CHAT ASSISTANT - Fixed floating inside the mobile container layout */}
        {showAiChat && (
          <div className="absolute inset-0 z-50 bg-[#121212]/60 flex items-end justify-center px-4 pb-4 max-w-[430px] mx-auto rounded-[36px] sm:rounded-[44px] overflow-hidden">
            <div className="bg-white w-full rounded-2xl p-4.5 space-y-4 max-h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200 mb-20">
              {/* Header Modal */}
              <div className="flex justify-between items-center pb-2 border-b border-[#e5e4e7]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#19414d]/10 flex items-center justify-center text-[#19414d]">
                    <Sparkle className="w-4.5 h-4.5" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#19414d] leading-none">Anise AI Assistant</h3>
                    <span className="text-[9px] text-[#6b6375] font-medium block mt-0.5">Online • Asisten Pendidikan</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAiChat(false)}
                  className="text-xs font-bold text-[#6b6375] hover:text-[#121212] cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-[250px] max-h-[350px]">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-[#19414d] text-white rounded-tr-none' 
                          : 'bg-[#f4f3ec] text-[#121212] rounded-tl-none border border-[#e5e4e7]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="flex gap-2 pt-2 border-t border-[#e5e4e7]">
                <input 
                  type="text" 
                  placeholder="Tanyakan tugas, presensi, atau poin..."
                  value={newChatInput}
                  onChange={(e) => setNewChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1 text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                />
                <button 
                  onClick={handleSendChatMessage}
                  className="px-4 py-2.5 bg-[#19414d] text-white font-bold text-xs rounded-lg hover:bg-[#19414d]/90 transition-all flex items-center justify-center cursor-pointer"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
