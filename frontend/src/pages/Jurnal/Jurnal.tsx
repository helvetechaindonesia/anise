import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useEffect, useState } from 'react';
import { BookOpen, CaretRight, PushPin, ChatCircleText, CheckCircle, Heart, SpinnerGap, PaperPlaneRight, QrCode, X, Star } from '@phosphor-icons/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Jurnal() {
  const { token, setActiveTab, selectedTeacherFilter, setSelectedTeacherFilter } = useAppStore();
  const { jurnalList, setJurnalList } = useDataStore();
  const [isLoading, setIsLoading] = useState(true);

  // Comment states
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Action menu states
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const [activeActionCommentId, setActiveActionCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeScanJournalId, setActiveScanJournalId] = useState<string | null>(null);

  // Late Reason States
  const [lateReasonJournalId, setLateReasonJournalId] = useState<string | null>(null);
  const [lateReasonText, setLateReasonText] = useState('');

  // Rating States
  const [ratingJournalId, setRatingJournalId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    fetch(API_BASE_URL + '/api/jurnal', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success') {
          setJurnalList(json.data);
        }
      })
      .catch(err => console.error("Gagal load jurnal:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLike = async (id: string, currentlyLiked: boolean) => {
    // Optimistic UI update
    setJurnalList(jurnalList.map((j: any) => {
      if (j.id === id) {
        return {
          ...j,
          isLiked: !currentlyLiked,
          likes: currentlyLiked ? j.likes - 1 : j.likes + 1
        };
      }
      return j;
    }));

    try {
      await fetch(API_BASE_URL + '/api/jurnal/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ journal_id: id })
      });
    } catch (err) {
      console.error("Gagal like:", err);
      // Revert on error (optional, skipping for brevity)
    }
  };

  const handleOpenComment = async (id: string) => {
    if (activeCommentId === id) {
      setActiveCommentId(null);
      return;
    }
    setActiveCommentId(id);
    setIsLoadingComments(true);
    setCommentsData([]);

    try {
      const res = await fetch(API_BASE_URL + `/api/jurnal/comments?journal_id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCommentsData(data.data);
      }
    } catch (err) {
      console.error("Gagal load comments:", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const isEditing = !!editingCommentId;
      const res = await fetch(API_BASE_URL + '/api/jurnal/comment', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(isEditing
          ? { comment_id: editingCommentId, comment_text: commentText }
          : { journal_id: id, comment_text: commentText }
        )
      });
      const data = await res.json();

      if (data.status === 'success') {
        setCommentText('');
        setEditingCommentId(null);
        // Refresh comments & count
        handleOpenComment(id);
        if (!isEditing) {
          setJurnalList(jurnalList.map((j: any) =>
            j.id === id ? { ...j, comments: j.comments + 1 } : j
          ));
        }
      } else {
        alert(data.message || "Gagal menyimpan komentar");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const startPress = (c: any) => {
    if (!c.can_edit && !c.can_delete) return;
    longPressTimer.current = setTimeout(() => {
      setActiveActionCommentId(c.id);
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDeleteComment = async (commentId: string, journalId: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      const res = await fetch(API_BASE_URL + '/api/jurnal/comment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ comment_id: commentId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActiveActionCommentId(null);
        handleOpenComment(journalId);
        setJurnalList(jurnalList.map((j: any) => j.id === journalId ? { ...j, comments: Math.max(0, j.comments - 1) } : j));
      } else {
        alert(data.message || 'Gagal menghapus');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const openScanner = (journalId: string) => {
    setActiveScanJournalId(journalId);
    setIsScannerOpen(true);
  };

  const closeScanner = () => {
    setIsScannerOpen(false);
    setActiveScanJournalId(null);
  };

  const submitLateReason = async () => {
    if (!lateReasonText.trim() || !lateReasonJournalId) return;
    try {
      const res = await fetch(API_BASE_URL + '/api/jurnal/scan_reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ journal_id: lateReasonJournalId, reason: lateReasonText })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Kehadiran (Terlambat) berhasil dicatat!');
        setJurnalList(jurnalList.map((j: any) => j.id === lateReasonJournalId ? { ...j, has_scanned: true } : j));
        setLateReasonJournalId(null);
        setLateReasonText('');
      } else {
        alert(data.message || 'Gagal menyimpan alasan');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const submitRating = async () => {
    if (!ratingValue || !ratingJournalId) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/jurnal/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ journal_id: ratingJournalId, rating: ratingValue, comment: ratingComment })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert('Penilaian berhasil disimpan!');
        setJurnalList(jurnalList.map((j: any) => j.id === ratingJournalId ? { ...j, has_rated: true } : j));
        setRatingJournalId(null);
        setRatingValue(0);
        setRatingComment('');
      } else {
        alert(data.message || 'Gagal menyimpan penilaian');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    let html5QrcodeScanner: Html5QrcodeScanner | null = null;
    if (isScannerOpen && activeScanJournalId) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      html5QrcodeScanner.render(async (decodedText) => {
        if (html5QrcodeScanner) {
          html5QrcodeScanner.clear();
        }
        setIsScannerOpen(false);
        try {
          const res = await fetch(API_BASE_URL + '/api/jurnal/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ qr_data: decodedText })
          });
          const data = await res.json();
          if (data.status === 'success') {
            alert('Kehadiran berhasil dicatat!');
            // Update UI locally
            setJurnalList(jurnalList.map((j: any) => j.id === activeScanJournalId ? { ...j, has_scanned: true } : j));
          } else if (data.status === 'late_required_reason') {
            setLateReasonJournalId(data.journal_id);
          } else {
            alert(data.message || 'Gagal merekam presensi');
          }
        } catch (err) {
          alert('Terjadi kesalahan saat memproses QR');
        }
      }, (error) => {
        // Handle scan failure silently
      });
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [isScannerOpen, activeScanJournalId]);

  // Sort and highlight active journals
  const todayDateStr = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toTimeString().substring(0, 5);

  const displayedJurnalList = selectedTeacherFilter
    ? jurnalList.filter((j: any) => j.teacher === selectedTeacherFilter.name)
    : jurnalList;

  const sortedJurnalList = [...displayedJurnalList].sort((a, b) => {
    const isAActive = a.teaching_date === todayDateStr && a.start_time <= nowStr && a.end_time >= nowStr;
    const isBActive = b.teaching_date === todayDateStr && b.start_time <= nowStr && b.end_time >= nowStr;
    if (isAActive && !isBActive) return -1;
    if (!isAActive && isBActive) return 1;

    // 1.5 Unrated journals (past but not rated)
    const isAUnrated = !isAActive && (a.teaching_date < todayDateStr || (a.teaching_date === todayDateStr && a.end_time < nowStr)) && !a.has_rated;
    const isBUnrated = !isBActive && (b.teaching_date < todayDateStr || (b.teaching_date === todayDateStr && b.end_time < nowStr)) && !b.has_rated;
    if (isAUnrated && !isBUnrated) return -1;
    if (!isAUnrated && isBUnrated) return 1;

    // 2. Upcoming journals today priority (nearest start_time ascending)
    const isAUpcoming = a.teaching_date === todayDateStr && a.start_time > nowStr;
    const isBUpcoming = b.teaching_date === todayDateStr && b.start_time > nowStr;

    if (isAUpcoming && !isBUpcoming) return -1;
    if (!isAUpcoming && isBUpcoming) return 1;

    if (isAUpcoming && isBUpcoming) {
      return a.start_time.localeCompare(b.start_time);
    }

    // 3. The rest (past today, or other days), sort by date/time descending (most recent past first)
    const timeA = new Date(a.postedAt || `${a.teaching_date}T${a.start_time}`).getTime() || 0;
    const timeB = new Date(b.postedAt || `${b.teaching_date}T${b.start_time}`).getTime() || 0;

    return timeB - timeA;
  });

  return (
    <div className="space-y-5 pt-5 animate-in fade-in duration-200 pb-20">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-[#19414d]">
          Jadwal Pelajaran
        </h2>
        <p className="text-xs text-[#6b6375]">
          Materi dan tugas terbaru dari bapak/ibu guru.
        </p>

        {/* Filter Indicator */}
        {selectedTeacherFilter && (
          <div className="mt-3 flex items-center justify-between bg-[#19414d]/10 border border-[#19414d]/20 px-3 py-2 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6b6375] uppercase tracking-wide">Menampilkan Jadwal:</span>
              <span className="text-sm font-bold text-[#19414d]">{selectedTeacherFilter.name}</span>
            </div>
            <button
              onClick={() => setSelectedTeacherFilter(null)}
              className="p-1.5 bg-white rounded-full text-[#19414d] hover:bg-rose-50 hover:text-rose-500 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Lihat Tugas Card */}
      {!selectedTeacherFilter && (
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
      )}

      <div className="space-y-4 mt-2">
        {isLoading ? (
          <div className="flex justify-center p-8"><SpinnerGap className="w-8 h-8 text-[#19414d] animate-spin" /></div>
        ) : sortedJurnalList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#e5e4e7] mt-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-emerald-500" weight="duotone" />
            </div>
            <h3 className="text-[#121212] font-bold mb-1">Belum Ada Jadwal</h3>
            <p className="text-xs text-[#6b6375]">Bapak/ibu guru belum memposting jadwal materi atau tugas.</p>
          </div>
        ) : (
          sortedJurnalList.map((j) => {
            const isActive = j.teaching_date === todayDateStr && j.start_time <= nowStr && j.end_time >= nowStr;
            const isPast = j.teaching_date < todayDateStr || (j.teaching_date === todayDateStr && j.end_time < nowStr);
            const isUnrated = isPast && !j.has_rated;
            return (
              <div key={j.id} className={`bg-white rounded-[20px] p-5 shadow-sm border relative overflow-hidden ${isActive ? 'border-emerald-500/30 shadow-emerald-500/10' : isUnrated ? 'border-amber-500/30 shadow-amber-500/10' : 'border-[#e5e4e7]'}`}>
                {/* Status Indicator */}
                {isActive && (
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                )}
                {isUnrated && !isActive && (
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                )}
                {/* Social Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#19414d] to-[#2a6d82] text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm border-2 border-[#e5e4e7]/50 mt-0.5">
                    {j.teacher.charAt(0)}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-[3.5rem] py-0.5">
                    <h4 className="text-[14px] font-bold text-[#121212] leading-none mb-1">{j.teacher}</h4>
                    <div className="mb-0.5 flex gap-1">
                      <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wide leading-none">
                        {j.subject}
                      </span>
                      {isActive && (
                        <span className="inline-block bg-rose-50 text-rose-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-200 uppercase tracking-wide leading-none animate-pulse">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[9px] text-[#6b6375] font-medium leading-none">
                        {new Date(j.postedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                      {(j.start_time && j.end_time) && (
                        <p className="text-[9px] font-bold text-[#19414d] leading-none">
                          {j.start_time} - {j.end_time} WIB
                        </p>
                      )}
                    </div>
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

                  {j.link && (
                    <div className="pt-1">
                      <a href={j.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#19414d] hover:underline bg-[#fcfbf7] px-3 py-2 rounded-xl border border-[#e5e4e7]">
                        🔗 {j.link}
                      </a>
                    </div>
                  )}

                  {j.images && j.images.length > 0 && (
                    <div className="pt-2">
                      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 scrollbar-hide">
                        {j.images.map((imgUrl, idx) => (
                          <div key={idx} className="min-w-full snap-center shrink-0">
                            <img src={imgUrl} alt={`Lampiran ${idx + 1}`} className="w-full h-auto rounded-xl border border-[#e5e4e7] max-h-64 object-cover" />
                          </div>
                        ))}
                      </div>
                      {j.images.length > 1 && (
                        <div className="flex justify-center gap-1.5 mt-1">
                          {j.images.map((_, idx) => (
                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-[#19414d]/20"></div>
                          ))}
                        </div>
                      )}
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
                <div className="pt-3 border-t border-[#e5e4e7] flex flex-wrap items-center justify-between text-xs font-bold text-[#6b6375]">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleOpenComment(j.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${activeCommentId === j.id ? 'text-[#19414d]' : 'hover:text-[#19414d]'}`}
                    >
                      <ChatCircleText className="w-5 h-5" weight={activeCommentId === j.id ? 'fill' : 'duotone'} /> {j.comments} Komentar
                    </button>
                    <button
                      onClick={() => handleLike(j.id, j.isLiked ?? false)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${j.isLiked ? 'text-rose-500' : 'hover:text-rose-500'}`}
                    >
                      <Heart className="w-5 h-5" weight={j.isLiked ? 'fill' : 'duotone'} /> {j.likes} Suka
                    </button>
                  </div>
                </div>

                {/* Attendance CTA */}
                {isActive && (
                  <div className="mt-3">
                    {j.has_scanned ? (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-bold flex justify-center items-center gap-1.5 border border-emerald-100">
                        <CheckCircle className="w-4 h-4" weight="fill" /> Presensi Tercatat
                      </div>
                    ) : (
                      <button
                        onClick={() => openScanner(j.id)}
                        className="w-full py-2 bg-[#19414d] text-white rounded-xl text-center text-xs font-bold shadow-md hover:bg-[#122e36] transition-colors flex justify-center items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" weight="bold" /> Cek Kehadiran
                      </button>
                    )}
                  </div>
                )}

                {/* Rating CTA */}
                {isPast && (
                  <div className="mt-3">
                    {j.has_rated ? (
                      <div className="w-full py-2 bg-slate-50 text-slate-500 rounded-xl text-center text-xs font-bold flex justify-center items-center gap-1.5 border border-slate-200">
                        <CheckCircle className="w-4 h-4" weight="fill" /> Telah Dinilai
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingJournalId(j.id)}
                        className="w-full py-2 bg-amber-500 text-white rounded-xl text-center text-xs font-bold shadow-md hover:bg-amber-600 transition-colors flex justify-center items-center gap-1.5"
                      >
                        <Star className="w-4 h-4" weight="fill" /> Beri Penilaian
                      </button>
                    )}
                  </div>
                )}

                {/* Comment Section (Expandable) */}
                {activeCommentId === j.id && (
                  <div className="mt-4 pt-4 border-t border-[#e5e4e7] animate-in slide-in-from-top-2 duration-200">
                    <h5 className="text-[11px] font-bold text-[#6b6375] mb-3">KOMENTAR ({j.comments})</h5>

                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1">
                      {isLoadingComments ? (
                        <div className="flex justify-center py-2"><SpinnerGap className="w-5 h-5 animate-spin text-[#19414d]" /></div>
                      ) : commentsData.length === 0 ? (
                        <p className="text-[11px] text-center text-[#6b6375] italic">Belum ada komentar.</p>
                      ) : (
                        commentsData.map((c, idx) => (
                          <div
                            key={idx}
                            className="bg-[#fcfbf7] p-2.5 rounded-xl border border-[#e5e4e7] select-none transition-colors"
                            onPointerDown={() => startPress(c)}
                            onPointerUp={cancelPress}
                            onPointerLeave={cancelPress}
                            onPointerCancel={cancelPress}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[11px] font-bold text-[#121212]">{c.author} {c.can_edit && <span className="text-emerald-600">(Anda)</span>}</span>
                              <span className="text-[9px] text-[#6b6375] font-medium">{c.time}</span>
                            </div>
                            <p className="text-[11px] text-[#121212] leading-relaxed">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={(e) => handleSubmitComment(e, j.id)} className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={editingCommentId ? "Edit komentar..." : "Tulis komentar Anda..."}
                        className="flex-1 bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d]"
                      />
                      {editingCommentId && (
                        <button
                          type="button"
                          onClick={() => { setEditingCommentId(null); setCommentText(''); }}
                          className="text-[11px] font-bold text-[#6b6375] px-2"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="bg-[#19414d] text-white p-2 rounded-xl disabled:opacity-50"
                      >
                        {isSubmittingComment ? <SpinnerGap className="w-4 h-4 animate-spin" /> : <PaperPlaneRight className="w-4 h-4" weight="fill" />}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Action Menu Modal */}
      {activeActionCommentId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setActiveActionCommentId(null)}>
          <div className="bg-white rounded-2xl p-4 w-64 space-y-2 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-center text-[#121212] mb-3 text-sm">Opsi Komentar</h3>
            {commentsData.find(c => c.id === activeActionCommentId)?.can_edit && (
              <button
                onClick={() => {
                  const c = commentsData.find(c => c.id === activeActionCommentId);
                  if (c) {
                    setEditingCommentId(c.id);
                    setCommentText(c.text);
                    setActiveActionCommentId(null);
                  }
                }}
                className="w-full py-3 bg-[#fcfbf7] rounded-xl text-[13px] font-bold text-[#19414d] hover:bg-[#e5e4e7] transition-colors"
              >
                Edit Komentar
              </button>
            )}
            {commentsData.find(c => c.id === activeActionCommentId)?.can_delete && (
              <button
                onClick={() => {
                  const c = commentsData.find(c => c.id === activeActionCommentId);
                  if (c) handleDeleteComment(c.id, activeCommentId!);
                }}
                className="w-full py-3 bg-[#fcfbf7] rounded-xl text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
              >
                Hapus Komentar
              </button>
            )}
            <button
              onClick={() => setActiveActionCommentId(null)}
              className="w-full py-2 text-[12px] font-bold text-[#6b6375] mt-1 hover:text-[#121212]"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-80 shadow-2xl relative">
            <button onClick={closeScanner} className="absolute top-4 right-4 text-[#6b6375] hover:text-[#121212] z-10">
              <X className="w-5 h-5" weight="bold" />
            </button>
            <h3 className="font-bold text-[#19414d] text-lg text-center mb-1 mt-2">Scan QR Kelas</h3>
            <p className="text-[11px] text-[#6b6375] text-center mb-4">Arahkan kamera ke layar guru Anda</p>

            <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-[#e5e4e7]"></div>
          </div>
        </div>
      )}

      {/* Late Reason Modal */}
      {lateReasonJournalId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLateReasonJournalId(null)}>
          <div className="bg-white rounded-3xl p-5 w-80 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLateReasonJournalId(null)} className="absolute top-4 right-4 text-[#6b6375] hover:text-[#121212]">
              <X className="w-5 h-5" weight="bold" />
            </button>
            <h3 className="font-bold text-[#19414d] text-lg text-center mb-1 mt-2 text-rose-600">Anda Terlambat!</h3>
            <p className="text-[11px] text-[#6b6375] text-center mb-4">Waktu toleransi kehadiran telah habis. Silakan masukkan alasan keterlambatan Anda.</p>

            <textarea
              value={lateReasonText}
              onChange={(e) => setLateReasonText(e.target.value)}
              placeholder="Alasan terlambat..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2 text-[12px] min-h-[80px] focus:outline-none focus:border-[#19414d] focus:ring-1 focus:ring-[#19414d] mb-3"
            />
            <button
              onClick={submitLateReason}
              className="w-full py-2 bg-[#19414d] text-white rounded-xl text-center text-[12px] font-bold shadow-md hover:bg-[#122e36] transition-colors"
            >
              Kirim Alasan & Absen
            </button>
          </div>
        </div>
      )}
      {/* Rating Modal */}
      {ratingJournalId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-200 p-4" onClick={() => { setRatingJournalId(null); setRatingValue(0); setRatingComment(''); }}>
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setRatingJournalId(null); setRatingValue(0); setRatingComment(''); }} className="absolute top-4 right-4 text-[#6b6375] hover:text-[#121212]">
              <X className="w-5 h-5" weight="bold" />
            </button>
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" weight="fill" />
              </div>
            </div>
            <h3 className="font-bold text-[#19414d] text-lg text-center mb-1">Beri Penilaian</h3>
            <p className="text-[11px] text-[#6b6375] text-center mb-5">Bagaimana pengalaman belajar Anda di kelas ini?</p>

            {/* Star Selector */}
            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="transition-transform hover:scale-110 active:scale-95 p-1"
                >
                  <Star
                    className={`w-8 h-8 ${ratingValue >= star ? 'text-amber-400' : 'text-[#e5e4e7]'}`}
                    weight={ratingValue >= star ? 'fill' : 'regular'}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Tambahkan keterangan atau feedback (opsional)..."
              className="w-full bg-[#fcfbf7] border border-[#e5e4e7] rounded-xl px-3 py-2 text-[12px] min-h-[80px] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 mb-4"
            />

            <button
              onClick={submitRating}
              disabled={isSubmittingRating}
              className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-center text-[13px] font-bold shadow-md hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isSubmittingRating ? 'Menyimpan...' : 'Kirim Penilaian'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
