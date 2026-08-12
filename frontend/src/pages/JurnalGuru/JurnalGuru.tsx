import React, { useState, useEffect } from 'react';
import { PencilSimpleLine, ListChecks, Plus, CheckCircle, SpinnerGap, ChatCircleText, QrCode, X } from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function JurnalGuru() {
  const { token, userProfile } = useAppStore();
  const [activeTab, setActiveTab] = useState<'tulis' | 'riwayat'>('tulis');
  
  // Form State
  const [form, setForm] = useState({
    class_id: '',
    subject_id: '',
    start_time: '',
    end_time: '',
    materi: '',
    catatan: '',
    link: '',
    images_base64: [] as string[]
  });
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [meta, setMeta] = useState<{classes: any[], subjects: any[]}>({classes: [], subjects: []});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Riwayat State
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);

  // QR State
  const [activeQrJournalId, setActiveQrJournalId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(900);
  const qrIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const qrIterationRef = React.useRef<number>(1);

  const fetchQr = async (jid: string, iter: number) => {
    try {
      const res = await fetch(`/api/jurnal/qr?journal_id=${jid}&iteration=${iter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setQrData(data.data.qr_data);
        setQrCountdown(900);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openQr = (jid: string) => {
    setActiveQrJournalId(jid);
    setQrData(null);
    setQrCountdown(900);
    qrIterationRef.current = 1;
    fetchQr(jid, 1);
    
    qrIntervalRef.current = setInterval(() => {
      qrIterationRef.current += 1;
      fetchQr(jid, qrIterationRef.current);
    }, 900000); // 15 mins
    
    countdownIntervalRef.current = setInterval(() => {
      setQrCountdown(prev => (prev > 0 ? prev - 1 : 900));
    }, 1000);
  };

  const closeQr = () => {
    setActiveQrJournalId(null);
    if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // Comment State
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Action menu states
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const [activeActionCommentId, setActiveActionCommentId] = useState<string | null>(null);

  const handleOpenComment = async (id: string) => {
    if (activeCommentId === id) {
      setActiveCommentId(null);
      return;
    }
    setActiveCommentId(id);
    setIsLoadingComments(true);
    setCommentsData([]);
    
    try {
      const res = await fetch(`/api/jurnal/comments?journal_id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCommentsData(data.data || []);
      } else {
        alert(data.message || 'Gagal memuat komentar');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const startPress = (c: any) => {
    if (!c.can_delete) return;
    longPressTimer.current = setTimeout(() => {
      setActiveActionCommentId(c.id);
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDeleteComment = async (commentId: string, journalId: string) => {
    if (!confirm('Hapus komentar ini dari jurnal Anda?')) return;
    try {
      const res = await fetch('/api/jurnal/comment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ comment_id: commentId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActiveActionCommentId(null);
        handleOpenComment(journalId);
        setRiwayat(riwayat.map((j: any) => j.id === journalId ? { ...j, comments_count: Math.max(0, (j.comments_count || 0) - 1) } : j));
      } else {
        alert(data.message || 'Gagal menghapus');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const fetchRiwayat = async () => {
    setIsLoadingRiwayat(true);
    try {
      const res = await fetch('/api/jurnal/guru', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setRiwayat(data.data || []);
      }
    } catch (err) {
      console.error("Gagal load riwayat jurnal:", err);
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch('/api/jurnal/guru/meta', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMeta(data.data || {classes: [], subjects: []});
      }
    } catch (err) {
      console.error("Gagal load meta jurnal:", err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    if (activeTab === 'riwayat') {
      fetchRiwayat();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/jurnal/guru', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSubmitSuccess(true);
        setForm({ class_id: '', subject_id: '', start_time: '', end_time: '', materi: '', catatan: '', link: '', images_base64: [] });
        setImageNames([]);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert(data.message || 'Gagal menyimpan jurnal');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pt-5 pb-24 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-[#19414d]">Jurnal Mengajar</h2>
        <p className="text-xs text-[#6b6375]">Input materi ajar dan lihat riwayat mengajar Anda</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#e5e4e7]/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('tulis')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === 'tulis' ? 'bg-white text-[#19414d] shadow-sm' : 'text-[#6b6375]'
          }`}
        >
          <PencilSimpleLine weight={activeTab === 'tulis' ? 'bold' : 'regular'} className="w-4 h-4" />
          Tulis Jurnal
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === 'riwayat' ? 'bg-white text-[#19414d] shadow-sm' : 'text-[#6b6375]'
          }`}
        >
          <ListChecks weight={activeTab === 'riwayat' ? 'bold' : 'regular'} className="w-4 h-4" />
          Riwayat
        </button>
      </div>

      {/* Tulis Jurnal Form */}
      {activeTab === 'tulis' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-[#e5e4e7] shadow-sm space-y-4">
          {submitSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" weight="fill" />
              <p className="text-[11px] font-bold text-emerald-700">Jurnal mengajar berhasil disimpan!</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6375]">Kelas / Rombel *</label>
              <select
                required
                value={form.class_id}
                onChange={(e) => setForm({...form, class_id: e.target.value})}
                className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
              >
                <option value="">-- Pilih Kelas --</option>
                {meta.classes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6375]">Mata Pelajaran *</label>
              <select
                required
                value={form.subject_id}
                onChange={(e) => setForm({...form, subject_id: e.target.value})}
                className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
              >
                <option value="">-- Pilih Mapel --</option>
                {meta.subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6375]">Waktu Mulai *</label>
              <input 
                type="time" 
                required
                value={form.start_time}
                onChange={(e) => setForm({...form, start_time: e.target.value})}
                className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#6b6375]">Waktu Selesai *</label>
              <input 
                type="time" 
                required
                value={form.end_time}
                onChange={(e) => setForm({...form, end_time: e.target.value})}
                className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Topik Materi *</label>
            <textarea
              required
              rows={3}
              value={form.materi}
              onChange={(e) => setForm({...form, materi: e.target.value})}
              placeholder="Masukkan ringkasan materi yang diajarkan hari ini..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-3 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Pesan / Catatan untuk Siswa (Opsional)</label>
            <textarea
              value={form.catatan}
              onChange={(e) => setForm({...form, catatan: e.target.value})}
              placeholder="Contoh: Kerjakan soal hal 42..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] min-h-[60px] transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Link Materi/Referensi (Opsional)</label>
            <input 
              type="url"
              value={form.link}
              onChange={(e) => setForm({...form, link: e.target.value})}
              placeholder="https://..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#6b6375]">Gambar Tambahan (Bisa lebih dari 1)</label>
            <input 
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  setImageNames(files.map(f => f.name));
                  
                  const promises = files.map(file => {
                    return new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });
                  });
                  
                  Promise.all(promises).then(base64s => {
                    setForm({...form, images_base64: base64s});
                  });
                } else {
                  setImageNames([]);
                  setForm({...form, images_base64: []});
                }
              }}
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2.5 text-[13px] text-[#121212] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] transition-all file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#19414d] file:text-white hover:file:bg-[#122e36]"
            />
            {imageNames.length > 0 && (
              <p className="text-[10px] text-emerald-600 mt-1 font-semibold">{imageNames.length} gambar dipilih</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#19414d] hover:bg-[#122e36] text-white font-bold text-[13px] py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <SpinnerGap className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus weight="bold" className="w-4 h-4" /> Simpan Jurnal
              </>
            )}
          </button>
        </form>
      )}

      {/* Riwayat Tab */}
      {activeTab === 'riwayat' && (
        <div className="space-y-3">
          {isLoadingRiwayat ? (
             <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <SpinnerGap className="w-8 h-8 text-[#19414d] animate-spin mb-2" />
              <p className="text-xs text-[#19414d] font-bold">Memuat riwayat...</p>
            </div>
          ) : riwayat.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-[#e5e4e7]">
              <p className="text-sm text-[#6b6375]">Belum ada riwayat jurnal.</p>
            </div>
          ) : (
            riwayat.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-[#e5e4e7] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#121212]">{item.mapel}</h4>
                    <p className="text-[11px] font-bold text-[#19414d] mt-0.5">Kelas: {item.kelas}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-[#6b6375] bg-[#e5e4e7]/50 px-2 py-1 rounded-md">
                      {item.tanggal}
                    </span>
                    {(item.start_time && item.end_time) && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {item.start_time} - {item.end_time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-[#e5e4e7] mt-2">
                  <p className="text-[12px] text-[#121212] leading-relaxed"><span className="font-bold text-[#6b6375]">Topik:</span> {item.materi}</p>
                  {item.catatan && (
                    <p className="text-[11px] text-[#19414d] mt-2 italic bg-[#19414d]/5 p-2 rounded-lg">"{item.catatan}"</p>
                  )}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-[11px] text-[#19414d] font-bold mt-2 block hover:underline flex items-center gap-1">
                      🔗 {item.link}
                    </a>
                  )}
                  {item.images && item.images.length > 0 && (
                    <div className="mt-2 flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 scrollbar-hide">
                      {item.images.map((imgUrl: string, idx: number) => (
                        <img key={idx} src={imgUrl} alt={`Lampiran ${idx+1}`} className="w-48 h-32 object-cover rounded-xl border border-[#e5e4e7] snap-center shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-[#e5e4e7] flex items-center justify-between">
                  {/* Comments Toggle */}
                  <button 
                    onClick={() => handleOpenComment(item.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${activeCommentId === item.id ? 'text-[#19414d]' : 'text-[#6b6375] hover:text-[#19414d]'}`}
                  >
                    <ChatCircleText className="w-4 h-4" weight={activeCommentId === item.id ? 'fill' : 'duotone'} /> 
                    {item.comments_count || 0} Komentar
                  </button>

                  <button 
                    onClick={() => openQr(item.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" weight="bold" />
                    Tampilkan QR
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentId === item.id && (
                  <div className="mt-3 pt-3 border-t border-[#e5e4e7] animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {isLoadingComments ? (
                        <div className="flex justify-center py-2"><SpinnerGap className="w-5 h-5 animate-spin text-[#19414d]" /></div>
                      ) : commentsData.length === 0 ? (
                        <p className="text-[11px] text-center text-[#6b6375] italic">Belum ada komentar dari siswa.</p>
                      ) : (
                        commentsData.map((c, iidx) => (
                          <div 
                            key={iidx} 
                            className="bg-[#fcfbf7] p-2.5 rounded-xl border border-[#e5e4e7] select-none transition-colors"
                            onPointerDown={() => startPress(c)}
                            onPointerUp={cancelPress}
                            onPointerLeave={cancelPress}
                            onPointerCancel={cancelPress}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[11px] font-bold text-[#121212]">{c.author} <span className="text-[9px] font-normal text-[#6b6375]">({c.role})</span></span>
                              <span className="text-[9px] text-[#6b6375] font-medium">{c.time}</span>
                            </div>
                            <p className="text-[11px] text-[#121212] leading-relaxed">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Menu Modal */}
      {activeActionCommentId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setActiveActionCommentId(null)}>
          <div className="bg-white rounded-2xl p-4 w-64 space-y-2 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-center text-[#121212] mb-3 text-sm">Opsi Komentar</h3>
            <button 
              onClick={() => {
                const c = commentsData.find(c => c.id === activeActionCommentId);
                if (c) handleDeleteComment(c.id, activeCommentId!);
              }}
              className="w-full py-3 bg-[#fcfbf7] rounded-xl text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
            >
              Hapus Komentar
            </button>
            <button 
              onClick={() => setActiveActionCommentId(null)}
              className="w-full py-2 text-[12px] font-bold text-[#6b6375] mt-1 hover:text-[#121212]"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {activeQrJournalId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={closeQr}>
          <div className="bg-white rounded-3xl p-6 w-72 flex flex-col items-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={closeQr} className="absolute top-4 right-4 text-[#6b6375] hover:text-[#121212]">
              <X className="w-5 h-5" weight="bold" />
            </button>
            
            <h3 className="font-bold text-[#19414d] mb-1 text-lg">Presensi Kelas</h3>
            <p className="text-[11px] text-[#6b6375] text-center mb-6">Minta siswa scan QR ini untuk absen kehadiran.</p>
            
            <div className="bg-white p-2 rounded-xl shadow-sm border border-[#e5e4e7] mb-5 min-h-[200px] flex items-center justify-center">
              {qrData ? (
                <QRCodeSVG value={qrData} size={200} />
              ) : (
                <SpinnerGap className="w-8 h-8 animate-spin text-[#19414d]" />
              )}
            </div>
            
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#6b6375]">
              <SpinnerGap className="w-4 h-4 animate-spin" />
              Memperbarui QR dalam <span className="text-emerald-600 font-black">{qrCountdown}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
