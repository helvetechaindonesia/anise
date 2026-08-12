import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useDataStore } from '../../store/useDataStore';

export default function Notifikasi() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const { userProfile, token } = useAppStore();
  
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [approvingId, setApprovingId] = React.useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      if (userProfile?.role_type?.toLowerCase() === 'guru') {
        const res = await fetch('/api/notifikasi/guru', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setNotifications(data.data || []);
        }
      } else {
        // Fallback or student notifications if implemented
        setNotifications(useDataStore.getState().notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, [token, userProfile]);

  const handleApprove = async (submissionId: string, status: 'Setuju' | 'Tolak') => {
    const note = prompt(`(Opsional) Masukkan catatan mengapa izin ${status.toLowerCase()}:`);
    if (note === null) return; // cancelled

    setApprovingId(submissionId);
    try {
      const res = await fetch('/api/tugas/approve-late', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submission_id: submissionId,
          status: status,
          note: note
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        alert(`Berhasil ${status.toLowerCase()} izin`);
        fetchNotifications();
      } else {
        alert(data.message || 'Gagal merespon izin');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setApprovingId(null);
    }
  };

  return (
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
        {isLoading ? (
          <div className="p-8 text-center text-[#6b6375] text-sm">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-[#6b6375] text-sm">Belum ada notifikasi.</div>
        ) : notifications.map(n => (
          <div key={n.id} className="p-4 hover:bg-[#19414d]/5 transition-colors space-y-2">
            <div className="flex justify-between items-start gap-2">
              <span className="font-bold text-sm text-[#19414d] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${n.type === 'tugas' ? 'bg-amber-500' : n.type === 'poin' ? 'bg-emerald-500' : n.type === 'izin_tugas' ? 'bg-rose-500' : 'bg-[#19414d]'}`} />
                {n.title}
              </span>
              <span className="text-[10px] text-[#6b6375] font-semibold shrink-0">{n.time}</span>
            </div>
            <p className="text-xs text-[#6b6375] leading-relaxed pl-3.5 whitespace-pre-wrap">{n.desc}</p>
            
            {n.type === 'izin_tugas' && (
              <div className="pl-3.5 pt-2 flex items-center gap-2">
                <button
                  disabled={approvingId === n.id}
                  onClick={() => handleApprove(n.id, 'Setuju')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Setujui
                </button>
                <button
                  disabled={approvingId === n.id}
                  onClick={() => handleApprove(n.id, 'Tolak')}
                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Tolak
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
