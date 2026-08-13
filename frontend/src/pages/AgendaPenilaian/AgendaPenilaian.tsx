import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { CaretRight, Clock, CalendarBlank, WarningCircle } from '@phosphor-icons/react';
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
}

export default function AgendaPenilaian() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { token } = useAppStore();

  const [activeSegment, setActiveSegment] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState<AssessmentItem[]>([]);
  const [past, setPast] = useState<AssessmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200 pb-10">
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
                  <span className="text-[10px] font-bold text-[#19414d] bg-[#fcfbf7] px-2 py-1 rounded-md border border-[#e5e4e7]">
                    {item.subject_name}
                  </span>
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
                    {activeSegment === 'upcoming' ? 'Siap-Siap!' : 'Lihat Nilai'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3">
        <WarningCircle className="w-5 h-5 text-amber-600 shrink-0" weight="fill" />
        <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
          Kehadiran saat Ulangan Harian, PTS, dan PAS sangat menentukan nilai rapor. Pastikan untuk selalu hadir tepat waktu.
        </p>
      </div>
    </div>
  );
}
