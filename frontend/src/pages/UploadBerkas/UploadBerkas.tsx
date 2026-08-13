import React, { useState } from 'react';
import { UploadSimple, FilePdf, FileDoc, CheckCircle, WarningCircle, CaretLeft } from '@phosphor-icons/react';
import { useAppStore } from '../../store/useAppStore';
import { API_BASE_URL } from '../../utils/apiConfig';

type DocumentType = 'cp' | 'tp' | 'atp' | 'ma';

interface DocumentInfo {
  id: DocumentType;
  title: string;
  description: string;
  status: 'empty' | 'uploaded' | 'error';
  filename?: string;
}

export default function UploadBerkas() {
  const { setActiveTab } = useAppStore();
  
  const [documents, setDocuments] = useState<DocumentInfo[]>([
    { id: 'cp', title: 'Capaian Pembelajaran (CP)', description: 'Kompetensi pembelajaran yang harus dicapai peserta didik pada setiap fase.', status: 'empty' },
    { id: 'tp', title: 'Tujuan Pembelajaran (TP)', description: 'Deskripsi pencapaian kompetensi dalam satu atau lebih kegiatan pembelajaran.', status: 'empty' },
    { id: 'atp', title: 'Alur Tujuan Pembelajaran (ATP)', description: 'Rangkaian TP yang tersusun secara sistematis dan logis.', status: 'empty' },
    { id: 'ma', title: 'Modul Ajar (MA)', description: 'Dokumen perencanaan pembelajaran terpadu (RPP Plus).', status: 'empty' }
  ]);
  
  const [activeUploadId, setActiveUploadId] = useState<DocumentType | null>(null);
  const { token } = useAppStore();

  const dummySubjectId = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
  const dummyAcademicYearId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guru/administrasi?academic_year_id=${dummyAcademicYearId}&subject_id=${dummySubjectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setDocuments(docs => docs.map(doc => {
            const found = data.data.find((d: any) => d.document_type.toLowerCase() === doc.id.toLowerCase());
            if (found) {
              return { ...doc, status: 'uploaded', filename: found.file_name };
            }
            return doc;
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchDocs();
  }, [token]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: DocumentType) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveUploadId(id);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', id.toUpperCase());
      formData.append('subject_id', dummySubjectId);
      formData.append('academic_year_id', dummyAcademicYearId);

      try {
        const res = await fetch(`${API_BASE_URL}/api/guru/administrasi/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (data.status === 'success') {
          setDocuments(docs => docs.map(doc => {
            if (doc.id === id) {
              return { ...doc, status: 'uploaded', filename: file.name };
            }
            return doc;
          }));
        } else {
          alert('Upload gagal: ' + data.message);
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan saat mengunggah file.');
      } finally {
        setActiveUploadId(null);
      }
    }
  };

  return (
    <div className="space-y-6 pt-5 pb-24 animate-in fade-in duration-200">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-2">
        <button 
          onClick={() => setActiveTab('home')}
          className="w-8 h-8 rounded-full bg-white border border-[#e5e4e7] flex items-center justify-center text-[#19414d] hover:bg-[#f8fafc] transition-colors"
        >
          <CaretLeft className="w-5 h-5" weight="bold" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#19414d] leading-tight">Upload Berkas</h2>
          <p className="text-[11px] text-[#6b6375] mt-0.5">Lengkapi administrasi mengajar Anda (CP, TP, ATP, MA)</p>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-[#e5e4e7] p-4 shadow-sm relative overflow-hidden group hover:border-[#19414d]/30 transition-colors">
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#121212] mb-1">{doc.title}</h3>
                <p className="text-[10px] text-[#6b6375] leading-relaxed mb-3 pr-2">{doc.description}</p>
                
                {doc.status === 'empty' && (
                  <div className="flex items-center">
                    <label className="relative overflow-hidden cursor-pointer">
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, doc.id)}
                        disabled={activeUploadId !== null}
                      />
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUploadId === doc.id ? 'bg-[#19414d]/10 text-[#19414d]' : 'bg-[#19414d] text-white hover:bg-[#122e36]'}`}>
                        {activeUploadId === doc.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#19414d] border-t-transparent rounded-full animate-spin"></div>
                            Mengunggah...
                          </>
                        ) : (
                          <>
                            <UploadSimple className="w-4 h-4" weight="bold" />
                            Pilih File
                          </>
                        )}
                      </div>
                    </label>
                    <span className="text-[9px] text-[#9ca3af] ml-3 font-medium">Format: PDF/DOCX (Max. 5MB)</span>
                  </div>
                )}

                {doc.status === 'uploaded' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        {doc.filename?.endsWith('.pdf') ? <FilePdf className="w-5 h-5" weight="fill" /> : <FileDoc className="w-5 h-5" weight="fill" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-emerald-700 truncate">{doc.filename}</p>
                        <p className="text-[9px] font-medium text-emerald-600/80 mt-0.5">Berhasil diunggah</p>
                      </div>
                    </div>
                    
                    <button 
                      className="text-[10px] font-bold text-rose-500 bg-white px-2.5 py-1.5 rounded-lg border border-rose-100 shadow-sm hover:bg-rose-50 transition-colors ml-2 shrink-0"
                      onClick={() => {
                        if(confirm('Hapus berkas ini?')) {
                          setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, status: 'empty', filename: undefined } : d));
                        }
                      }}
                    >
                      Ganti
                    </button>
                  </div>
                )}
              </div>

              {/* Status Indicator Icon */}
              <div className="shrink-0 flex items-center justify-center pt-1">
                {doc.status === 'uploaded' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500" weight="fill" />
                ) : (
                  <WarningCircle className="w-6 h-6 text-[#d1d5db]" weight="duotone" />
                )}
              </div>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}
