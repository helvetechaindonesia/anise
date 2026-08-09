import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, MapPin, SpinnerGap, CheckCircle, WarningCircle } from '@phosphor-icons/react';

interface PresensiCameraProps {
  userFaceDescriptor?: string;
  onSuccess: (photoBase64: string, location: { lat: number, lng: number }) => void;
  onCancel: () => void;
}

export default function PresensiCamera({ userFaceDescriptor, onSuccess, onCancel }: PresensiCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [status, setStatus] = useState<string>('Memuat Model AI...');
  const [isReady, setIsReady] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const referenceDescriptor = useRef<Float32Array | null>(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detectionInterval: any;

    const initialize = async () => {
      try {
        // 1. Dapatkan Lokasi GPS (Non-blocking / Fallback)
        setStatus('Mencari Lokasi GPS...');
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
          });
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch (gpsErr) {
          console.warn('GPS Error:', gpsErr);
          // Fallback location if GPS denied or timeout
          setLocation(null);
        }

        // 2. Load Models
        setStatus('Memuat Model Wajah...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        // 3. Parse Reference Profile Descriptor (from DB)
        setStatus('Memproses Data Profil...');
        try {
          if (userFaceDescriptor) {
            const arr = JSON.parse(userFaceDescriptor);
            referenceDescriptor.current = new Float32Array(arr);
          } else {
            console.warn('Wajah belum terdaftar di database.');
            setErrorMsg('Wajah belum terdaftar. Silakan daftar wajah di menu Profil terlebih dahulu.');
            return;
          }
        } catch (imgErr) {
          console.warn('Gagal memproses data profil:', imgErr);
          setErrorMsg('Data wajah rusak. Silakan daftar ulang di Profil.');
          return;
        }

        // 4. Start Webcam
        setStatus('Menyalakan Kamera...');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // IMPORTANT: Safari requires explicit play() after stream is attached
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error('Play error:', e));
          };
        }
        
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal mengakses Kamera atau GPS.');
      }
    };

    initialize();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, []);

  const handleVideoPlay = () => {
    setIsReady(true);
    isReadyRef.current = true;
    setStatus('Arahkan wajah Anda ke kamera');

    const detectionInterval = setInterval(async () => {
      if (!videoRef.current || !isReadyRef.current) return;

      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 })).withFaceLandmarks().withFaceDescriptor();
      
      if (detection) {
        if (referenceDescriptor.current) {
          const distance = faceapi.euclideanDistance(detection.descriptor, referenceDescriptor.current);
          if (distance < 0.45) { // Stricter threshold
            clearInterval(detectionInterval);
            captureAndFinish();
          } else {
            setStatus('Wajah tidak cocok dengan profil.');
          }
        } else {
          setStatus('Sistem gagal membaca profil wajah.');
        }
      } else {
        setStatus('Arahkan wajah Anda ke kamera');
      }
    }, 500);
  };

  const captureAndFinish = () => {
    setStatus('Presensi Berhasil! Menyimpan data...');
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    ctx.font = '14px sans-serif';
    ctx.fillStyle = 'white';
    const timestamp = new Date().toLocaleString('id-ID');
    const locText = location ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'GPS: Offline';
    
    ctx.fillText(`Waktu: ${timestamp}`, 10, canvas.height - 35);
    ctx.fillText(locText, 10, canvas.height - 15);
    ctx.fillText(`Status: VERIFIED MATCH`, canvas.width - 180, canvas.height - 25);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    setTimeout(() => {
      onSuccess(dataUrl, location || {lat: 0, lng: 0});
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/90 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[360px] rounded-3xl p-5 text-center flex flex-col items-center overflow-hidden relative shadow-2xl">
        
        <h3 className="font-bold text-lg text-[#19414d] mb-1">Presensi Cam Riil</h3>
        <p className="text-xs text-[#6b6375] mb-5">{errorMsg ? 'Terjadi Kesalahan' : status}</p>

        {errorMsg ? (
          <div className="text-rose-500 flex flex-col items-center">
            <WarningCircle className="w-12 h-12 mb-3" />
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button onClick={onCancel} className="mt-5 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">Tutup</button>
          </div>
        ) : (
          <div className="relative w-64 h-64 mx-auto rounded-full border-4 border-dashed border-[#19414d]/30 overflow-hidden flex items-center justify-center bg-zinc-100 shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              onPlay={handleVideoPlay}
              className="absolute inset-0 w-full h-full object-cover mirror-mode scale-x-[-1]" 
            />
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/20 backdrop-blur-sm z-10">
              </div>
            )}
            
            <div className={`absolute inset-2 rounded-full border-2 ${status.includes('Berhasil') ? 'border-emerald-500' : 'border-teal-500/50 border-t-transparent border-b-transparent animate-spin duration-[3000ms]'} pointer-events-none transition-colors`} />
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {status.includes('Berhasil') && (
          <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full animate-in fade-in zoom-in">
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs font-bold">Wajah Terverifikasi</span>
          </div>
        )}

        <button 
          onClick={onCancel}
          className="mt-6 text-xs font-bold text-[#6b6375] hover:text-[#121212]"
        >
          Batalkan Presensi
        </button>

      </div>
    </div>
  );
}
