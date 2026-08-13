# 🚀 Panduan Mengaktifkan Server & Project Anise

Karena project kita menggunakan Docker (untuk Backend) dan Vercel (untuk Frontend), berikut adalah urutan langkah yang wajib dilakukan setiap kali komputermu baru dinyalakan.

## 1. Nyalakan Docker (Backend & Database)
Pastikan Docker Desktop sudah menyala di background. Lalu jalankan _containers_-nya:
- **Backend API**: Berjalan di `http://localhost:8000`
- **PGWeb (Database Viewer)**: Berjalan di `http://localhost:5050`

## 2. Buka Akses Publik API dengan Ngrok
Karena aplikasi di HP (atau Vercel) butuh internet publik untuk nembak API lokalmu, nyalakan Ngrok.
1. Buka Terminal / CMD baru.
2. Ketik perintah berikut:
   ```bash
   ngrok http 8000
   ```
3. Biarkan terminal ini terbuka! _Copy_ URL publik yang dihasilkan (misal: `https://morbidity-propeller-delivery.ngrok-free.dev`).

> [!WARNING]
> Karena menggunakan Ngrok versi gratis, URL ini **akan berubah** setiap kali kamu merestart Ngrok!

## 3. Update Vercel Frontend (Jika URL Ngrok Berubah)
Kalau URL Ngrok berubah, aplikasi Vercel tidak akan bisa terhubung ke server karena masih menggunakan URL lama. Kamu harus _deploy_ ulang dengan URL yang baru:
1. Buka Terminal baru, masuk ke folder `frontend`.
2. Jalankan perintah _deploy_ dengan _environment variable_ baru:
   ```bash
   cd frontend
   vercel --prod --yes --build-env VITE_API_URL=https://LINK_NGROK_YANG_BARU.ngrok-free.dev
   ```
3. Tunggu proses _build_ selesai (sekitar 15-30 detik).

## 4. (Opsional) Jalankan Frontend Secara Lokal
Jika kamu sedang _coding_ atau menguji tampilan Frontend tanpa ingin menunggu Vercel:
1. Buka Terminal di folder `frontend`.
2. Jalankan Vite (bisa menggunakan HTTPS jika pakai plugin _mkcert_):
   ```bash
   npm run dev -- --host
   ```
3. Buka `https://localhost:5173` di browser. Karena berjalan secara lokal, aplikasi Vite akan otomatis menembak port `8000` (atau menggunakan proksi) sehingga kamu tidak wajib update Ngrok jika hanya membuka via localhost.