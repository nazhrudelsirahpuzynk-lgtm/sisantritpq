/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Santri, Nilai, DatabaseState } from './src/types';

// Load environment variables
const PORT = 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const app = express();
app.use(express.json());

// Path persistent JSON Database
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database file exists
function initializeDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Generate realistic seed data for TPQ Santri
    const initialSantri: Santri[] = [
      { id: 'S1', nama: 'Ahmad Fauzan', jilid: 'Jilid 1', namaWali: 'Hendra Prasetya', tanggalLahir: '2019-03-12', tanggalMasuk: '2026-01-05', status: 'aktif' },
      { id: 'S2', nama: 'Siti Fatimah', jilid: 'Jilid 2', namaWali: 'Muhammad Slamet', tanggalLahir: '2018-07-22', tanggalMasuk: '2025-08-10', status: 'aktif' },
      { id: 'S3', nama: 'Muhammad Yusuf', jilid: 'Jilid 3', namaWali: 'Abdullah Basir', tanggalLahir: '2017-11-05', tanggalMasuk: '2025-01-15', status: 'aktif' },
      { id: 'S4', nama: 'Zahra Humaira', jilid: 'Jilid 4', namaWali: 'Ahmad Rahmat', tanggalLahir: '2016-05-18', tanggalMasuk: '2024-08-20', status: 'aktif' },
      { id: 'S5', nama: 'Salman Al-Farisi', jilid: 'Jilid 5', namaWali: 'Ali Syihab', tanggalLahir: '2015-09-30', tanggalMasuk: '2024-01-10', status: 'aktif' },
      { id: 'S6', nama: 'Aisha Medina', jilid: "Al-Qur'an 1", namaWali: 'Umar Khadafi', tanggalLahir: '2014-02-14', tanggalMasuk: '2023-08-15', status: 'aktif' },
      { id: 'S7', nama: 'Farhan Bashir', jilid: "Al-Qur'an 2", namaWali: 'Syarifuddin', tanggalLahir: '2013-10-25', tanggalMasuk: '2023-01-12', status: 'lulus' }
    ];

    const initialNilai: Nilai[] = [
      // S1 - Ahmad Fauzan (Jilid 1)
      { id: 'N1_1', santriId: 'S1', tanggal: '2026-02-10', jilid: 'Jilid 1', materi: 'Halaman 1-5 (Pengenalan Harokat)', aspekKelancaran: 75, aspekTajwid: 70, aspekAdab: 85, catatan: 'Fauzan sangat antusias, perlu dilatih vokal A, Ba, Ta agar lebih tebal.', guru: 'Ustadzah Rahma' },
      { id: 'N1_2', santriId: 'S1', tanggal: '2026-03-24', jilid: 'Jilid 1', materi: 'Halaman 6-12 (Tanwin)', aspekKelancaran: 80, aspekTajwid: 75, aspekAdab: 90, catatan: 'Sudah lancar membaca tanwin, perhatikan perbedaan Fathatain dan Kasrotain.', guru: 'Ustadzah Rahma' },
      { id: 'N1_3', santriId: 'S1', tanggal: '2026-05-12', jilid: 'Jilid 1', materi: 'Evaluasi Akhir Jilid 1', aspekKelancaran: 88, aspekTajwid: 82, aspekAdab: 95, catatan: 'Alhamdulillah jilid 1 selesai dengan baik, siap naik ke jilid 2.', guru: 'Ustadzah Rahma' },

      // S2 - Siti Fatimah (Jilid 2)
      { id: 'N2_1', santriId: 'S2', tanggal: '2026-01-15', jilid: 'Jilid 2', materi: 'Halaman 1-10 (Mad Asli)', aspekKelancaran: 70, aspekTajwid: 75, aspekAdab: 80, catatan: 'Panjang pendek 2 harokat perlu dipanjangkan sedikit lagi.', guru: 'Ustadz Hilman' },
      { id: 'N2_2', santriId: 'S2', tanggal: '2026-03-10', jilid: 'Jilid 2', materi: 'Halaman 11-20 (Alif Lam Qomariyah)', aspekKelancaran: 82, aspekTajwid: 80, aspekAdab: 85, catatan: 'Perkembangan bagus, tajwid Alif Lam Qomariyah terbaca jelas.', guru: 'Ustadz Hilman' },
      { id: 'N2_3', santriId: 'S2', tanggal: '2026-05-20', jilid: 'Jilid 2', materi: 'Evaluasi Akhir Jilid 2', aspekKelancaran: 85, aspekTajwid: 84, aspekAdab: 88, catatan: 'Sudah mandiri dan lancar, berhak naik jilid berikutnya.', guru: 'Ustadz Hilman' },

      // S3 - Muhammad Yusuf (Jilid 3)
      { id: 'N3_1', santriId: 'S3', tanggal: '2025-06-15', jilid: 'Jilid 3', materi: 'Halaman 1-5 (Hukum Nun Mati)', aspekKelancaran: 80, aspekTajwid: 72, aspekAdab: 85, catatan: 'Suara dengung pada Idghom Bighunnah perlu ditahan 2 ketukan.', guru: 'Ustadz Ahmad' },
      { id: 'N3_2', santriId: 'S3', tanggal: '2025-10-20', jilid: 'Jilid 3', materi: 'Halaman 10-15 (Ikhfa Hakiki)', aspekKelancaran: 83, aspekTajwid: 78, aspekAdab: 90, catatan: 'Bacaan ikhfa samar-samar sudah mulai terdengar benar.', guru: 'Ustadz Ahmad' },
      { id: 'N3_3', santriId: 'S3', tanggal: '2026-04-05', jilid: 'Jilid 3', materi: 'Evaluasi Akhir Jilid 3', aspekKelancaran: 90, aspekTajwid: 85, aspekAdab: 92, catatan: 'Selamat, bacaan sangat merdu dan sesuai kaidah tajwid.', guru: 'Ustadz Ahmad' },

      // S4 - Zahra Humaira (Jilid 4)
      { id: 'N4_1', santriId: 'S4', tanggal: '2025-09-12', jilid: 'Jilid 4', materi: 'Ghorib (Sajdah, Saktah)', aspekKelancaran: 78, aspekTajwid: 80, aspekAdab: 88, catatan: 'Pahami tanda Saktah untuk berhenti tanpa mengambil nafas.', guru: 'Ustadzah Hasanah' },
      { id: 'N4_2', santriId: 'S4', tanggal: '2025-12-18', jilid: 'Jilid 4', materi: 'Waqof dan Ibtida', aspekKelancaran: 84, aspekTajwid: 85, aspekAdab: 90, catatan: 'Sudah tahu cara berhenti dan memulai kembali kalimat Al-Qur\'an.', guru: 'Ustadzah Hasanah' },
      { id: 'N4_3', santriId: 'S4', tanggal: '2026-03-20', jilid: 'Jilid 4', materi: 'Evaluasi Kelayakan Al-Qur\'an', aspekKelancaran: 89, aspekTajwid: 88, aspekAdab: 95, catatan: 'Nilai tajwid berangsur mantap, siap bersiap masuk jilid 5.', guru: 'Ustadzah Hasanah' },

      // S5 - Salman Al-Farisi (Jilid 5)
      { id: 'N5_1', santriId: 'S5', tanggal: '2024-05-10', jilid: 'Jilid 5', materi: 'Makhraj Huruf tenggorokan', aspekKelancaran: 85, aspekTajwid: 80, aspekAdab: 90, catatan: 'Fokus pada pengucapan Ain dan Ha (kecil) agar tidak tertukar.', guru: 'Ustadz Hilman' },
      { id: 'N5_2', santriId: 'S5', tanggal: '2025-01-15', jilid: 'Jilid 5', materi: 'Hukum Mad Layyin', aspekKelancaran: 88, aspekTajwid: 85, aspekAdab: 92, catatan: 'Pengucapan mad layyin saat waqof sudah lembut.', guru: 'Ustadz Hilman' },
      { id: 'N5_3', santriId: 'S5', tanggal: '2026-05-02', jilid: 'Jilid 5', materi: 'Persiapan Masuk Al-Qur\'an 1', aspekKelancaran: 92, aspekTajwid: 90, aspekAdab: 95, catatan: 'Menguasai seluruh teori jilid 5, siap membaca Al-Qur\'an secara langsung.', guru: 'Ustadz Hilman' },

      // S6 - Aisha Medina (Al-Qur'an 1)
      { id: 'N6_1', santriId: 'S6', tanggal: '2024-11-20', jilid: "Al-Qur'an 1", materi: 'Juz 1 (Al-Baqarah 1-50)', aspekKelancaran: 82, aspekTajwid: 84, aspekAdab: 95, catatan: 'Sangat disiplin dan bersuara merdu. Jaga konsistensi panjang mad.', guru: 'Ustadzah Hasanah' },
      { id: 'N6_2', santriId: 'S6', tanggal: '2025-05-18', jilid: "Al-Qur'an 1", materi: 'Juz 15 (Al-Isra 1-30)', aspekKelancaran: 88, aspekTajwid: 90, aspekAdab: 97, catatan: 'Makhroj huruf sudah matang, pemahaman waqof sangat baik.', guru: 'Ustadzah Hasanah' },
      { id: 'N6_3', santriId: 'S6', tanggal: '2026-04-10', jilid: "Al-Qur'an 1", materi: 'Juz 30 (Al-Naba s.d Al-Insyirah)', aspekKelancaran: 94, aspekTajwid: 95, aspekAdab: 98, catatan: 'Hafalan juz 30 mutqin, direkomendasikan lanjut Al-Qur\'an jilid 2.', guru: 'Ustadzah Hasanah' },

      // S7 - Farhan Bashir (Al-Qur'an 2)
      { id: 'N7_1', santriId: 'S7', tanggal: '2023-08-10', jilid: "Al-Qur'an 2", materi: 'Hukum Tajwid Mad Lazim', aspekKelancaran: 85, aspekTajwid: 80, aspekAdab: 88, catatan: 'Kekuatan nafas saat membaca mad lazim harfi musyabba diperpanjang.', guru: 'Ustadz Ahmad' },
      { id: 'N7_2', santriId: 'S7', tanggal: '2024-06-12', jilid: "Al-Qur'an 2", materi: 'Juz 28 & Juz 29 Hafalan', aspekKelancaran: 90, aspekTajwid: 88, aspekAdab: 92, catatan: 'Kelancaran menghafal sangat baik, bersiap untuk ujian kelulusan TPQ.', guru: 'Ustadz Ahmad' },
      { id: 'N7_3', santriId: 'S7', tanggal: '2025-05-02', jilid: "Al-Qur'an 2", materi: 'Munaqosyah Akhir TPQ', aspekKelancaran: 96, aspekTajwid: 95, aspekAdab: 96, catatan: 'Telah lulus Munaqosyah dengan predikat Istimewa (A). Selamat!', guru: 'Ustadz Ahmad' }
    ];

    const dbState: DatabaseState = { santri: initialSantri, nilai: initialNilai };
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf8');
  }
}

