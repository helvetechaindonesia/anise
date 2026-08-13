import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { CaretRight, Clock, CalendarBlank, WarningCircle, Plus, X, Paperclip, Image, LinkSimple } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';

interface AssessmentItem {
  id: string;
  title: string;
  assessment_type: string;
  formatted_date: string;
  start_time: string;
  end_time: string;
  status: string;
  description: string;
  subject_name: string;
  teacher_name: string;
  class_name?: string;
}

export default function AgendaPenilaian() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { token, userProfile } = useAppStore();
  const isGuru = userProfile?.role_type?.toLowerCase() === 'guru';

  const [activeSegment, setActiveSegment] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState<AssessmentItem[]>([]);
  const [past, setPast] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create Mode States
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'ULANGAN_HARIAN',
    class: '10 IPA 1',
    subject: userProfile?.subjects || 'Matematika',
    date: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(API_BASE_URL + '/api/siswa/assessments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setUpcoming(data.data.upcoming || []);
          setPast(data.data.past || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) {
      fetchAssessments();
    }
  }, [token]);

  const displayList = activeSegment === 'upcoming' ? upcoming : past;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAgenda: AssessmentItem = {
      id: Math.random().toString(36).substring(7),
      title: formData.title,
      assessment_type: formData.type,
      formatted_date: formData.date || 'TBA',
      start_time: formData.startTime || '00:00',
      end_time: formData.endTime || '00:00',
      status: 'Akan Datang',
      description: formData.description,
      subject_name: formData.subject,
      teacher_name: userProfile?.full_name || 'Guru',
      class_name: formData.class
    };

    setUpcoming([newAgenda, ...upcoming]);
    setIsCreating(false);
    
    // Reset form
    setFormData({
      title: '',
      type: 'ULANGAN_HARIAN',
      class: '10 IPA 1',
      subject: userProfile?.subjects || 'Matematika',
      date: '',
      startTime: '',
      endTime: '',
      description: ''
    });
  };

  if (isCreating) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e4e7] px-4 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(false)}
              className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center text-[#121212] hover:bg-[#e5e4e7] transition-colors"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
            <h2 className="text-[15px] font-bold text-[#121212]">Buat Jadwal Penilaian</h2>
          </div>
          <button 
            onClick={handleCreateSubmit}
            className="text-xs font-bold text-white bg-[#19414d] px-4 py-2 rounded-lg hover:bg-[#122e36] active:scale-95 transition-all"
          >
            Simpan
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="p-4 space-y-5 pb-24">
          <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm">
            
            {/* Kelas & Mapel */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Kelas / Rombel</label>
                <select 
                  value={formData.class}
                  onChange={e => setFormData({...formData, class: e.target.value})}
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d]"
                >
                  <option value="10 IPA 1">10 IPA 1</option>
                  <option value="10 IPA 2">10 IPA 2</option>
                  <option value="10 IPS 1">10 IPS 1</option>
                  <option value="11 IPA 1">11 IPA 1</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Mata Pelajaran</label>
                <input 
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d]"
                />
              </div>
            </div>

            {/* Judul */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Judul Penilaian</label>
              <input 
                type="text"
                placeholder="Misal: Ulangan Harian Bab 1"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d]"
              />
            </div>

            {/* Jenis */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Jenis Penilaian</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d]"
              >
                <option value="ULANGAN_HARIAN">Ulangan Harian</option>
                <option value="PTS">Penilaian Tengah Semester (PTS)</option>
                <option value="PAS">Penilaian Akhir Semester (PAS)</option>
                <option value="PRAKTEK">Ujian Praktek</option>
              </select>
            </div>

            {/* Tanggal & Waktu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Tanggal</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d]"
                />
              </div>
              <div className="space-y-1.5 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Mulai</label>
                  <input 
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Selesai</label>
                  <input 
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full text-sm font-semibold p-2.5 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d]"
                  />
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider">Catatan / Instruksi</label>
              <textarea 
                rows={3}
                placeholder="Berikan catatan tambahan untuk siswa (opsional)"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full text-sm font-medium p-3 rounded-xl border border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] resize-none"
              ></textarea>
            </div>
          </div>

          {/* Lampiran */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#121212]">Lampiran Penilaian (Opsional)</h3>
            <div className="flex gap-3">
              <button type="button" className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#e5e4e7] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors gap-2 cursor-pointer">
                <Paperclip className="w-5 h-5 text-[#19414d]" weight="duotone" />
                <span className="text-[10px] font-bold text-[#6b6375]">File PDF/Doc</span>
              </button>
              <button type="button" className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#e5e4e7] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors gap-2 cursor-pointer">
                <Image className="w-5 h-5 text-[#19414d]" weight="duotone" />
                <span className="text-[10px] font-bold text-[#6b6375]">Foto Soal</span>
              </button>
              <button type="button" className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#e5e4e7] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors gap-2 cursor-pointer">
                <LinkSimple className="w-5 h-5 text-[#19414d]" weight="duotone" />
                <span className="text-[10px] font-bold text-[#6b6375]">Link Ujian</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200 pb-10 relative h-full min-h-[80vh]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer"
          >
            <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#19414d]">Agenda Penilaian</h2>
            <p className="text-xs text-[#6b6375]">Jadwal Ulangan, PTS, dan PAS</p>
          </div>
        </div>

        {isGuru && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 bg-[#19414d] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#122e36] transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" weight="bold" />
            <span>Buat Jadwal</span>
          </button>
        )}
      </div>

      <div className="flex rounded-lg bg-white p-1 border border-[#e5e4e7] gap-0.5">
        <button
          onClick={() => setActiveSegment('upcoming')}
          className={`flex-1 text-center px-4 py-2.5 text-xs font-bold rounded-md capitalize transition-all cursor-pointer ${
            activeSegment === 'upcoming'
              ? 'bg-[#19414d] text-white shadow-sm'
              : 'text-[#6b6375] hover:text-[#121212]'
          }`}
        >
          Akan Datang
        </button>
        <button
          onClick={() => setActiveSegment('past')}
          className={`flex-1 text-center px-4 py-2.5 text-xs font-bold rounded-md capitalize transition-all cursor-pointer ${
            activeSegment === 'past'
              ? 'bg-[#19414d] text-white shadow-sm'
              : 'text-[#6b6375] hover:text-[#121212]'
          }`}
        >
          Selesai
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 bg-white rounded-xl border border-[#e5e4e7] opacity-70">
            <p className="text-xs font-bold text-[#19414d]">Memuat jadwal...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-[#e5e4e7] text-center">
            <CalendarBlank className="w-10 h-10 text-[#6b6375] mx-auto opacity-40 mb-2" weight="duotone" />
            <p className="text-xs font-medium text-[#6b6375]">Tidak ada jadwal {activeSegment === 'upcoming' ? 'mendatang' : 'terdahulu'}.</p>
          </div>
        ) : (
          displayList.map(item => {
            let badgeBg = 'bg-[#19414d]/10';
            let badgeText = 'text-[#19414d]';
            let typeLabel = item.assessment_type.replace('_', ' ');

            if (item.assessment_type === 'ULANGAN_HARIAN') {
              badgeBg = 'bg-blue-500/10';
              badgeText = 'text-blue-600';
            } else if (item.assessment_type === 'PTS') {
              badgeBg = 'bg-amber-500/10';
              badgeText = 'text-amber-600';
            } else if (item.assessment_type === 'PAS') {
              badgeBg = 'bg-rose-500/10';
              badgeText = 'text-rose-600';
            } else if (item.assessment_type === 'PRAKTEK') {
              badgeBg = 'bg-emerald-500/10';
              badgeText = 'text-emerald-600';
            }

            return (
              <div
                key={item.id}
                className="bg-white p-4.5 rounded-2xl shadow-sm border border-[#e5e4e7] flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold ${badgeBg} ${badgeText} px-2.5 py-1 rounded-full tracking-wider`}>
                    {typeLabel}
                  </span>
                  <div className="flex gap-2">
                    {item.class_name && (
                      <span className="text-[10px] font-bold text-[#19414d] bg-[#fcfbf7] px-2 py-1 rounded-md border border-[#e5e4e7]">
                        {item.class_name}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-[#19414d] bg-[#fcfbf7] px-2 py-1 rounded-md border border-[#e5e4e7]">
                      {item.subject_name}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[15px] font-bold text-[#121212] leading-tight">{item.title}</h4>
                  <p className="text-[11px] text-[#6b6375] mt-1">{item.description || 'Tidak ada deskripsi'}</p>
                </div>

                <div className="flex flex-col gap-1.5 mt-2 p-3 bg-[#fcfbf7] rounded-xl border border-[#e5e4e7]/60">
                  <div className="flex items-center gap-2 text-xs text-[#121212]">
                    <CalendarBlank className="w-4 h-4 text-[#19414d]" weight="duotone" />
                    <span className="font-semibold">{item.formatted_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#121212]">
                    <Clock className="w-4 h-4 text-[#19414d]" weight="duotone" />
                    <span className="font-semibold">{item.start_time} - {item.end_time} WIB</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 border-t border-[#e5e4e7] pt-3">
                  <span className="text-[10px] text-[#6b6375] font-semibold flex items-center gap-1">
                    Pengawas: <span className="text-[#19414d] font-bold">{item.teacher_name || 'Menunggu'}</span>
                  </span>
                  <button className="text-[10px] font-bold text-white bg-[#19414d] px-3 py-1.5 rounded-lg hover:bg-[#19414d]/90 active:scale-95 transition-all">
                    {isGuru ? 'Edit Jadwal' : (activeSegment === 'upcoming' ? 'Siap-Siap!' : 'Lihat Nilai')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isGuru && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3">
          <WarningCircle className="w-5 h-5 text-amber-600 shrink-0" weight="fill" />
          <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
            Kehadiran saat Ulangan Harian, PTS, dan PAS sangat menentukan nilai rapor. Pastikan untuk selalu hadir tepat waktu.
          </p>
        </div>
      )}
    </div>
  );
}
