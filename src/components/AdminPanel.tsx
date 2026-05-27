/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Heart, 
  ClipboardList, 
  LogOut, 
  Lock,
  UserCheck,
  Award,
  Calendar,
  Save,
  X,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';
import { Santri, Nilai } from '../types';

interface AdminPanelProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export default function AdminPanel({ onNotify }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'santri' | 'nilai'>('status');
  const [loading, setLoading] = useState(false);

  // Core Lists
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);

  // Santri Form State
  const [isSantriModalOpen, setIsSantriModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [santriForm, setSantriForm] = useState({
    nama: '',
    jilid: 'Jilid 1',
    namaWali: '',
    tanggalLahir: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    status: 'aktif' as 'aktif' | 'lulus' | 'pindah'
  });

  // Nilai Form State
  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState(false);
  const [editingNilai, setEditingNilai] = useState<Nilai | null>(null);
  const [nilaiForm, setNilaiForm] = useState({
    santriId: '',
    tanggal: new Date().toISOString().split('T')[0],
    jilid: 'Jilid 1',
    materi: '',
    aspekKelancaran: 80,
    aspekTajwid: 80,
    aspekAdab: 85,
    catatan: '',
    guru: ''
  });

  // State for secure custom confirmation dialog (iframe-safe)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'santri' | 'nilai';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'santri',
    id: '',
    title: '',
    message: ''
  });

  // Excel Bulk Upload States
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);

  // Hydrate Token on start
  useEffect(() => {
    const savedToken = localStorage.getItem('tpq_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch admin data once logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchAdminData();
    }
  }, [isLoggedIn, token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Load Students
      const santriRes = await fetch('/api/santri', { headers });
      if (!santriRes.ok) throw new Error('Gagal mengambil data santri.');
      const santriData = await santriRes.json();
      setSantriList(santriData);

      // Load Scores
      const nilaiRes = await fetch('/api/nilai', { headers });
      if (!nilaiRes.ok) throw new Error('Gagal mengambil data evaluasi nilai.');
      const nilaiData = await nilaiRes.json();
      setNilaiList(nilaiData);

    } catch (err: any) {
      onNotify(err.message || 'Gagal memuat data dari server.', 'error');
      // If unauthorized, clear log
      if (err.message?.includes('Akses ditolak')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      onNotify('Silakan masukkan password admin.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Password Admin salah atau tidak sesuai.');
      }

      const data = await response.json();
      localStorage.setItem('tpq_admin_token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      onNotify('Autentikasi Ustadz berhasil! Selamat datang.', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Login gagal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tpq_admin_token');
    setToken('');
    setIsLoggedIn(false);
    setSantriList([]);
    setNilaiList([]);
    onNotify('Berhasil keluar dari sesi administrasi.', 'success');
  };

  // ==================== SANTRI OPERATION HANDLERS ====================

  const openAddSantri = () => {
    setEditingSantri(null);
    setSantriForm({
      nama: '',
      jilid: 'Jilid 1',
      namaWali: '',
      tanggalLahir: '',
      tanggalMasuk: new Date().toISOString().split('T')[0],
      status: 'aktif'
    });
    setIsSantriModalOpen(true);
  };

  const openEditSantri = (s: Santri) => {
    setEditingSantri(s);
    setSantriForm({
      nama: s.nama,
      jilid: s.jilid,
      namaWali: s.namaWali,
      tanggalLahir: s.tanggalLahir,
      tanggalMasuk: s.tanggalMasuk,
      status: s.status
    });
    setIsSantriModalOpen(true);
  };

  const handleSantriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!santriForm.nama.trim() || !santriForm.namaWali.trim()) {
      onNotify('Nama santri dan nama wali wajib dilengkapi.', 'error');
      return;
    }

    setLoading(true);
    try {
      const isEdit = !!editingSantri;
      const url = isEdit ? `/api/santri/${editingSantri.id}` : '/api/santri';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(santriForm)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menyimpan data santri.');
      }

      onNotify(
        isEdit ? 'Profil santri berhasil terupdate.' : 'Berhasil mendaftarkan santri baru!',
        'success'
      );
      setIsSantriModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      onNotify(err.message || 'Gagal menyimpan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Columns list
    const headers = [
      ["Nama Lengkap Santri", "Nama Wali", "Kelas Jilid", "Tanggal Lahir (YYYY-MM-DD)", "Tanggal Masuk (YYYY-MM-DD)", "Status"]
    ];
    const sampleData = [
      ["Ahmad Zaki", "Hamdan", "Jilid 1", "2015-08-12", "2026-05-10", "aktif"],
      ["Siti Aminah", "Rasyid", "Al-Qur'an 1", "2014-03-24", "2026-05-15", "aktif"],
      ["Muhammad Fatih", "Nasrudin Ahmad", "Jilid 3", "2016-11-02", "2026-05-20", "aktif"]
    ];
    
    // Create sheet
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Santri Baru");
    
    // Download file
    XLSX.writeFile(wb, "Template_Pendaftaran_Santri_Al_Asyhar.xlsx");
    onNotify('Template Excel berhasil diunduh! Silakan isi data di file tersebut.', 'success');
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const rawRows: any[] = XLSX.utils.sheet_to_json(ws);
        
        if (rawRows.length === 0) {
          onNotify("File Excel kosong atau tidak terbaca.", "error");
          return;
        }

        const listClasses = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', "Al-Qur'an 1", "Al-Qur'an 2"];
        const students: any[] = [];
        const errors: string[] = [];

        rawRows.forEach((row: any, index) => {
          const nama = row["Nama Lengkap Santri"] || row["Nama Lengkap"] || row["Nama"] || row["nama"];
          const namaWali = row["Nama Wali"] || row["Nama Orang Tua/Wali"] || row["Wali"] || row["wali"] || row["Nama Orang Tua"];
          const jilid = row["Kelas Jilid"] || row["Jilid"] || row["jilid"] || "Jilid 1";
          const tglLahir = row["Tanggal Lahir (YYYY-MM-DD)"] || row["Tanggal Lahir"] || row["tanggalLahir"] || "";
          const tglMasuk = row["Tanggal Masuk (YYYY-MM-DD)"] || row["Tanggal Masuk"] || row["tanggalMasuk"] || new Date().toISOString().split('T')[0];
          const status = row["Status"] || row["status"] || "aktif";

          if (!nama) {
            errors.push(`Baris ${index + 2}: Kolom nama masih kosong.`);
            return;
          }
          if (!namaWali) {
            errors.push(`Baris ${index + 2} (${nama}): Kolom nama wali masih kosong.`);
            return;
          }

          students.push({
            nama: nama.toString().trim(),
            namaWali: namaWali.toString().trim(),
            jilid: jilid.toString().trim(),
            tanggalLahir: tglLahir.toString().trim(),
            tanggalMasuk: tglMasuk.toString().trim(),
            status: status.toString().trim().toLowerCase()
          });
        });

        setParsedStudents(students);
        setExcelErrors(errors);
        
        if (students.length > 0) {
          onNotify(`Berhasil membaca ${students.length} data calon santri!`, 'success');
        } else if (errors.length > 0) {
          onNotify('Terdapat kesalahan penginputan data di dalam file Excel Anda.', 'error');
        }
      } catch (err: any) {
        onNotify("Gagal memproses file Excel. Pastikan format file sesuai.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const submitBulkSantri = async () => {
    if (parsedStudents.length === 0) {
      onNotify('Belum ada data santri yang terbaca dari Excel.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/santri/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ students: parsedStudents })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan bulk santri.');
      }

      const resData = await response.json();
      onNotify(`Alhamdulillah, berhasil mengimpor ${resData.count} data santri secara kolektif!`, 'success');
      
      setIsExcelModalOpen(false);
      setParsedStudents([]);
      setExcelErrors([]);
      fetchAdminData();
    } catch (err: any) {
      onNotify(err.message || 'Gagal mengimpor data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerDeleteSantri = (id: string, nama: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'santri',
      id,
      title: 'Hapus Data Santri',
      message: `Apakah Anda yakin ingin menghapus data Santri "${nama}" beserta semua rekam nilainya secara permanen? Data yang telah dihapus tidak dapat dipulihkan.`
    });
  };

  const executeDeleteSantri = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/santri/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal menghapus data santri.');

      onNotify(`Data santri beserta rekam nilainya berhasil terhapus.`, 'success');
      fetchAdminData();
    } catch (err: any) {
      onNotify(err.message || 'Gagal menghapus.', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
    }
  };

  // ==================== NILAI OPERATION HANDLERS ====================

  const openAddNilai = () => {
    setEditingNilai(null);
    setNilaiForm({
      santriId: santriList.filter(s => s.status === 'aktif')[0]?.id || '',
      tanggal: new Date().toISOString().split('T')[0],
      jilid: 'Jilid 1',
      materi: '',
      aspekKelancaran: 80,
      aspekTajwid: 80,
      aspekAdab: 85,
      catatan: '',
      guru: ''
    });
    setIsNilaiModalOpen(true);
  };

  // Automatically update Jilid input when selecting student
  const handleSantriSelectionChange = (id: string) => {
    const selectedS = santriList.find(s => s.id === id);
    setNilaiForm(prev => ({
      ...prev,
      santriId: id,
      jilid: selectedS ? selectedS.jilid : 'Jilid 1'
    }));
  };

  const openEditNilai = (n: Nilai) => {
    setEditingNilai(n);
    setNilaiForm({
      santriId: n.santriId,
      tanggal: n.tanggal,
      jilid: n.jilid,
      materi: n.materi,
      aspekKelancaran: n.aspekKelancaran,
      aspekTajwid: n.aspekTajwid,
      aspekAdab: n.aspekAdab,
      catatan: n.catatan,
      guru: n.guru
    });
    setIsNilaiModalOpen(true);
  };

  const handleNilaiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nilaiForm.santriId || !nilaiForm.materi.trim()) {
      onNotify('Santri rujukan dan bahasan materi harus diisi.', 'error');
      return;
    }

    setLoading(true);
    try {
      const isEdit = !!editingNilai;
      const url = isEdit ? `/api/nilai/${editingNilai.id}` : '/api/nilai';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(nilaiForm)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal memproses penilaian.');
      }

      onNotify(
        isEdit ? 'Evaluasi nilai berhasil diperbaiki.' : 'Penilaian evaluasi terekam dengan sukses!',
        'success'
      );
      setIsNilaiModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      onNotify(err.message || 'Gagal menyimpan nilai.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerDeleteNilai = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'nilai',
      id,
      title: 'Hapus Rekam Nilai Evaluasi',
      message: 'Apakah Anda yakin ingin menghapus catatan evaluasi nilai terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.'
    });
  };

  const executeDeleteNilai = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/nilai/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal menghapus penilaian.');

      onNotify('Catatan evaluasi nilai terhapus.', 'success');
      fetchAdminData();
    } catch (err: any) {
      onNotify(err.message || 'Gagal menghapus.', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirm(prev => ({ ...prev, isOpen: false }));
    }
  };


  // ==================== DASHBOARD COMPUTATIONS ====================

  const activeSantri = santriList.filter(s => s.status === 'aktif');
  const lulusSantri = santriList.filter(s => s.status === 'lulus');
  const pindahSantri = santriList.filter(s => s.status === 'pindah');

  const overallAvgKelancaran = nilaiList.length > 0 
    ? Math.round(nilaiList.reduce((acc, current) => acc + current.aspekKelancaran, 0) / nilaiList.length)
    : 0;

  const overallAvgTajwid = nilaiList.length > 0 
    ? Math.round(nilaiList.reduce((acc, current) => acc + current.aspekTajwid, 0) / nilaiList.length)
    : 0;

  const overallAvgAdab = nilaiList.length > 0 
    ? Math.round(nilaiList.reduce((acc, current) => acc + current.aspekAdab, 0) / nilaiList.length)
    : 0;

  // Group classes density
  const getJilidDensity = (jilidName: string) => {
    return activeSantri.filter(s => s.jilid === jilidName).length;
  };

  const classes = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', "Al-Qur'an 1", "Al-Qur'an 2"];

  // ==================== SCREEN RENDERS ====================

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white border border-emerald-100 rounded-2xl shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sistem Keamanan Admin / Guru</h2>
          <p className="text-xs text-slate-400">
            Akses dashboard evaluasi, manajemen data santri, dan input nilai memerlukan kata sandi ustadz.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Kata Sandi Administrasi</label>
            <input
              type="password"
              placeholder="Masukkan password admin..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-red-500 outline-none text-slate-700 font-medium transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-2.5 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Masuk sebagai Admin'
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 italic">
          Default password: <strong className="font-mono text-emerald-600">admin123</strong> (dapat disesuaikan di variabel .env)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Admin navigation */}
      <div className="flex bg-white flex-col sm:flex-row gap-4 items-center justify-between p-4 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-bold text-slate-800 text-sm">
            Petugas Aktif: <span className="text-emerald-700">Administrator TPQ</span>
          </h3>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('status')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'status' ? 'bg-emerald-50 text-emerald-750' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Ringkasan Statistik
          </button>
          <button
            onClick={() => setActiveSubTab('santri')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'santri' ? 'bg-emerald-50 text-emerald-750' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Manajemen Santri ({santriList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('nilai')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeSubTab === 'nilai' ? 'bg-emerald-50 text-emerald-750' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Log Evaluasi Nilai ({nilaiList.length})
          </button>
          <button
            onClick={handleLogout}
            className="ml-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-colors"
            title="Keluar Sesi Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===================== VIEW 1: STATS / STATUS ===================== */}
      {activeSubTab === 'status' && (
        <div className="space-y-6">
          {/* Key Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-400 font-bold uppercase">Total Santri</p>
                <span className="p-2 bg-slate-50 text-slate-500 rounded-lg"><Users className="w-4 h-4" /></span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{santriList.length} Anak</h2>
              <div className="flex gap-2 text-[10px] text-slate-400 font-semibold mt-1">
                <span className="text-emerald-600 bg-emerald-55/70 px-1 py-0.5 rounded">{activeSantri.length} Aktif</span>
                <span className="text-blue-600 bg-blue-55/70 px-1 py-0.5 rounded">{lulusSantri.length} Lulus</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-400 font-bold uppercase">Rata Kelancaran</p>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Award className="w-4 h-4" /></span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{overallAvgKelancaran} / 100</h2>
              <p className="text-[10px] text-slate-400 mt-1">Rata-rata aspek fashohah secara institusi.</p>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-400 font-bold uppercase">Rata Tajwid</p>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-4 h-4" /></span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{overallAvgTajwid} / 100</h2>
              <p className="text-[10px] text-slate-400 mt-1">Kemampuan makhraj dan hukum bacaan.</p>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-400 font-bold uppercase">Rata Adab</p>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Heart className="w-4 h-4" /></span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{overallAvgAdab} / 100</h2>
              <p className="text-[10px] text-slate-400 mt-1">Tingkat ketertiban dan etika belajar harian.</p>
            </div>
          </div>

          {/* Jilid density list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Penyebaran Santri per Tingkat Jilid (Aktif)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {classes.map((jl) => {
                const count = getJilidDensity(jl);
                return (
                  <div key={jl} className="p-4 border border-slate-100 hover:border-emerald-300 rounded-xl bg-slate-50/50 transition-colors text-center">
                    <p className="text-xs font-bold text-slate-500">{jl}</p>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{count}</h3>
                    <p className="text-[10px] text-slate-400">Santri Aktif</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: SANTRI LIST / REGISTRATION ===================== */}
      {activeSubTab === 'santri' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-800 font-sans">Daftar Santri Terdaftar</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setParsedStudents([]);
                  setExcelErrors([]);
                  setIsExcelModalOpen(true);
                }}
                className="bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" /> Unggah Excel
              </button>
              <button
                onClick={openAddSantri}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Register Santri Baru
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                  <th className="p-4">ID</th>
                  <th className="p-4">Nama Lengkap Santri</th>
                  <th className="p-4">Kelas Jilid saat ini</th>
                  <th className="p-4">Nama Orang Tua/Wali</th>
                  <th className="p-4">Tanggal Lahir</th>
                  <th className="p-4">Mulai Masuk</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-705 text-sm">
                {santriList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-xs text-slate-400">{item.id}</td>
                    <td className="p-4 font-bold text-slate-800">{item.nama}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {item.jilid}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{item.namaWali}</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {item.tanggalLahir 
                        ? new Date(item.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">{item.tanggalMasuk}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'aktif' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : item.status === 'lulus'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditSantri(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-white hover:border-blue-100 rounded-lg cursor-pointer transition-colors"
                          title="Ubah Profil"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerDeleteSantri(item.id, item.nama)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 border border-white hover:border-rose-100 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Santri"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: EXAM GRADES LOG ===================== */}
      {activeSubTab === 'nilai' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-800 font-sans">Histori Catatan Evaluasi Belajar</h3>
            </div>
            <button
              onClick={openAddNilai}
              disabled={santriList.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Input Nilai Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-b">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                  <th className="p-4">Tanggal Diuji</th>
                  <th className="p-4">Nama Lengkap Santri</th>
                  <th className="p-4">Jilid</th>
                  <th className="p-4">Materi / Halaman</th>
                  <th className="p-4 text-center">Lancar</th>
                  <th className="p-4 text-center">Tajwid</th>
                  <th className="p-4 text-center">Adab</th>
                  <th className="p-4">Catatan Motivasi Guru</th>
                  <th className="p-4">Nama Penguji</th>
                  <th className="p-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {nilaiList.slice().reverse().map((item) => {
                  const student = santriList.find(s => s.id === item.santriId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="p-4 font-semibold text-slate-500 whitespace-nowrap">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 font-bold text-slate-800">{student ? student.nama : 'Santri tidak ditemukan'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          {item.jilid}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{item.materi}</td>
                      <td className="p-4 text-center font-bold text-emerald-600">{item.aspekKelancaran}</td>
                      <td className="p-4 text-center font-bold text-blue-600">{item.aspekTajwid}</td>
                      <td className="p-4 text-center font-bold text-amber-600">{item.aspekAdab}</td>
                      <td className="p-4 max-w-xs">{item.catatan || '-'}</td>
                      <td className="p-4 italic text-xs text-slate-500 whitespace-nowrap">{item.guru}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditNilai(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-white hover:border-blue-100 rounded-lg cursor-pointer transition-colors"
                            title="Edit Evaluasi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteNilai(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-white hover:border-rose-100 rounded-lg cursor-pointer transition-colors"
                            title="Hapus Evaluasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODAL FORM: REGISTER / EDIT SANTRI ===================== */}
      {isSantriModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-700 text-base">
                {editingSantri ? 'Ubah Profil Santri' : 'Mendaftarkan Santri Baru'}
              </h3>
              <button 
                onClick={() => setIsSantriModalOpen(false)}
                type="button"
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSantriSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap Santri</label>
                  <input
                    type="text"
                    placeholder="Isi nama santri..."
                    required
                    value={santriForm.nama}
                    onChange={(e) => setSantriForm(prev => ({ ...prev, nama: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Penempatan Jilid / Kelas</label>
                    <select
                      value={santriForm.jilid}
                      onChange={(e) => setSantriForm(prev => ({ ...prev, jilid: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-semibold"
                    >
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status Keaktifan</label>
                    <select
                      value={santriForm.status}
                      onChange={(e) => setSantriForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-semibold"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="lulus">Lulus (Khatam)</option>
                      <option value="pindah">Pindah / Berhenti</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Orang Tua / Wali Santri</label>
                  <input
                    type="text"
                    placeholder="Isi nama bapak/ibu wali..."
                    required
                    value={santriForm.namaWali}
                    onChange={(e) => setSantriForm(prev => ({ ...prev, namaWali: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={santriForm.tanggalLahir}
                      onChange={(e) => setSantriForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tanggal Masuk TPQ</label>
                    <input
                      type="date"
                      required
                      value={santriForm.tanggalMasuk}
                      onChange={(e) => setSantriForm(prev => ({ ...prev, tanggalMasuk: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3 justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSantriModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-emerald-600/10"
                >
                  <Save className="w-4 h-4" />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL FORM: INPUT / EDIT AWARD GRADES ===================== */}
      {isNilaiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-700 text-base">
                {editingNilai ? 'Koreksi Evaluasi Nilai' : 'Catat Penilaian Evaluasi Santri'}
              </h3>
              <button 
                onClick={() => setIsNilaiModalOpen(false)}
                type="button"
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNilaiSubmit} className="flex flex-col overflow-hidden leading-relaxed">
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)] text-left">
                {/* Select student */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Pilih Santri</label>
                    {editingNilai ? (
                      <div className="px-4 py-2 bg-slate-100 border rounded-xl text-slate-500 font-bold">
                        {santriList.find(s => s.id === nilaiForm.santriId)?.nama}
                      </div>
                    ) : (
                      <select
                        value={nilaiForm.santriId}
                        onChange={(e) => handleSantriSelectionChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-semibold"
                      >
                        {santriList.filter(s => s.status === 'aktif').map(s => (
                          <option key={s.id} value={s.id}>{s.nama} ({s.jilid})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tanggal Evaluasi</label>
                    <input
                      type="date"
                      required
                      value={nilaiForm.tanggal}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, tanggal: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                {/* Jilid assessed and Materi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Jilid Diuji</label>
                    <select
                      value={nilaiForm.jilid}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, jilid: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-semibold"
                    >
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Materi Ujian (Surat/Halaman/Bahasan)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Surat An-Naba 1-10..."
                      value={nilaiForm.materi}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, materi: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white border-slate-200 outline-none text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                {/* Evaluation score aspects widgets */}
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                  <span className="text-xs font-bold text-slate-600 block mb-2 border-b border-slate-200/50 pb-1">ASPEK PENILAIAN KOMPETENSI (0 s.d 100)</span>
                  
                  {/* Kelancaran */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">1. Kelancaran / Fashohah</span>
                      <span className="text-xs font-black text-emerald-600">{nilaiForm.aspekKelancaran} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="100" 
                      value={nilaiForm.aspekKelancaran}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, aspekKelancaran: Number(e.target.value) }))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer animate-none"
                    />
                  </div>

                  {/* Tajwid */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">2. Tajwid / Makhrajul Huruf</span>
                      <span className="text-xs font-black text-blue-600">{nilaiForm.aspekTajwid} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="100" 
                      value={nilaiForm.aspekTajwid}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, aspekTajwid: Number(e.target.value) }))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Adab */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">3. Adab, Disiplin & Sikap</span>
                      <span className="text-xs font-black text-amber-600">{nilaiForm.aspekAdab} / 100</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="100" 
                      value={nilaiForm.aspekAdab}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, aspekAdab: Number(e.target.value) }))}
                      className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Teacher comments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Catatan & Motivasi Guru</label>
                    <textarea
                      placeholder="Berikan saran penambah motivasi belajar ananda..."
                      value={nilaiForm.catatan}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, catatan: e.target.value }))}
                      rows={2}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-slate-700 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ustadz / Ustadzah Penguji</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama penguji..."
                      value={nilaiForm.guru}
                      onChange={(e) => setNilaiForm(prev => ({ ...prev, guru: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex gap-3 justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNilaiModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-emerald-600/10"
                >
                  <Save className="w-4 h-4" />
                  Rekam Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL (IFRAME-SAFE) */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scaleIn">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-2 text-rose-700 animate-pulse">
              <Trash2 className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold text-base">{deleteConfirm.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                {deleteConfirm.message}
              </p>
              <div className="text-[11px] font-semibold text-rose-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                ⚠️ Peringatan: Tindakan ini bersifat permanen dan seluruh data terkait akan terhapus sepenuhnya dari sistem TPQ Al-Asyhar.
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  if (deleteConfirm.type === 'santri') {
                    executeDeleteSantri(deleteConfirm.id);
                  } else {
                    executeDeleteNilai(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                {loading ? 'Mendelete...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-xl animate-scaleIn">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-bold text-base">Registrasi Santri Baru via Excel</h3>
              </div>
              <button 
                onClick={() => setIsExcelModalOpen(false)}
                className="hover:bg-emerald-500/80 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-left">
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-blue-800">
                <div className="space-y-1">
                  <p className="font-bold text-sm">📥 Unduh Template Format Excel</p>
                  <p className="text-slate-500 font-normal leading-relaxed">
                    Kami menyarankan untuk menggunakan template resmi ini agar data jilid, status, dan penulisan tanggal valid secara otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3.5 py-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" /> Unduh Template
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Pilih File Excel Anda (.xlsx / .xls)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 bg-slate-50/40 flex flex-col items-center justify-center gap-2.5 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Klik / Seret File di Sini</p>
                    <p className="text-xs text-slate-400 mt-1">Mendukung file Excel format spreadsheet standar (.xlsx / .xls)</p>
                  </div>
                </div>
              </div>

              {/* Parsed list preview */}
              {parsedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">
                      Total Terbaca: <strong className="text-emerald-600 text-sm font-extrabold">{parsedStudents.length} Santri</strong>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                      Siap Diimpor
                    </span>
                  </div>

                  <div className="border border-slate-100 rounded-xl overflow-x-auto max-h-52">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase sticky top-0">
                          <th className="p-3">Nama Lengkap</th>
                          <th className="p-3">Nama Wali</th>
                          <th className="p-3">Jilid</th>
                          <th className="p-3">Tanggal Lahir</th>
                          <th className="p-3">Tanggal Masuk</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {parsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-semibold text-slate-800">{s.nama}</td>
                            <td className="p-3">{s.namaWali}</td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-1.5 py-0.5 rounded">
                                {s.jilid}
                              </span>
                            </td>
                            <td className="p-3">{s.tanggalLahir || '-'}</td>
                            <td className="p-3">{s.tanggalMasuk}</td>
                            <td className="p-3 capitalize">{s.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Format warnings & errors list */}
              {excelErrors.length > 0 && (
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-100 space-y-2 text-xs">
                  <p className="font-bold flex items-center gap-1.5 text-rose-700">
                    ⚠️ Beberapa baris memiliki kesalahan format atau data kosong:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed max-h-32 overflow-y-auto">
                    {excelErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Silakan perbaiki data baris tersebut di file Excel Anda, lalu unggah kembali file yang telah diperbaiki.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsExcelModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={loading || parsedStudents.length === 0}
                onClick={submitBulkSantri}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-emerald-600/10 animate-bounce"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan Kolektif...' : 'Simpan Data Kolektif'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