initializeDatabase();

// Reading helper
function readDB(): DatabaseState {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data) as DatabaseState;
  } catch (err) {
    console.error('Batal membaca database, return default', err);
    return { santri: [], nilai: [] };
  }
}

// Writing helper
function writeDB(data: DatabaseState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Gagal menulis database', err);
  }
}

// Middleware input authentication
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Akses ditolak: Password diperlukan.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_PASSWORD) {
    res.status(403).json({ error: 'Akses ditolak: Password Admin salah.' });
    return;
  }
  next();
}

// =================== API ENDPOINTS ===================

// Proxy endpoint to load and serve the TPQ Logo with proper CORS, iframe and domain handling
app.get('/api/logo.png', async (req, res, next) => {
  try {
    const targetUrl = 'https://cdn-images.prod.gametee.top/13781296-2baf-4ec0-be5b-c53367d1ab3c/input_file_0.png';
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch from remote');
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    // If anything fails, fallback gracefully to a beautifully-crafted green Quran-style SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#10b981" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <path d="M50 32 C38 32 30 45 30 62 C38 58 45 59 50 61 C55 59 62 58 70 62 C70 45 62 32 50 32 Z" fill="#ffffff" />
      <path d="M50 35 L50 61" stroke="#10b981" stroke-width="1.8" />
      <circle cx="50" cy="24" r="2.5" fill="#f59e0b" />
    </svg>`);
  }
});

// Public Login API
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Sertakan password.' });
    return;
  }

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(400).json({ error: 'Password Admin tidak valid.' });
  }
});

// Guest (Wali Santri): Public Search by Name & Wali Name
app.get('/api/public/lookup', (req, res) => {
  const { nama, namaWali } = req.query;
  if (!nama || typeof nama !== 'string') {
    res.status(400).json({ error: 'Silakan isi kueri nama santri.' });
    return;
  }

  const db = readDB();
  const searchName = nama.toLowerCase().trim();
  const searchWali = namaWali ? (namaWali as string).toLowerCase().trim() : '';

  // Filter students matching requirements
  const matchedSantri = db.santri.filter(s => {
    const sNama = s.nama.toLowerCase();
    const sWali = s.namaWali.toLowerCase();
    
    // Minimum match is name contains lookup string
    const matchName = sNama.includes(searchName);
    const matchWali = searchWali ? sWali.includes(searchWali) : true;
    
    return matchName && matchWali;
  });

  if (matchedSantri.length === 0) {
    res.status(404).json({ error: 'Data santri tidak ditemukan.' });
    return;
  }

  // Build payload including progress scores for matched students safely
  const results = matchedSantri.map(s => {
    const scores = db.nilai.filter(n => n.santriId === s.id)
                          .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    return {
      santri: s,
      nilai: scores
    };
  });

  res.json({ results });
});

// Single Public Evaluation Retrieval (Safe Lookup)
app.get('/api/public/santri/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const santri = db.santri.find(s => s.id === id);

  if (!santri) {
    res.status(404).json({ error: 'Santri tidak ditemukan.' });
    return;
  }

  const nilai = db.nilai.filter(n => n.santriId === id)
                        .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  res.json({ santri, nilai });
});

// =================== ADMIN BACKEND API (GUARDED) ===================

// GET students list
app.get('/api/santri', requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.santri);
});

// POST adds a student
app.post('/api/santri', requireAdmin, (req, res) => {
  const { nama, jilid, namaWali, tanggalLahir, tanggalMasuk, status } = req.body;
  
  if (!nama || !jilid || !namaWali) {
    res.status(400).json({ error: 'Nama, Jilid, dan Wali wajib diisi.' });
    return;
  }

  const db = readDB();
  const listClasses = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', "Al-Qur'an 1", "Al-Qur'an 2"];
  if (!listClasses.includes(jilid)) {
    res.status(400).json({ error: 'Kelas jilid tidak valid.' });
    return;
  }

  const newSantri: Santri = {
    id: 'S' + Date.now(),
    nama: nama.trim(),
    jilid,
    namaWali: namaWali.trim(),
    tanggalLahir: tanggalLahir || '',
    tanggalMasuk: tanggalMasuk || new Date().toISOString().split('T')[0],
    status: status || 'aktif'
  };

  db.santri.push(newSantri);
  writeDB(db);

  res.status(201).json(newSantri);
});

// POST adds multiple students (bulk upload via Excel)
app.post('/api/santri/bulk', requireAdmin, (req, res) => {
  const { students } = req.body;
  
  if (!students || !Array.isArray(students)) {
    res.status(400).json({ error: 'Data students harus berupa array.' });
    return;
  }

  const db = readDB();
  const listClasses = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', "Al-Qur'an 1", "Al-Qur'an 2"];
  const added: any[] = [];
  const errors: string[] = [];

  students.forEach((s: any, idx: number) => {
    const { nama, jilid, namaWali, tanggalLahir, tanggalMasuk, status } = s;
    if (!nama || !namaWali) {
      errors.push(`Baris ${idx + 1}: Nama Santri dan Nama Wali wajib diisi.`);
      return;
    }
    
    // Default jilid if empty or normalize name
    let normalizedJilid = (jilid || 'Jilid 1').toString().trim();
    // Simple normalization of Jilid
    if (normalizedJilid === '1' || normalizedJilid === 'Jilid1') normalizedJilid = 'Jilid 1';
    else if (normalizedJilid === '2' || normalizedJilid === 'Jilid2') normalizedJilid = 'Jilid 2';
    else if (normalizedJilid === '3' || normalizedJilid === 'Jilid3') normalizedJilid = 'Jilid 3';
    else if (normalizedJilid === '4' || normalizedJilid === 'Jilid4') normalizedJilid = 'Jilid 4';
    else if (normalizedJilid === '5' || normalizedJilid === 'Jilid5') normalizedJilid = 'Jilid 5';
    else if (normalizedJilid.toLowerCase() === 'alquran 1' || normalizedJilid.toLowerCase() === "al-qur'an1") normalizedJilid = "Al-Qur'an 1";
    else if (normalizedJilid.toLowerCase() === 'alquran 2' || normalizedJilid.toLowerCase() === "al-qur'an2") normalizedJilid = "Al-Qur'an 2";

    if (!listClasses.includes(normalizedJilid)) {
      errors.push(`Baris ${idx + 1}: Kelas jilid "${jilid}" tidak valid. Harap gunakan format seperti Jilid 1 atau Al-Qur'an 1.`);
      return;
    }

    const newStudent = {
      id: 'S' + (Date.now() + idx + Math.floor(Math.random() * 100)),
      nama: nama.toString().trim(),
      jilid: normalizedJilid,
      namaWali: namaWali.toString().trim(),
      tanggalLahir: tanggalLahir || '',
      tanggalMasuk: tanggalMasuk || new Date().toISOString().split('T')[0],
      status: status || 'aktif'
    };
    db.santri.push(newStudent);
    added.push(newStudent);
  });

  if (errors.length > 0 && added.length === 0) {
    res.status(400).json({ error: errors.join('\n') });
    return;
  }

  writeDB(db);
  res.status(201).json({ success: true, count: added.length, results: added, errors });
});

