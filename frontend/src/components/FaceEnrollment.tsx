import { API_BASE_URL } from '../utils/apiConfig';
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { WarningCircle, CheckCircle, Scan } from '@phosphor-icons/react';
import { useAppStore } from '../store/useAppStore';

interface FaceEnrollmentProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FaceEnrollment({ onSuccess, onCancel }: FaceEnrollmentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [status, setStatus] = useState<string>('Memuat Model AI...');
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const userProfile = useAppStore((state) => state.userProfile);

  const isReadyRef = useRef(false);
  const isEnrollingRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detectionInterval: NodeJS.Timeout;

    const initialize = async () => {
      try {
        setStatus('Memuat Model Wajah...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);

        setStatus('Menyalakan Kamera...');
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error('Play error:', e));
          };
        }
        
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal mengakses Kamera.');
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
    setStatus('Arahkan wajah Anda ke kamera dengan jelas');

    const detectionInterval = setInterval(async () => {
      if (!videoRef.current || !isReadyRef.current || isEnrollingRef.current) return;

      try {
        const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        if (detection) {
          clearInterval(detectionInterval);
          setIsEnrolling(true);
          isEnrollingRef.current = true;
          setStatus('Wajah Terdeteksi! Menyimpan ke Database...');
          
          const descriptorArray = Array.from(detection.descriptor);
          const descriptorJson = JSON.stringify(descriptorArray);
          
          // 1. Simpan ke Backend Database (PostgreSQL via PHP)
          try {
            if (userProfile?.id) {
              const res = await fetch(API_BASE_URL + '/api/user/face', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user_id: userProfile.id,
                  face_descriptor: descriptorJson
                })
              });
              
              if (!res.ok) {
                console.error("Gagal simpan ke DB");
              }
            }
          } catch (e) {
            console.error("API error:", e);
          }

          // 2. Update state lokal
          updateUserProfile({ face_descriptor: descriptorJson });
          
          setTimeout(() => {
            setStatus('Pendaftaran Wajah Berhasil!');
            setTimeout(onSuccess, 1500);
          }, 1000);
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/90 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[360px] rounded-3xl p-5 text-center flex flex-col items-center overflow-hidden relative shadow-2xl">
        
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3">
          <Scan className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-[#19414d] mb-1">Daftarkan Wajah AI</h3>
        <p className="text-xs text-[#6b6375] mb-5">{errorMsg ? 'Terjadi Kesalahan' : status}</p>

        {errorMsg ? (
          <div className="text-rose-500 flex flex-col items-center">
            <WarningCircle className="w-12 h-12 mb-3" />
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button onClick={onCancel} className="mt-5 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">Tutup</button>
          </div>
        ) : (
          <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden bg-zinc-100 shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              onPlay={handleVideoPlay}
              className="absolute inset-0 w-full h-full object-cover mirror-mode scale-x-[-1]" 
            />
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full p-4 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                </div>
              </div>
            </div>
            
            {!isReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800/20 backdrop-blur-sm z-10" />
            )}
            
            {isEnrolling && (
              <div className="absolute inset-0 bg-indigo-500/20 animate-pulse flex items-center justify-center z-20">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <CheckCircle className="w-8 h-8 text-emerald-500" weight="fill" />
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={onCancel}
          className="mt-6 text-xs font-bold text-[#6b6375] hover:text-[#121212]"
        >
          {isEnrolling ? 'Selesai' : 'Batal'}
        </button>

      </div>
    </div>
  );
}
