import { API_BASE_URL } from './utils/apiConfig';
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PresensiCamera from './components/PresensiCamera';
import { ChatCircleText, Sparkle, SpinnerGap } from '@phosphor-icons/react';
import { useAppStore } from './store/useAppStore';
import { useDataStore } from './store/useDataStore';

import Home from './pages/Home/Home';
import Jurnal from './pages/Jurnal/Jurnal';
import JurnalGuru from './pages/JurnalGuru/JurnalGuru';
import DaftarTugas from './pages/DaftarTugas/DaftarTugas';
import DaftarTugasGuru from './pages/DaftarTugasGuru/DaftarTugasGuru';
import Pembiasaan from './pages/Pembiasaan/Pembiasaan';
import Poin from './pages/Poin/Poin';
import Notifikasi from './pages/Notifikasi/Notifikasi';
import RiwayatPresensi from './pages/RiwayatPresensi/RiwayatPresensi';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import AgendaPenilaian from './pages/AgendaPenilaian/AgendaPenilaian';

export default function App() {
  const { 
    token, setToken, isAuthenticated, setIsAuthenticated, isInitializing, setIsInitializing,
    activeTab, setActiveTab, showPresensiModal, setShowPresensiModal, showAiChat, setShowAiChat, startPresensi, setUserProfile 
  } = useAppStore();
  const { chatMessages, addChatMessage } = useDataStore();

  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
      return;
    }

    fetch(API_BASE_URL + '/api/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(json => {
        if (json.status === 'success' && json.data) {
          setUserProfile(json.data);
          setIsAuthenticated(true);
        } else {
          setToken(null);
          setIsAuthenticated(false);
        }
      })
      .catch(err => {
        console.error("Gagal verifikasi token:", err);
        setToken(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, [token]);

  // Dummy AI Chat logic and local input state
  const [newChatInput, setNewChatInput] = useState('');

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerGap className="w-10 h-10 text-[#19414d] animate-spin" />
          <p className="text-[#19414d] font-bold text-sm">Memuat Aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const finishFaceTracking = async (photoBase64: string, location: { lat: number, lng: number }) => {
    try {
      const res = await fetch(API_BASE_URL + '/api/presensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: useAppStore.getState().userProfile?.id,
          lat: location.lat,
          lng: location.lng,
          snapshot: photoBase64
        })
      });
      
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        useAppStore.getState().setPresensiStep('success');
        setTimeout(() => {
          setShowPresensiModal(false);
          useAppStore.getState().setHasPresensiToday(true);
          useDataStore.getState().addNotification({
            id: Date.now(),
            title: `Presensi Sukses (${data.data.status_absen})`,
            time: 'Baru saja',
            desc: data.message,
            type: 'info'
          });
        }, 2000);
      } else {
        alert(data.message || 'Gagal melakukan presensi');
        setShowPresensiModal(false);
      }
    } catch (err) {
      alert('Gagal terhubung ke server');
      setShowPresensiModal(false);
    }
  };

  const handleSendChatMessage = () => {
    if (!newChatInput.trim()) return;
    const userMsg = newChatInput;
    addChatMessage({ sender: 'user', text: userMsg });
    setNewChatInput('');

    setTimeout(() => {
      let botResponse = 'Maaf, saya tidak mengerti pertanyaan tersebut. Coba tanyakan mengenai "tenggat tugas" atau "poin prestasi".';
      const msgLower = userMsg.toLowerCase();
      if (msgLower.includes('tugas') || msgLower.includes('pr')) {
        botResponse = 'Anda memiliki 2 tugas yang ditugaskan. Tugas terdekat adalah "Trigonometri Lanjut & Analisis Gelombang" di kelas Matematika Peminatan yang dikumpulkan Besok pukul 12:00 WIB.';
      } else if (msgLower.includes('poin') || msgLower.includes('prestasi') || msgLower.includes('pelanggaran')) {
        botResponse = `Saat ini Anda berada di peringkat 5 terbaik se-kelas!`;
      } else if (msgLower.includes('absen') || msgLower.includes('presensi') || msgLower.includes('hadir')) {
        botResponse = useAppStore.getState().hasPresensiToday
          ? 'Anda sudah melakukan presensi masuk hari ini pada pukul 07:12 WIB dengan status HADIR.'
          : 'Anda belum melakukan presensi hari ini. Silakan klik tombol "Presensi" di layanan cepat untuk melakukan scan wajah & GPS.';
      } else if (msgLower.includes('halo') || msgLower.includes('hai')) {
        botResponse = 'Halo Budi! Ada yang bisa saya bantu untuk kegiatan belajarmu hari ini?';
      }
      addChatMessage({ sender: 'bot', text: botResponse });
    }, 1000);
  };

  // Render the active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'jurnal': return useAppStore.getState().userProfile?.role_type?.toLowerCase() === 'guru' ? <JurnalGuru /> : <Jurnal />;
      case 'daftar_tugas': return useAppStore.getState().userProfile?.role_type?.toLowerCase() === 'guru' ? <DaftarTugasGuru /> : <DaftarTugas />;
      case 'pembiasaan': return <Pembiasaan />;
      case 'poin': return <Poin />;
      case 'notifikasi': return <Notifikasi />;
      case 'presensi': return <RiwayatPresensi />;
      case 'profile': return <Profile />;
      case 'agenda_penilaian': return <AgendaPenilaian />;
      default: return <Home />;
    }
  };

  return (
    <div className="flex justify-center h-[100dvh] bg-[#fcfbf7] w-full overflow-hidden">
      {/* INNER SCREEN CONTAINER (FLEX COL, NO SCROLL) */}
      <div className="relative flex flex-col w-full max-w-md h-full bg-[#fcfbf7] z-0 sm:border-x sm:border-[#e5e4e7] sm:shadow-2xl mx-auto">

        {/* TOP BAR / HEADER (TRANSPARAN SEAMLESS) */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* PAGE BODY SWITCHER (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto px-5 pt-0 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
          {renderActiveTab()}
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} startPresensi={startPresensi} />

        {/* MODAL PRESENSI GEOLOKASI + FACE TRACKING (REAL CAM) */}
        {showPresensiModal && (
          <PresensiCamera
            userFaceDescriptor={useAppStore.getState().userProfile?.face_descriptor}
            onSuccess={finishFaceTracking}
            onCancel={() => setShowPresensiModal(false)}
          />
        )}

        {/* MODAL AI CHAT ASSISTANT - Fixed floating inside the mobile container layout */}
        {showAiChat && (
          <div className="absolute inset-0 z-50 bg-[#121212]/60 flex items-end justify-center px-4 pb-4 max-w-[430px] mx-auto rounded-[36px] sm:rounded-[44px] overflow-hidden">
            <div className="bg-white w-full rounded-2xl p-4.5 space-y-4 max-h-[75vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200 mb-20">
              {/* Header Modal */}
              <div className="flex justify-between items-center pb-2 border-b border-[#e5e4e7]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#19414d]/10 flex items-center justify-center text-[#19414d]">
                    <Sparkle className="w-4.5 h-4.5" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#19414d] leading-none">Anise AI Assistant</h3>
                    <span className="text-[9px] text-[#6b6375] font-medium block mt-0.5">Online • Asisten Pendidikan</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiChat(false)}
                  className="text-xs font-bold text-[#6b6375] hover:text-[#121212] cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-[250px] max-h-[350px]">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === 'user'
                        ? 'bg-[#19414d] text-white rounded-tr-none'
                        : 'bg-[#f4f3ec] text-[#121212] rounded-tl-none border border-[#e5e4e7]'
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="flex gap-2 pt-2 border-t border-[#e5e4e7]">
                <input
                  type="text"
                  placeholder="Tanyakan tugas, presensi, atau poin..."
                  value={newChatInput}
                  onChange={(e) => setNewChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1 text-xs p-2.5 rounded-lg border border-[#e5e4e7] focus:outline-none focus:border-[#19414d] bg-[#fcfbf7]"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="px-4 py-2.5 bg-[#19414d] text-white font-bold text-xs rounded-lg hover:bg-[#19414d]/90 transition-all flex items-center justify-center cursor-pointer"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