// PUT updates a student
app.put('/api/santri/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { nama, jilid, namaWali, tanggalLahir, tanggalMasuk, status } = req.body;

  const db = readDB();
  const santriIndex = db.santri.findIndex(s => s.id === id);

  if (santriIndex === -1) {
    res.status(404).json({ error: 'Santri tidak ditemukan.' });
    return;
  }

  db.santri[santriIndex] = {
    ...db.santri[santriIndex],
    nama: nama ? nama.trim() : db.santri[santriIndex].nama,
    jilid: jilid || db.santri[santriIndex].jilid,
    namaWali: namaWali ? namaWali.trim() : db.santri[santriIndex].namaWali,
    tanggalLahir: tanggalLahir !== undefined ? tanggalLahir : db.santri[santriIndex].tanggalLahir,
    tanggalMasuk: tanggalMasuk !== undefined ? tanggalMasuk : db.santri[santriIndex].tanggalMasuk,
    status: status || db.santri[santriIndex].status
  };

  writeDB(db);
  res.json(db.santri[santriIndex]);
});

// DELETE a student & related grades
app.delete('/api/santri/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const originalCount = db.santri.length;
  db.santri = db.santri.filter(s => s.id !== id);
  
  if (db.santri.length === originalCount) {
    res.status(404).json({ error: 'Santri tidak ditemukan.' });
    return;
  }

  // Cascade delete standard evaluation grades
  db.nilai = db.nilai.filter(n => n.santriId !== id);
  writeDB(db);

  res.json({ success: true, message: 'Data santri dan rekam nilai telah dihapus.' });
});

