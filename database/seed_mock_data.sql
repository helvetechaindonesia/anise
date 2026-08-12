DO $$ 
DECLARE 
    ay_id UUID;
    cls1_id UUID;
    cls2_id UUID;
    sub_id UUID;
    guru_id UUID;
    siswa_id UUID;
    sched_id UUID;
BEGIN
    -- 1. Create Academic Year
    IF NOT EXISTS (SELECT 1 FROM academic_years WHERE name = '2026/2027' AND semester = 'GANJIL') THEN
        INSERT INTO academic_years (name, start_date, end_date, semester, is_active)
        VALUES ('2026/2027', '2026-07-01', '2026-12-31', 'GANJIL', true);
    END IF;
    SELECT id INTO ay_id FROM academic_years WHERE name = '2026/2027' AND semester = 'GANJIL' LIMIT 1;

    -- 2. Create Classes
    INSERT INTO classes (name, grade_level, academic_year_id) 
    SELECT 'XII RPL 1', 12, ay_id
    WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'XII RPL 1');
    
    INSERT INTO classes (name, grade_level, academic_year_id) 
    SELECT 'XII RPL 2', 12, ay_id
    WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'XII RPL 2');
    
    SELECT id INTO cls1_id FROM classes WHERE name = 'XII RPL 1' LIMIT 1;
    SELECT id INTO cls2_id FROM classes WHERE name = 'XII RPL 2' LIMIT 1;

    -- 3. Create Subject
    INSERT INTO subjects (code, name, is_active) 
    SELECT 'PROG-01', 'Pemrograman Dasar', true
    WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = 'PROG-01');
    SELECT id INTO sub_id FROM subjects WHERE code = 'PROG-01' LIMIT 1;

    -- 4. Get Teacher and Student IDs
    SELECT id INTO guru_id FROM users WHERE full_name = 'Ahmad Guru' LIMIT 1;
    SELECT id INTO siswa_id FROM users WHERE full_name = 'Budi Brok' LIMIT 1;

    -- 5. Create Schedules (Teacher teaches both classes)
    IF guru_id IS NOT NULL AND sub_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM schedules WHERE teacher_id = guru_id AND class_id = cls1_id AND subject_id = sub_id) THEN
            INSERT INTO schedules (academic_year_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
            VALUES (ay_id, cls1_id, sub_id, guru_id, 'SENIN', '07:00:00', '09:00:00', 'R-101');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM schedules WHERE teacher_id = guru_id AND class_id = cls2_id AND subject_id = sub_id) THEN
            INSERT INTO schedules (academic_year_id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
            VALUES (ay_id, cls2_id, sub_id, guru_id, 'SELASA', '07:00:00', '09:00:00', 'R-102');
        END IF;
    END IF;

    -- 6. Assign Student to Class XII RPL 1
    IF siswa_id IS NOT NULL AND cls1_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM class_students WHERE student_id = siswa_id AND class_id = cls1_id) THEN
            INSERT INTO class_students (class_id, student_id, status)
            VALUES (cls1_id, siswa_id, 'AKTIF');
        END IF;
    END IF;

END $$;
