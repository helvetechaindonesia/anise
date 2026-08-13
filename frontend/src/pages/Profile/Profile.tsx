import React, { useState } from 'react';
import { ShieldCheck, Bookmarks, Question, CaretRight, Scan, PencilSimple, Check, X, SignOut } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { getDefaultAvatar } from '../../utils/avatar';
import FaceEnrollment from '../../components/FaceEnrollment';
import ChangePasswordModal from '../../components/ChangePasswordModal';

export default function Profile() {
  const { role, setRole, userProfile, updateUserProfile, logout } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: userProfile?.full_name || '',
    class_name: userProfile?.class_name || '',
    nisn: userProfile?.nisn || '',
    nis: userProfile?.nis || ''
  });

  const handleSaveProfile = () => {
    updateUserProfile(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      full_name: userProfile?.full_name || '',
      class_name: userProfile?.class_name || '',
      nisn: userProfile?.nisn || '',
      nis: userProfile?.nis || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pt-5 pb-10">
      <div className="text-center py-4 relative">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto overflow-hidden bg-[#19414d]/5">
          <img
            src={userProfile?.avatar_url || getDefaultAvatar(userProfile?.gender)}
            alt={userProfile?.full_name || "Profile"}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        
        {!isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm border border-[#e5e4e7] text-[#19414d] hover:bg-zinc-50"
            >
              <PencilSimple className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-[#121212] mt-3">{userProfile?.full_name || 'Belum ada nama'}</h3>
            <p className="text-xs text-[#6b6375]">Siswa {userProfile?.class_name || '-'} • NISN. {userProfile?.nisn || '-'}</p>
          </>
        ) : (
          <div className="mt-4 space-y-3 px-2 text-left">
            <div>
              <label className="text-[10px] font-bold text-[#6b6375] uppercase ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={editForm.full_name}
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                className="w-full mt-1 p-2.5 text-sm bg-white border border-[#e5e4e7] rounded-xl focus:border-[#19414d] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#6b6375] uppercase ml-1">Kelas</label>
                <input 
                  type="text" 
                  value={editForm.class_name}
                  onChange={(e) => setEditForm({...editForm, class_name: e.target.value})}
                  className="w-full mt-1 p-2.5 text-sm bg-white border border-[#e5e4e7] rounded-xl focus:border-[#19414d] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#6b6375] uppercase ml-1">NISN</label>
                <input 
                  type="text" 
                  value={editForm.nisn}
                  onChange={(e) => setEditForm({...editForm, nisn: e.target.value})}
                  className="w-full mt-1 p-2.5 text-sm bg-white border border-[#e5e4e7] rounded-xl focus:border-[#19414d] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleCancelEdit}
                className="flex-1 py-2.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> Batal
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 bg-[#19414d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md"
              >
                <Check className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-[#e5e4e7] text-center">
          <span className="text-[9px] uppercase tracking-wider text-[#6b6375] block">Kehadiran Bulanan</span>
          <span className="text-base font-extrabold text-[#19414d] mt-1 block">97.8%</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-[#e5e4e7] text-center">
          <span className="text-[9px] uppercase tracking-wider text-[#6b6375] block">Poin Perilaku</span>
          <span className="text-base font-extrabold text-[#19414d] mt-1 block">{userProfile?.behavior_points || 0}</span>
        </div>
      </div>

      {/* Face Enrollment Action Button */}
      <div 
        onClick={() => setShowEnrollment(true)}
        className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-all ${userProfile?.face_descriptor ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'}`}
      >
        <div className={`p-2 rounded-full ${userProfile?.face_descriptor ? 'bg-emerald-200' : 'bg-indigo-200'}`}>
          <Scan className="w-6 h-6" weight="duotone" />
        </div>
        <div className="text-left">
          <h4 className="font-bold text-sm leading-tight">{userProfile?.face_descriptor ? 'Wajah Terdaftar (Update)' : 'Daftarkan Wajah AI'}</h4>
          <p className={`text-[10px] ${userProfile?.face_descriptor ? 'text-emerald-600' : 'text-indigo-600/80'} font-medium mt-0.5`}>
            {userProfile?.face_descriptor ? 'Tap untuk mendaftar ulang wajah Anda' : 'Scan wajah untuk keperluan Presensi Camera'}
          </p>
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-xl border border-[#e5e4e7] overflow-hidden divide-y divide-[#e5e4e7]">
        <div 
          onClick={() => setShowPasswordModal(true)}
          className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 font-bold text-[#121212]">
            <ShieldCheck className="w-5 h-5 text-[#19414d]" weight="duotone" />
            Keamanan Akun
          </div>
          <CaretRight className="w-4 h-4 text-[#6b6375]" />
        </div>
        <div className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-bold text-[#121212]">
            <Bookmarks className="w-5 h-5 text-[#19414d]" weight="duotone" />
            Kurikulum & Silabus
          </div>
          <CaretRight className="w-4 h-4 text-[#6b6375]" />
        </div>
        <div className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5 font-bold text-[#121212]">
            <Question className="w-5 h-5 text-[#19414d]" weight="duotone" />
            Pusat Bantuan
          </div>
          <CaretRight className="w-4 h-4 text-[#6b6375]" />
        </div>
      </div>

      {/* Demo Mode / Switch Role */}
      <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl border border-amber-200">
        <div>
          <span className="text-[10px] text-amber-800 font-bold block">Demo Integrasi Stack</span>
          <span className="text-[9px] text-amber-700">Simulasikan switch role untuk test UI</span>
        </div>
        <button
          onClick={() => {
            setRole(role === 'siswa' ? 'guru' : 'siswa');
          }}
          className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
        >
          Pindah ke {role === 'siswa' ? 'Guru' : 'Siswa'}
        </button>
      </div>

      {/* Logout Action Button */}
      <button 
        onClick={() => logout()}
        className="w-full py-4 mt-2 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl border border-rose-200 flex items-center justify-center gap-2 hover:bg-rose-100 transition-all shadow-sm"
      >
        <SignOut className="w-5 h-5" weight="bold" />
        Sign Out / Keluar
      </button>

      {showEnrollment && (
        <FaceEnrollment 
          onSuccess={() => setShowEnrollment(false)}
          onCancel={() => setShowEnrollment(false)}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