// GET all grades
app.get('/api/nilai', requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.nilai);
});

// POST adds a grade
app.post('/api/nilai', requireAdmin, (req, res) => {
  const { santriId, tanggal, jilid, materi, aspekKelancaran, aspekTajwid, aspekAdab, catatan, guru } = req.body;

  if (!santriId || !tanggal || !jilid || !materi || aspekKelancaran === undefined || aspekTajwid === undefined || aspekAdab === undefined) {
    res.status(400).json({ error: 'Seluruh komponen nilai evaluasi mandatory wajib diisi.' });
    return;
  }

  const db = readDB();
  const santriExists = db.santri.find(s => s.id === santriId);
  if (!santriExists) {
    res.status(404).json({ error: 'Santri rujukan tidak ditemukan.' });
    return;
  }

  const newNilai: Nilai = {
    id: 'N' + Date.now(),
    santriId,
    tanggal,
    jilid,
    materi: materi.trim(),
    aspekKelancaran: Number(aspekKelancaran),
    aspekTajwid: Number(aspekTajwid),
    aspekAdab: Number(aspekAdab),
    catatan: catatan ? catatan.trim() : '',
    guru: guru ? guru.trim() : 'Ustadz/Ustadzah'
  };

  db.nilai.push(newNilai);
  writeDB(db);

  res.status(201).json(newNilai);
});

