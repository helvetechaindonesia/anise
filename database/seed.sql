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
    'hashedpassword',
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
