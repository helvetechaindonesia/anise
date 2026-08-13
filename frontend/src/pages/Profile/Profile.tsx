import React, { useState } from 'react';
import { ShieldCheck, Bookmarks, Question, CaretRight, Scan, PencilSimple, Check, X, SignOut } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { getDefaultAvatar } from '../../utils/avatar';
import FaceEnrollment from '../../components/FaceEnrollment';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import PusatBantuanModal from '../../components/PusatBantuanModal';

export default function Profile() {
  const { role, setRole, userProfile, updateUserProfile, logout } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
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
      <div className="py-4">
        {!isEditing ? (
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#e5e4e7] shadow-sm">
            <div className="w-20 h-20 shrink-0 rounded-full border-4 border-indigo-50 shadow-md overflow-hidden bg-[#19414d]/5">
              <img
                src={userProfile?.avatar_url || getDefaultAvatar(userProfile?.gender)}
                alt={userProfile?.full_name || "Profile"}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#121212] leading-tight truncate">{userProfile?.full_name || 'Belum ada nama'}</h3>
              
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-[#6b6375] font-medium">Kelas {userProfile?.class_name || '-'}</span>
                <span className="text-[10px] text-[#d1d5db]">•</span>
                <span className="text-[11px] text-[#6b6375] font-medium">NIS. {userProfile?.nis || '-'}</span>
              </div>
              
              <div className="mt-0.5 mb-2.5">
                <span className="text-[10px] text-[#9ca3af] font-semibold tracking-wide">NISN. {userProfile?.nisn || '-'}</span>
              </div>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 bg-[#19414d] text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-[#122e36] transition-colors shadow-sm inline-flex"
              >
                <PencilSimple className="w-3.5 h-3.5" weight="bold" />
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 px-2 text-left bg-white p-4 rounded-2xl border border-[#e5e4e7] shadow-sm">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#e5e4e7]/50">
              <div className="w-14 h-14 shrink-0 rounded-full border-2 border-indigo-50 overflow-hidden bg-[#19414d]/5">
                <img
                  src={userProfile?.avatar_url || getDefaultAvatar(userProfile?.gender)}
                  alt={userProfile?.full_name || "Profile"}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#121212]">Edit Data Profil</h4>
                <p className="text-[10px] text-[#6b6375]">Pastikan data sesuai dengan aslinya</p>
              </div>
            </div>
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
        <div 
          onClick={() => setShowHelpModal(true)}
          className="p-3.5 flex justify-between items-center text-xs hover:bg-[#19414d]/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 font-bold text-[#121212]">
            <Question className="w-5 h-5 text-[#19414d]" weight="duotone" />
            Pusat Bantuan
          </div>
          <CaretRight className="w-4 h-4 text-[#6b6375]" />
        </div>
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

      {showHelpModal && (
        <PusatBantuanModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}