// PUT updates a grade
app.put('/api/nilai/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { tanggal, jilid, materi, aspekKelancaran, aspekTajwid, aspekAdab, catatan, guru } = req.body;

  const db = readDB();
  const nilaiIndex = db.nilai.findIndex(n => n.id === id);

  if (nilaiIndex === -1) {
    res.status(404).json({ error: 'Catatan nilai tidak ditemukan.' });
    return;
  }

  db.nilai[nilaiIndex] = {
    ...db.nilai[nilaiIndex],
    tanggal: tanggal || db.nilai[nilaiIndex].tanggal,
    jilid: jilid || db.nilai[nilaiIndex].jilid,
    materi: materi !== undefined ? materi.trim() : db.nilai[nilaiIndex].materi,
    aspekKelancaran: aspekKelancaran !== undefined ? Number(aspekKelancaran) : db.nilai[nilaiIndex].aspekKelancaran,
    aspekTajwid: aspekTajwid !== undefined ? Number(aspekTajwid) : db.nilai[nilaiIndex].aspekTajwid,
    aspekAdab: aspekAdab !== undefined ? Number(aspekAdab) : db.nilai[nilaiIndex].aspekAdab,
    catatan: catatan !== undefined ? catatan.trim() : db.nilai[nilaiIndex].catatan,
    guru: guru !== undefined ? guru.trim() : db.nilai[nilaiIndex].guru
  };

  writeDB(db);
  res.json(db.nilai[nilaiIndex]);
});

// DELETE a grade
app.delete('/api/nilai/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const originalCount = db.nilai.length;
  db.nilai = db.nilai.filter(n => n.id !== id);

  if (db.nilai.length === originalCount) {
    res.status(404).json({ error: 'Catatan nilai tidak ditemukan.' });
    return;
  }

  writeDB(db);
  res.json({ success: true, message: 'Catatan nilai evaluasi berhasil dihapus.' });
});

// =================== VITE SYSTEM & STATIC HANDLERS ===================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TPQ Evaluation Portal listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
