import React, { useState } from 'react';
import { CaretRight, Fire, Check, Star } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Pembiasaan() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { habits, toggleHabit } = useDataStore();
  
  const [pembiasaanTab, setPembiasaanTab] = useState<'hari_ini' | 'rekap_bulanan'>('hari_ini');

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
                  onClick={() => toggleHabit(habit.id)}
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
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, i) => (
                <div key={i} className="text-[9px] font-bold text-center text-[#6b6375] mb-1">{day}</div>
              ))}

              {/* Simulating 4 weeks of a month */}
              {Array.from({ length: 28 }, (_, i) => {
                const isWeekend = (i % 7 === 5) || (i % 7 === 6);

                let bgColor = 'bg-gray-100 border-transparent';
                if (isWeekend) {
                  bgColor = 'bg-gray-50 flex items-center justify-center text-[8px] text-gray-300';
                } else {
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
  );
}
