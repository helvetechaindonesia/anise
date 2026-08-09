import React from 'react';
import { CaretRight } from '@phosphor-icons/react';
import DigitalCard from '../../components/DigitalCard';
import QuickMenu from '../../components/QuickMenu';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Home() {
  const { setActiveTab, role, hasPresensiToday, startPresensi } = useAppStore();
  const mutasiPoin = useDataStore((state) => state.mutasiPoin);

  const totalPoin = 100 + mutasiPoin.reduce((acc, curr) => acc + curr.points, 0);

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

      {/* Pelajar Card / ID Card Digital */}
      <DigitalCard hasPresensiToday={hasPresensiToday} role={role} setActiveTab={setActiveTab} />

      {/* Quick Menu */}
      <QuickMenu startPresensi={startPresensi} setActiveTab={setActiveTab} />

      {/* Program Section */}
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

      {/* Pengumuman */}
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
  );
}
