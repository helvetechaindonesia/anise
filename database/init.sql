-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE role_type AS ENUM ('SISWA', 'GURU', 'STAF_ADMIN');
CREATE TYPE gender_type AS ENUM ('L', 'P');
CREATE TYPE student_status AS ENUM ('AKTIF', 'LULUS', 'MUTASI', 'DROP_OUT');
CREATE TYPE employment_status_type AS ENUM ('GURU_TETAP', 'GURU_HONORER', 'KONTRAK');
CREATE TYPE structural_role_type AS ENUM ('TIM_KESISWAAN', 'GURU_BK', 'PEMBINA_EKSKUL');
CREATE TYPE semester_type AS ENUM ('GANJIL', 'GENAP');
CREATE TYPE class_student_status AS ENUM ('AKTIF', 'PINDAH_KELAS');
CREATE TYPE day_of_week_type AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU');
CREATE TYPE teacher_attendance_status AS ENUM ('HADIR', 'TERLAMBAT', 'IZIN', 'ALPA');
CREATE TYPE submission_status AS ENUM ('DIKIRIM', 'TERLAMBAT', 'REVISI');

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_type role_type NOT NULL,
    avatar_url TEXT,
    face_descriptor TEXT,
    is_active BOOLEAN DEFAULT true,
    token_version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACADEMIC YEARS
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL, -- e.g., "2025/2026"
    semester semester_type NOT NULL,
    is_active BOOLEAN DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- 4. MAJORS
CREATE TABLE majors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. GURU PROFILES
CREATE TABLE guru_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nip_nuptk VARCHAR(50) UNIQUE,
    gender gender_type NOT NULL,
    employment_status employment_status_type NOT NULL
);

-- 6. SISWA PROFILES
CREATE TABLE siswa_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nis VARCHAR(20) UNIQUE NOT NULL,
    gender gender_type NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    behavior_points INT DEFAULT 100,
    status student_status DEFAULT 'AKTIF'
);

-- 7. STRUCTURAL ASSIGNMENTS
CREATE TABLE structural_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    role_title structural_role_type NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE
);

-- 8. CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    grade_level SMALLINT NOT NULL,
    major_id UUID REFERENCES majors(id) ON DELETE SET NULL,
    homeroom_teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    capacity INT DEFAULT 36,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. CLASS STUDENTS (Junction Table)
CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES siswa_profiles(user_id) ON DELETE CASCADE,
    status class_student_status DEFAULT 'AKTIF',
    joined_at DATE DEFAULT CURRENT_DATE,
    CONSTRAINT unique_class_student UNIQUE (class_id, student_id)
);

-- 10. PRESENSI LOGS
CREATE TABLE presensi_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    status VARCHAR(20) DEFAULT 'MATCHED',
    device_info TEXT,
    snapshot_url TEXT
);

-- 11. SUBJECTS
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. SCHEDULES
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    day_of_week day_of_week_type NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. TEACHER ATTENDANCES
CREATE TABLE teacher_attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    status teacher_attendance_status NOT NULL,
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. JOURNALS
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_attendance_id UUID REFERENCES teacher_attendances(id) ON DELETE SET NULL,
    topic_material TEXT NOT NULL,
    special_notes TEXT,
    teacher_message TEXT,
    teaching_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. JOURNAL TASKS
