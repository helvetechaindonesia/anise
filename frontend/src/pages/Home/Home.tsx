import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { CaretRight, UserList } from '@phosphor-icons/react';
import DigitalCard from '../../components/DigitalCard';
import QuickMenu from '../../components/QuickMenu';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';
import { getDefaultAvatar } from '../../utils/avatar';
import type { TugasItem } from '../../types';
import { CheckCircle, Clock, XCircle, FileText, SpinnerGap } from '@phosphor-icons/react';

export default function Home() {
  const { setActiveTab, role, hasPresensiToday, startPresensi, userProfile, token, setSelectedTeacherFilter } = useAppStore();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const [latestTasks, setLatestTasks] = useState<TugasItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const [poinData, setPoinData] = useState<{ finalScore: number, grade: string } | null>(null);
  const kpiGuruData = useDataStore((state) => state.kpiGuruData);

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const res = await fetch(API_BASE_URL + '/api/siswa/guru', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setTeachers(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTeachers(false);
      }
    };
    
    const fetchTasks = async () => {
      setIsLoadingTasks(true);
      try {
        const res = await fetch(API_BASE_URL + '/api/tugas', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setLatestTasks(data.data?.slice(0, 7) || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    const fetchPoin = async () => {
      try {
        const res = await fetch(API_BASE_URL + '/api/poin', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setPoinData({ finalScore: data.data.finalScore, grade: data.data.grade });
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (token && role === 'siswa') {
      fetchTeachers();
      fetchTasks();
      fetchPoin();
    }
  }, [token, role]);


  const handleTeacherClick = (teacher: any) => {
    setSelectedTeacherFilter({ id: teacher.teacher_id, name: teacher.teacher_name });
    setActiveTab('jurnal');
  };

  const isGuru = userProfile?.role_type?.toLowerCase() === 'guru';
  const displayScore = isGuru ? kpiGuruData.score : (poinData?.finalScore || 100);
  const displayGrade = isGuru ? kpiGuruData.predikatAkhir : (poinData?.grade || 'Baik');

  return (
    <div className="space-y-4 pt-5 animate-in fade-in duration-200">
      <div className="flex flex-col gap-1.5">
        {/* Progress Card */}
        <div
          onClick={() => setActiveTab('poin')}
          className="rounded-[10px] bg-gradient-to-b from-transparent via-black/5 to-black/30 p-[1px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="bg-white rounded-[9px] p-3 h-full w-full">
            <div className="mb-2">
              <h2 className="text-[15px] font-extrabold text-[#19414d] tracking-tight">
                Selamat {new Date().getHours() < 11 ? 'Pagi' : new Date().getHours() < 15 ? 'Siang' : new Date().getHours() < 18 ? 'Sore' : 'Malam'}, {userProfile?.full_name?.split(' ')[0] || (isGuru ? 'Guru' : 'Pelajar')}!!
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((displayScore / 100) * 100, 100)}%` }}></div>
              </div>
              <span className="text-[10px] font-extrabold text-[#6b6375] shrink-0">{displayScore} / 100 ({displayGrade})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pelajar Card / ID Card Digital */}
      <DigitalCard hasPresensiToday={hasPresensiToday} role={role} setActiveTab={setActiveTab} userProfile={userProfile} />

      {/* Quick Menu */}
      <QuickMenu startPresensi={startPresensi} setActiveTab={setActiveTab} />

      {/* Jurnal Pengajar Section */}
      <div className="!mt-8">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider">
            {userProfile?.role_type?.toLowerCase() === 'guru' ? 'Jurnal Mengajar' : 'Jadwal Pelajaran'}
          </h4>
          <UserList className="w-4 h-4 text-[#6b6375]" weight="duotone" />
        </div>
        
        {isLoadingTeachers ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[135px] h-[135px] shrink-0 bg-[#e5e4e7] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white rounded-xl p-4 border border-[#e5e4e7] text-center text-xs text-[#6b6375]">
            Belum ada data guru pengajar
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {[...teachers].sort((a, b) => {
              // 1. Active journal prioritised
              if (a.active_journal_id && !b.active_journal_id) return -1;
              if (!a.active_journal_id && b.active_journal_id) return 1;
              
              // 2. Unrated journal prioritised
              if (a.has_unrated_journal && !b.has_unrated_journal) return -1;
              if (!a.has_unrated_journal && b.has_unrated_journal) return 1;
              
              // 3. Sort by nearest upcoming class (ascending)
              if (a.next_journal_time && !b.next_journal_time) return -1;
              if (!a.next_journal_time && b.next_journal_time) return 1;
              if (a.next_journal_time && b.next_journal_time) {
                return a.next_journal_time.localeCompare(b.next_journal_time);
              }
              
              return 0;
            }).map(t => {
              const isActive = !!t.active_journal_id;
              const hasUnrated = !!t.has_unrated_journal;
              const missingPresensi = isActive && !t.has_presensi;
              return (
              <div
                key={t.teacher_id}
                onClick={() => handleTeacherClick(t)}
                className={`w-[135px] h-[135px] shrink-0 rounded-2xl relative shadow-sm snap-start hover:scale-[1.02] transition-all cursor-pointer flex p-3 pr-3 overflow-hidden group ${
                  isActive 
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-500/20 border border-emerald-300 ring-2 ring-emerald-100' 
                    : hasUnrated
                    ? 'bg-gradient-to-br from-amber-50 to-amber-500/20 border border-amber-300 ring-2 ring-amber-100'
                    : 'bg-gradient-to-br from-[#fcfbf7] to-[#19414d]/10 border border-[#e5e4e7]'
                }`}
              >
                {/* Decorative background shapes for asymmetric look */}
                <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full group-hover:scale-150 transition-transform duration-500 ${isActive ? 'bg-emerald-500/10' : hasUnrated ? 'bg-amber-500/10' : 'bg-[#19414d]/10'}`} />
                <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-3xl ${isActive ? 'bg-emerald-500/20' : hasUnrated ? 'bg-amber-500/20' : 'bg-[#19414d]/5'}`} />
                
                {missingPresensi && (
                  <div className="absolute top-2 left-2 w-3 h-3 bg-rose-500 rounded-full animate-pulse z-20 border-2 border-white shadow-sm" />
                )}

                <div className="flex flex-col w-full h-full justify-between z-10 relative">
                  <div className="w-11 h-11 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 bg-white">
                    <img 
                      src={t.avatar_url || getDefaultAvatar(t.gender)} 
                      alt={t.teacher_name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left w-full mt-auto pt-2">
                    <h5 className={`text-[11px] font-bold leading-tight line-clamp-2 ${isActive ? 'text-emerald-900' : hasUnrated ? 'text-amber-900' : 'text-[#19414d]'}`}>{t.teacher_name}</h5>
                    <p className={`text-[9px] font-semibold mt-0.5 truncate ${isActive ? 'text-emerald-700' : hasUnrated ? 'text-amber-700' : 'text-[#6b6375]'}`}>{t.subjects || 'Pengajar'}</p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Tugas Terbaru */}
      <div className="!mt-8">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-[#6b6375] uppercase tracking-wider">Tugas Terbaru</h4>
          <div 
            onClick={() => setActiveTab('daftar_tugas')}
            className="flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <span className="text-[10px] font-bold text-[#19414d]">Lihat Semua</span>
            <CaretRight className="w-3 h-3 text-[#19414d]" weight="bold" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#e5e4e7] space-y-0">
          {isLoadingTasks ? (
            <div className="flex justify-center p-4">
              <SpinnerGap className="w-6 h-6 text-[#19414d] animate-spin" />
            </div>
          ) : latestTasks.length === 0 ? (
            <div className="text-center text-xs text-[#6b6375] py-2">Belum ada tugas.</div>
          ) : (
            latestTasks.map((tugas, idx) => {
              const isLast = idx === latestTasks.length - 1;
              let StatusIcon = Clock;
              let statusColor = "text-amber-500";
              let statusBg = "bg-amber-50";

              if (tugas.status === 'Selesai') {
                StatusIcon = CheckCircle;
                statusColor = "text-emerald-500";
                statusBg = "bg-emerald-50";
              } else if (tugas.status === 'Terlewat') {
                StatusIcon = XCircle;
                statusColor = "text-rose-500";
                statusBg = "bg-rose-50";
              } else if (tugas.status === 'Belum Dikerjakan') {
                StatusIcon = FileText;
                statusColor = "text-blue-500";
                statusBg = "bg-blue-50";
              }

              return (
                <div key={tugas.id} className="flex flex-col">
                  <div 
                    onClick={() => setActiveTab('daftar_tugas')} 
                    className="flex items-center justify-between py-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-lg ${statusBg} shrink-0`}>
                        <StatusIcon className={`w-4 h-4 ${statusColor}`} weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-[12px] font-bold text-[#121212] truncate group-hover:text-[#19414d] transition-colors">{tugas.title}</h5>
                        <p className="text-[10px] text-[#6b6375] mt-0.5 truncate flex gap-1.5 items-center">
                          <span className="font-semibold text-[#19414d]">{tugas.subject}</span>
                          <span className="w-1 h-1 rounded-full bg-[#e5e4e7]"></span>
                          <span>Tenggat: {tugas.due}</span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${statusColor} border-current/20 uppercase tracking-wide`}>
                        {tugas.status}
                      </span>
                    </div>
                  </div>
                  {!isLast && <div className="w-full h-px bg-[#e5e4e7]/60" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
