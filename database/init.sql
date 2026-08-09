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