CREATE TABLE journal_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID UNIQUE REFERENCES journals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    instructions TEXT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    max_score INT DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. JOURNAL REVIEWS
CREATE TABLE journal_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    student_id UUID REFERENCES siswa_profiles(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. JOURNAL COMMENTS
CREATE TABLE journal_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES journal_comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 18. JOURNAL TASK ATTACHMENTS
CREATE TABLE journal_task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_task_id UUID REFERENCES journal_tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. STUDENT TASK SUBMISSIONS
CREATE TABLE student_task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_task_id UUID REFERENCES journal_tasks(id) ON DELETE CASCADE,
    student_id UUID REFERENCES siswa_profiles(user_id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    submitted_at TIMESTAMP NOT NULL,
    status submission_status NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_submission UNIQUE (journal_task_id, student_id)
);

-- 20. STUDENT TASK GRADES
CREATE TABLE student_task_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE REFERENCES student_task_submissions(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    feedback TEXT,
    graded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 21. POINT RULES (Master Regulasi Poin)
CREATE TYPE point_type AS ENUM ('PELANGGARAN', 'PRESTASI');
CREATE TYPE point_category AS ENUM ('KEDISIPLINAN', 'KERAPIAN', 'AKADEMIK', 'NON_AKADEMIK', 'PEMBIASAAN');

CREATE TABLE point_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    type point_type NOT NULL,
    points INT NOT NULL,
    category point_category NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. STUDENT POINT LOGS (Pencatatan Transaksi Poin Siswa)
CREATE TYPE point_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE student_point_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    student_id UUID REFERENCES siswa_profiles(user_id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    point_rule_id UUID REFERENCES point_rules(id) ON DELETE SET NULL,
    type point_type NOT NULL,
    points_change INT NOT NULL,
    description TEXT NOT NULL,
    proof_url TEXT,
    incident_date DATE NOT NULL,
    status point_status DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. KPI INDICATORS (Master Indikator Penilaian KPI Guru)
CREATE TABLE kpi_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    weight_percentage DECIMAL(5,2) NOT NULL,
    target_score DECIMAL(5,2) NOT NULL,
    is_auto_calculated BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. TEACHER KPI PERIOD SUMMARIES (Rekapitulasi Nilai KPI Guru Per Bulan)
CREATE TYPE kpi_grade_category AS ENUM ('SANGAT_BAIK', 'BAIK', 'CUKUP', 'KURANG');

CREATE TABLE teacher_kpi_period_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    period_month SMALLINT NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    period_year INT NOT NULL,
    total_attendance_score DECIMAL(5,2) DEFAULT 0,
    total_journal_score DECIMAL(5,2) DEFAULT 0,
    total_review_score DECIMAL(5,2) DEFAULT 0,
    final_kpi_score DECIMAL(5,2) DEFAULT 0,
    grade_category kpi_grade_category,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_teacher_period UNIQUE (teacher_id, academic_year_id, period_month, period_year)
);
-- 25. HABITS (Master Daftar Pembiasaan)
CREATE TYPE habit_category AS ENUM ('IBADAH', 'LITERASI', 'KEBERSIHAN', 'KEDISIPLINAN');
CREATE TYPE habit_location AS ENUM ('LINGKUNGAN_SEKOLAH', 'BEBAS');

CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category habit_category NOT NULL,
    target_location habit_location DEFAULT 'LINGKUNGAN_SEKOLAH',
    time_strict BOOLEAN DEFAULT true,
    valid_start_time TIME,
    valid_end_time TIME,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 26. STUDENT HABIT LOGS (Log Isian Pembiasaan Harian Siswa)
CREATE TYPE habit_log_status AS ENUM ('COMPLETED', 'MISSED', 'VERIFIED');

CREATE TABLE student_habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    student_id UUID REFERENCES siswa_profiles(user_id) ON DELETE CASCADE,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL,
    logged_time TIME NOT NULL,
    status habit_log_status DEFAULT 'COMPLETED',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    device_ip VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_habit_date UNIQUE (student_id, habit_id, logged_date)
);

-- 27. HABIT VERIFICATIONS (Tabel Pemantauan & Audit Guru)
CREATE TYPE habit_verification_status AS ENUM ('VALID', 'INVALID');

CREATE TABLE habit_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_log_id UUID REFERENCES student_habit_logs(id) ON DELETE CASCADE,
    verifier_teacher_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    verification_status habit_verification_status DEFAULT 'VALID',
    rejection_reason TEXT,
    verified_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. GURU WALI STUDENTS (Mapping for 1 teacher to ~20 students)
CREATE TABLE IF NOT EXISTS guru_wali_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    student_id UUID REFERENCES siswa_profiles(user_id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_guru_wali_student UNIQUE (guru_id, student_id, academic_year_id)
);

-- 29. GURU BK CLASSES (Mapping for 1 BK teacher to ~5 classes)
CREATE TABLE IF NOT EXISTS guru_bk_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES guru_profiles(user_id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_guru_bk_class UNIQUE (guru_id, class_id, academic_year_id)
);
