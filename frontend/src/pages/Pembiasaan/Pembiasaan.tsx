import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState, useEffect } from 'react';
import { CaretRight, Fire, Check, Star } from '@phosphor-icons/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Pembiasaan() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const token = useAppStore((state) => state.token);
  const { habits, toggleHabit, setHabitsData } = useDataStore();
  
  const [pembiasaanTab, setPembiasaanTab] = useState<'hari_ini' | 'rekap_bulanan'>('hari_ini');
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial fetch for today's habits
  useEffect(() => {
    fetch(API_BASE_URL + '/api/siswa/habits', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setHabitsData(data.done_today, data.streaks);
        }
      })
      .catch(err => console.error("Failed to load habits:", err))
      .finally(() => setIsLoading(false));
  }, [token, setHabitsData]);

  // Fetch monthly stats when tab changes
  useEffect(() => {
    if (pembiasaanTab === 'rekap_bulanan') {
      fetch(API_BASE_URL + '/api/siswa/habits/month', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setMonthlyData(data.data);
            if (data.radar_data) {
              setRadarData(data.radar_data);
            }
          }
        })
        .catch(err => console.error("Failed to load monthly habits:", err));
    }
  }, [pembiasaanTab, token]);

  const handleToggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const targetIsDone = !habit.isDone;
    
    // Optimistic UI update
    toggleHabit(habitId);
    
    try {
      const res = await fetch(API_BASE_URL + '/api/siswa/habits/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          habit_id: habitId,
          is_done: targetIsDone
        })
      });
      const data = await res.json();
      if (data.status !== 'success') {
        // Revert on error
        toggleHabit(habitId);
        alert('Gagal menyimpan pembiasaan');
      }
    } catch (err) {
      // Revert on error
      toggleHabit(habitId);
      alert('Gagal terhubung ke server');
    }
  };

  const doneHabitsCount = habits.filter(h => h.isDone).length;
  const habitProgress = Math.round((doneHabitsCount / habits.length) * 100);

  return (
    <div className="space-y-6 pt-5 animate-in fade-in duration-200">
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
          className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all ${pembiasaanTab === 'hari_ini'
              ? 'bg-white text-[#19414d] shadow-sm'
              : 'text-[#6b6375] hover:text-[#19414d]'
            }`}
        >
          Hari Ini
        </button>
        <button
          onClick={() => setPembiasaanTab('rekap_bulanan')}
          className={`flex-1 flex items-center justify-center py-2.5 text-xs font-bold rounded-lg transition-all ${pembiasaanTab === 'rekap_bulanan'
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
                  onClick={() => handleToggleHabit(habit.id)}
                  className={`relative overflow-hidden flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${habit.isDone
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                      : 'bg-white border-[#e5e4e7] hover:border-[#19414d]/30 hover:shadow-sm'
                    }`}
                >
                  {/* Left Icon Area */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${habit.isDone ? 'bg-emerald-500 text-white border-emerald-600' : habit.colorClass
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
                    <div className={`flex flex-col items-center justify-center px-2 py-1 rounded-md ${habit.isDone ? 'bg-emerald-100' : 'bg-[#fcfbf7]'
                      }`}>
                      <span className={`text-[9px] font-bold flex items-center gap-0.5 ${habit.streak > 0 ? 'text-amber-500' : 'text-[#6b6375]/50'
                        }`}>
                        <Fire className="w-3 h-3" weight={habit.streak > 0 ? "fill" : "regular"} /> {habit.streak}
                      </span>
                    </div>

                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${habit.isDone ? 'bg-emerald-500 border-emerald-500 text-white scale-110' : 'bg-transparent border-[#e5e4e7] text-transparent'
                      }`}>
                      <Check className="w-4 h-4" weight="bold" />
                    </div>
                  </div>

                  {/* Done overlay ripple effect */}
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
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Monthly Stats */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#121212]">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
              <p className="text-[11px] text-[#6b6375] font-medium mt-1">Hari dengan kebiasaan tercatat: {monthlyData.length} hari</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <Star className="w-6 h-6" weight="fill" />
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5e4e7] shadow-sm">
            <h4 className="text-xs font-bold text-[#19414d] uppercase tracking-wider mb-4 text-center">Sebaran Karakter Bulan Ini</h4>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e4e7" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b6375', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 31]} tick={false} axisLine={false} />
                  <Radar name="Skor" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
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
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                <div key={i} className="text-[9px] font-bold text-center text-[#6b6375] mb-1">{day}</div>
              ))}

              {Array.from({ length: 31 }, (_, i) => {
                const dayDate = i + 1;
                // create date string YYYY-MM-DD
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const dayStr = String(dayDate).padStart(2, '0');
                const dateStr = `${year}-${month}-${dayStr}`;

                const dateObj = new Date(dateStr);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                // find if there is data for this date
                const dayData = monthlyData.find(d => d.date === dateStr);
                const count = dayData ? parseInt(dayData.count) : 0;

                let bgColor = 'bg-gray-100 border-transparent';
                if (isWeekend && count === 0) {
                  bgColor = 'bg-gray-50 flex items-center justify-center text-[8px] text-gray-300';
                } else if (count > 0) {
                  if (count === 7) bgColor = 'bg-emerald-500 shadow-sm border-emerald-600';
                  else bgColor = 'bg-emerald-200 border-emerald-300';
                } else if (dateObj > new Date()) {
                  bgColor = 'bg-white border-dashed border-[#e5e4e7] opacity-50';
                }

                return (
                  <div
                    key={i}
                    title={`${dateStr}: ${count} Kebiasaan`}
                    className={`aspect-square rounded-md border ${bgColor} transition-transform hover:scale-110 cursor-default`}
                  >
                    {isWeekend && count === 0 ? '💤' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
