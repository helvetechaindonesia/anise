import React, { useState } from 'react';
import { X, LockKey, Spinner } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';
import { API_BASE_URL } from '../utils/apiConfig';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const token = useAppStore((state) => state.token);
  const logout = useAppStore((state) => state.logout);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Semua kolom wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Sandi baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi sandi baru tidak cocok');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL + '/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setSuccessMsg('Sandi berhasil diubah! Mengeluarkan akun dalam 3 detik...');
        setTimeout(() => {
          onClose();
          logout();
        }, 3000);
      } else {
        setErrorMsg(data.message || 'Gagal mengubah sandi');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="bg-[#19414d] p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <LockKey className="w-6 h-6" weight="duotone" />
            <h3 className="font-bold text-lg">Ubah Sandi</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-100">
              {successMsg}
            </div>
          )}
          
          <div>
            <label className="text-[11px] font-bold text-[#6b6375] uppercase ml-1">Sandi Lama</label>
            <input 
              type="password" 
              placeholder="Masukkan sandi lama"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mt-1 p-3 text-sm bg-zinc-50 border border-[#e5e4e7] rounded-xl focus:border-[#19414d] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="text-[11px] font-bold text-[#6b6375] uppercase ml-1">Sandi Baru</label>
            <input 
              type="password" 
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 p-3 text-sm bg-zinc-50 border border-[#e5e4e7] rounded-xl focus:border-[#19414d] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="text-[11px] font-bold text-[#6b6375] uppercase ml-1">Konfirmasi Sandi Baru</label>
            <input 
              type="password" 
              placeholder="Ketik ulang sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 p-3 text-sm bg-zinc-50 border border-[#e5e4e7] rounded-xl focus:border-[#19414d] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading || !!successMsg}
              className="w-full py-3.5 bg-[#19414d] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-[#122e36] transition-colors disabled:opacity-70"
            >
              {isLoading ? (
                <Spinner className="w-5 h-5 animate-spin" />
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
