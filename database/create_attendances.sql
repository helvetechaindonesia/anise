CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_masuk TIMESTAMP,
    jam_pulang_awal TIMESTAMP,
    jam_masuk_kembali TIMESTAMP,
    jam_pulang_akhir TIMESTAMP,
    status VARCHAR(10) DEFAULT 'TAM',
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_tanggal UNIQUE (user_id, tanggal)
);
