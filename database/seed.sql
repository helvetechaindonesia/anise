-- Insert Academic Year
INSERT INTO academic_years (id, name, semester, is_active, start_date, end_date)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '2025/2026',
    'GANJIL',
    true,
    '2025-07-15',
    '2025-12-20'
) ON CONFLICT DO NOTHING;

-- Insert Major
INSERT INTO majors (id, code, name, description, is_active)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'MIPA',
    'Matematika dan Ilmu Pengetahuan Alam',
    'Jurusan MIPA',
    true
) ON CONFLICT DO NOTHING;

-- Insert User (Siswa)
INSERT INTO users (id, full_name, username, email, phone_number, password_hash, role_type, avatar_url, is_active)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Budi Setiawan',
    'budis',
    'budi@anise.com',
    '081234567890',
    '$2y$10$Cjbg8Ienc0iNx9RrhlPCkug8U0J668dLwrbKyuDHtkRWAkWh2iTp2',
    'SISWA',
    '/assets/budi_profile.jpg',
    true
) ON CONFLICT DO NOTHING;

-- Insert Siswa Profile
INSERT INTO siswa_profiles (user_id, nisn, nis, gender, birth_place, birth_date, academic_year_id, parent_name, parent_phone, behavior_points, status)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    '0051234567',
    '23241001',
    'L',
    'Jakarta',
    '2005-08-17',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Agus Setiawan',
    '08987654321',
    100,
    'AKTIF'
) ON CONFLICT DO NOTHING;

-- Insert Class
INSERT INTO classes (id, academic_year_id, name, grade_level, major_id, capacity)
VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'XII MIPA 1',
    12,
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    36
) ON CONFLICT DO NOTHING;

-- Map Student to Class
INSERT INTO class_students (class_id, student_id, status)
VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'AKTIF'
) ON CONFLICT DO NOTHING;

-- Insert Guru (Teacher)
INSERT INTO users (id, full_name, username, email, phone_number, password_hash, role_type, is_active)
VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    'Bpk. Ahmad Susanto',
    'ahmad_guru',
    'ahmad@anise.com',
    '081234567891',
    '$2y$10$Cjbg8Ienc0iNx9RrhlPCkug8U0J668dLwrbKyuDHtkRWAkWh2iTp2',
    'GURU',
    true
) ON CONFLICT DO NOTHING;

-- Insert Guru Profile
INSERT INTO guru_profiles (user_id, nip_nuptk, gender, employment_status)
VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    '198001012005011001',
    'L',
    'GURU_TETAP'
) ON CONFLICT DO NOTHING;

-- Insert Subject
INSERT INTO subjects (id, code, name, description)
VALUES (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    'MTK-PM',
    'Matematika Peminatan',
    'Mata pelajaran Matematika Peminatan Kelas XII'
) ON CONFLICT DO NOTHING;

-- Insert Schedule
INSERT INTO schedules (id, academic_year_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
VALUES (
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- year
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', -- class XII MIPA 1
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', -- subject
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', -- teacher
    'SENIN',
    '07:00:00',
    '08:30:00',
    'Lab MIPA 1'
) ON CONFLICT DO NOTHING;

-- Insert Teacher Attendance
INSERT INTO teacher_attendances (id, schedule_id, teacher_id, attendance_date, check_in_time, status)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    CURRENT_DATE,
    CURRENT_TIMESTAMP,
    'HADIR'
) ON CONFLICT DO NOTHING;

-- Insert Journal
INSERT INTO journals (id, schedule_id, teacher_id, class_id, subject_id, teacher_attendance_id, topic_material, special_notes, teacher_message, teaching_date, start_time, end_time)
VALUES (
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    'Trigonometri Lanjut & Analisis Gelombang',
    NULL,
    'Tolong pelajari lagi halaman 45 untuk persiapan kuis minggu depan.',
    CURRENT_DATE,
    '07:00:00',
    '08:30:00'
) ON CONFLICT DO NOTHING;

-- Insert Journal Task
INSERT INTO journal_tasks (id, journal_id, title, instructions, due_date)
VALUES (
    'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    'Latihan Soal Trigonometri',
    'Kerjakan soal latihan A-C pada buku paket halaman 45-47. Tulis tangan dan upload format PDF.',
    CURRENT_TIMESTAMP + INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- Insert Journal Review (from Budi)
INSERT INTO journal_reviews (id, journal_id, student_id, rating, comment)
VALUES (
    'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    5,
    'Materi sangat jelas pak, terima kasih!'
) ON CONFLICT DO NOTHING;

-- Insert Journal Comments
INSERT INTO journal_comments (id, journal_id, user_id, comment_text)
VALUES (
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Pak, untuk soal nomor 3 rumusnya pakai yang mana ya?'
) ON CONFLICT DO NOTHING;
