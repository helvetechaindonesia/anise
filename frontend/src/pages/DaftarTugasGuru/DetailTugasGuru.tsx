import React, { useState } from 'react';
import { CaretRight, FileText, CheckCircle, Clock, XCircle, Star, ChatCircleText, SpinnerGap } from '@phosphor-icons/react';

const dummySubmissions = [
  { id: 1, name: 'Ahmad Fauzi', status: 'submitted', file: 'makalah_ahmad.pdf', score: 0, comment: '' },
  { id: 2, name: 'Bunga Lestari', status: 'graded', file: 'tugas_bunga.docx', score: 85, comment: 'Bagus sekali, analisisnya tajam.' },
  { id: 3, name: 'Chandra Wijaya', status: 'missing', file: null, score: 0, comment: '' },
];

export default function DetailTugasGuru({ tugas, onBack }: { tugas: any, onBack: () => void }) {
  const [submissions, setSubmissions] = useState(dummySubmissions);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [tempScore, setTempScore] = useState<number | string>('');
  const [tempComment, setTempComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openGradeModal = (sub: typeof dummySubmissions[0]) => {
    setGradingId(sub.id);
    setTempScore(sub.score || '');
    setTempComment(sub.comment || '');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (gradingId === null) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setSubmissions(submissions.map(s => {
        if (s.id === gradingId) {
          return { ...s, status: 'graded', score: Number(tempScore), comment: tempComment };
        }
        return s;
      }));
      setIsSubmitting(false);
      setGradingId(null);
    }, 800);
  };

  return (
    <div className="space-y-6 pt-5 animate-in slide-in-from-right-4 duration-300 pb-24 relative h-full min-h-[80vh]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#19414d]/5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <CaretRight className="w-5 h-5 rotate-180" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d] leading-tight">Detail Tugas</h2>
          <p className="text-[11px] text-[#6b6375] mt-0.5">Penilaian & Monitoring</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#19414d] to-[#256173] rounded-3xl p-5 shadow-lg relative overflow-hidden text-white">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10">
           <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-sm border border-white/10 shadow-inner inline-block mb-3">
            {tugas.subject}
          </span>
          <h3 className="text-xl font-black mb-2 tracking-tight">{tugas.title || 'Judul Tugas'}</h3>
          <div className="flex items-center gap-4 text-sm font-medium text-emerald-100">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-amber-400" weight="bold" />
              <span className="text-[11px]">Tenggat: {tugas.due}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-[#121212] text-[15px] flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" weight="duotone" /> Pengumpulan Siswa
        </h3>
        
        <div className="space-y-3">
          {submissions.map(sub => {
            const isGraded = sub.status === 'graded';
            const isMissing = sub.status === 'missing';
            
            return (
              <div key={sub.id} className="bg-white rounded-2xl border border-[#e5e4e7] p-4 shadow-sm relative overflow-hidden group">
                {isGraded && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                {isMissing && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />}
                {!isGraded && !isMissing && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#121212] text-[13px]">{sub.name}</h4>
                    <p className="text-[10px] font-medium text-[#6b6375] mt-0.5">
                      Status: <span className={isGraded ? 'text-emerald-600' : isMissing ? 'text-rose-600' : 'text-amber-600'}>
                        {isGraded ? 'Telah Dinilai' : isMissing ? 'Belum Mengumpulkan' : 'Menunggu Penilaian'}
                      </span>
                    </p>
                  </div>
                  {isGraded && (
                     <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-center">
                       <p className="text-[10px] text-emerald-700 font-bold leading-none">NILAI</p>
                       <p className="text-[18px] font-black text-emerald-600 leading-none mt-1">{sub.score}</p>
                     </div>
                  )}
                </div>

                {!isMissing && (
                  <div className="mt-3 p-2 bg-[#f8fafc] rounded-lg border border-[#e5e4e7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" weight="fill" />
                      <span className="text-[11px] font-bold text-blue-700">{sub.file}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#e5e4e7] flex gap-2">
                  {!isMissing ? (
                    <button 
                      onClick={() => openGradeModal(sub)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex justify-center items-center gap-1.5 ${
                        isGraded 
                          ? 'border-[#e5e4e7] text-[#19414d] hover:bg-[#f8fafc]' 
                          : 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                      }`}
                    >
                      <Star className="w-4 h-4" weight={isGraded ? 'duotone' : 'bold'} />
                      {isGraded ? 'Edit Nilai' : 'Beri Nilai'}
                    </button>
                  ) : (
                    <button className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-500 border border-rose-100 cursor-not-allowed opacity-70">
                      Belum Ada File
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grading Modal */}
      {gradingId && (
        <div className="fixed inset-0 bg-[#19414d]/40 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[400px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[#19414d] text-lg">Penilaian Tugas</h3>
              <button onClick={() => setGradingId(null)} className="p-2 hover:bg-[#f8fafc] rounded-full text-[#6b6375]">
                <XCircle className="w-6 h-6" weight="fill" />
              </button>
            </div>
            
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 block">Nilai (0-100)</label>
                <input 
                  required
                  type="number"
                  min="0" max="100"
                  value={tempScore}
                  onChange={(e) => setTempScore(e.target.value)}
                  className="w-full text-2xl font-black text-center text-[#19414d] p-3 rounded-2xl border-2 border-[#e5e4e7] bg-[#f8fafc] focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ChatCircleText className="w-3.5 h-3.5" weight="fill" /> Catatan / Evaluasi (Opsional)
                </label>
                <textarea 
                  rows={3}
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
                  placeholder="Bagus sekali, tapi..."
                  className="w-full text-sm font-medium p-3 rounded-2xl border-2 border-[#e5e4e7] bg-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none shadow-sm"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || tempScore === ''}
                className="w-full mt-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <SpinnerGap className="w-5 h-5 animate-spin" /> : 'Simpan Nilai'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
