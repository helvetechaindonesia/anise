import React, { useState } from 'react';
import type { User } from '../types/User';
import FaceEnrollment from './FaceEnrollment';
import { CheckCircle, WarningCircle, Camera } from '@phosphor-icons/react';

interface ProfileTabProps {
  userProfile: User | null;
  onFaceEnrollmentSuccess: () => void;
}

export default function ProfileTab({ userProfile, onFaceEnrollmentSuccess }: ProfileTabProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);

  if (!userProfile) return null;

  const hasFaceData = !!userProfile.face_descriptor;

  return (
    <div className="space-y-6 pt-5 animate-in fade-in duration-300">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-[#19414d]/10 flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-lg">
          {userProfile.avatar_url ? (
            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[#19414d]">{userProfile.full_name.charAt(0)}</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-[#121212]">{userProfile.full_name}</h2>
        <p className="text-sm text-[#6b6375] capitalize">{userProfile.role_type}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e4e7] space-y-4">
        <h3 className="font-bold text-[#121212] border-b border-[#e5e4e7] pb-2">Informasi Akun</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-[#6b6375]">Username</span>
            <span className="text-xs font-semibold text-[#121212]">{userProfile.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[#6b6375]">Email</span>
            <span className="text-xs font-semibold text-[#121212]">{userProfile.email}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e4e7] space-y-4">
        <h3 className="font-bold text-[#121212] border-b border-[#e5e4e7] pb-2">Keamanan & Presensi AI</h3>
        
        <div className="flex items-center justify-between p-3 bg-[#f4f3ec] rounded-xl border border-[#e5e4e7]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${hasFaceData ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {hasFaceData ? <CheckCircle className="w-6 h-6" weight="fill" /> : <WarningCircle className="w-6 h-6" weight="fill" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#121212]">Data Wajah AI</p>
              <p className="text-[10px] text-[#6b6375] font-medium">{hasFaceData ? 'Wajah telah terdaftar' : 'Belum didaftarkan'}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsEnrolling(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#19414d] text-white text-[10px] font-bold rounded-lg hover:bg-[#19414d]/90 transition-all shadow-md"
          >
            <Camera className="w-3.5 h-3.5" />
            {hasFaceData ? 'Perbarui' : 'Daftarkan'}
          </button>
        </div>
        <p className="text-[10px] text-[#6b6375] leading-relaxed">
          Wajah Anda digunakan sebagai otentikasi utama saat melakukan presensi harian untuk mencegah kecurangan. Data wajah disimpan dengan aman dalam format vektor matematis.
        </p>
      </div>

      {isEnrolling && (
        <FaceEnrollment 
          userId={Number(userProfile.id)}
          onSuccess={() => {
            setIsEnrolling(false);
            onFaceEnrollmentSuccess();
          }}
          onCancel={() => setIsEnrolling(false)}
        />
      )}
    </div>
  );
}
