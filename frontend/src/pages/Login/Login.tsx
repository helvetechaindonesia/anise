import { API_BASE_URL } from '../../utils/apiConfig';
import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SpinnerGap, Eye, EyeSlash } from '@phosphor-icons/react';

export default function Login() {
  const setIsAuthenticated = useAppStore(state => state.setIsAuthenticated);
  const setUserProfile = useAppStore(state => state.setUserProfile);
  const setToken = useAppStore(state => state.setToken);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username || !password) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(API_BASE_URL + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setToken(data.token);
        setUserProfile(data.data);
        setIsAuthenticated(true);
      } else {
        if (res.status === 429) {
          setErrorMsg(data.message || 'Terlalu banyak percobaan. Silakan coba lagi dalam 5 menit.');
        } else {
          setErrorMsg(data.message || 'Username atau password salah.');
        }
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex flex-col items-center justify-center p-4">
      {/* App Logo & Name */}
      <div className="flex justify-center items-center w-full gap-1.5 mb-8 animate-in slide-in-from-top-10 duration-700">
        <img 
          src="/assets/logo-smk.png" 
          alt="Logo SMK N 1 Sragi" 
          className="w-14 h-14 object-contain drop-shadow-sm"
        />
        <h1 className="text-3xl font-extrabold text-[#19414d] tracking-tight">
          SMK N 1 Sragi
        </h1>
      </div>

      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 border border-white/40 backdrop-blur-sm animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#121212]">Masuk ke Akun Anda</h2>
          <p className="text-sm text-[#6b6375] mt-1">Silakan masukkan username dan password portal sekolah</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl mb-6 text-center animate-in fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#19414d] mb-1.5 ml-1">Username</label>
            <input 
              type="text" 
              className="w-full bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl px-4 py-3 text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#19414d]/50 focus:border-[#19414d] transition-all"
              placeholder="Contoh: budis"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#19414d] mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-[#f8fafc] border border-[#e5e7eb] rounded-2xl px-4 py-3 pr-12 text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#19414d]/50 focus:border-[#19414d] transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#94a3b8] hover:text-[#19414d] transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlash className="w-5 h-5" weight="bold" />
                ) : (
                  <Eye className="w-5 h-5" weight="bold" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-gradient-to-r from-[#19414d] to-[#122e36] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#19414d]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <SpinnerGap className="w-5 h-5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk Aplikasi'
            )}
          </button>
        </form>
      </div>

      {/* Footer Text */}
      <div className="mt-8 text-center animate-in fade-in duration-1000 delay-300">
        <p className="text-[11px] font-medium text-[#94a3b8]">Anise by Helvetecha</p>
      </div>
    </div>
  );
}
