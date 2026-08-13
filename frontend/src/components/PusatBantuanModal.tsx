import React, { useState } from 'react';
import { X, Question, CaretDown, CaretUp, Headset } from '@phosphor-icons/react';

interface PusatBantuanModalProps {
  onClose: () => void;
}

export default function PusatBantuanModal({ onClose }: PusatBantuanModalProps) {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Mengapa scan wajah saya selalu gagal?",
      answer: "Pastikan Anda berada di tempat dengan pencahayaan yang cukup. Lepaskan masker, kacamata hitam, atau topi yang menutupi wajah. Jika masih gagal, Anda dapat memperbarui data wajah di menu Profile > Daftarkan Wajah AI."
    },
    {
      id: 2,
      question: "Poin perilaku saya tidak sesuai, apa yang harus dilakukan?",
      answer: "Poin perilaku diberikan oleh Guru. Jika terdapat ketidaksesuaian, sistem kami hanya menampilkan data yang ada di server. Hubungi wali kelas atau guru terkait terlebih dahulu untuk memastikan riwayat input."
    },
    {
      id: 3,
      question: "Aplikasi terasa lambat atau nge-freeze",
      answer: "Pastikan Anda menggunakan versi Google Chrome atau Safari terbaru. Cobalah untuk membersihkan cache browser Anda atau merestart aplikasi."
    }
  ];

  const handleContactDev = () => {
    // Arahkan ke WhatsApp developer Helvetecha
    window.open("https://wa.me/6281234567890?text=Halo%20Tim%20Helvetecha,%20saya%20butuh%20bantuan%20terkait%20aplikasi%20Anise", "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-50 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="bg-indigo-600 p-5 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <Question className="w-6 h-6" weight="duotone" />
            <h3 className="font-bold text-lg">Pusat Bantuan</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-[#6b6375] leading-relaxed font-medium">
            Temukan jawaban untuk kendala teknis Anda di bawah ini. Jika belum terjawab, silakan hubungi tim Developer kami.
          </p>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={`bg-white rounded-xl border overflow-hidden transition-colors ${openFaqId === faq.id ? 'border-indigo-200 shadow-sm' : 'border-[#e5e4e7]'}`}
              >
                <button 
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  className="w-full p-4 flex justify-between items-center text-left"
                >
                  <span className={`text-sm font-bold pr-4 ${openFaqId === faq.id ? 'text-indigo-700' : 'text-[#121212]'}`}>
                    {faq.question}
                  </span>
                  <div className="shrink-0 text-[#6b6375]">
                    {openFaqId === faq.id ? <CaretUp className="w-4 h-4" /> : <CaretDown className="w-4 h-4" />}
                  </div>
                </button>
                {openFaqId === faq.id && (
                  <div className="p-4 pt-0 text-xs text-[#6b6375] leading-relaxed border-t border-[#e5e4e7]/50 bg-indigo-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Contact Button */}
        <div className="p-5 bg-white border-t border-[#e5e4e7] shrink-0">
          <button 
            onClick={handleContactDev}
            className="w-full py-3.5 bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-emerald-600 transition-colors"
          >
            <Headset className="w-5 h-5" weight="fill" />
            Chat IT Support (WhatsApp)
          </button>
          <p className="text-[9px] text-center text-[#6b6375] font-medium mt-3">
            Powered by Helvetecha Dev Team
          </p>
        </div>

      </div>
    </div>
  );
}
