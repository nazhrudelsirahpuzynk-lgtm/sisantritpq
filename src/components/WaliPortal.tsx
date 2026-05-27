/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  User, 
  BookOpen, 
  FileText, 
  Printer, 
  TrendingUp, 
  Award, 
  Compass, 
  Heart, 
  AlertCircle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Santri, Nilai } from '../types';

interface WaliPortalProps {
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

export default function WaliPortal({ onNotify }: WaliPortalProps) {
  const [searchName, setSearchName] = useState('');
  const [searchWali, setSearchWali] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ santri: Santri; nilai: Nilai[] }[]>([]);
  const [selectedResult, setSelectedResult] = useState<{ santri: Santri; nilai: Nilai[] } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Search logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) {
      onNotify('Silakan masukkan nama santri untuk memulai pencarian.', 'error');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({
        nama: searchName.trim(),
        ...(searchWali.trim() && { namaWali: searchWali.trim() })
      });

      const response = await fetch(`/api/public/lookup?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 404) {
          setSearchResults([]);
          setSelectedResult(null);
        } else {
          throw new Error('Terjadi kesalahan saat mencari data.');
        }
      } else {
        const data = await response.json();
        setSearchResults(data.results || []);
        if (data.results && data.results.length === 1) {
          setSelectedResult(data.results[0]);
        } else {
          setSelectedResult(null);
        }
      }
    } catch (err: any) {
      onNotify(err.message || 'Gagal terhubung ke server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Convert scores to Letter Grade
  const getLetterGrade = (score: number) => {
    if (score >= 85) return { grade: 'A', label: 'Istimewa', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 75) return { grade: 'B', label: 'Baik', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 65) return { grade: 'C', label: 'Cukup', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { grade: 'D', label: 'Perlu Bimbingan', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  // Trigger print view
  const triggerPrint = () => {
    setShowPrintModal(true);
  };

  const executePrint = () => {
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Calculate Average score for current selected student
  const getAverage = (nilaiList: Nilai[], aspect: 'aspekKelancaran' | 'aspekTajwid' | 'aspekAdab') => {
    if (nilaiList.length === 0) return 0;
    const sum = nilaiList.reduce((acc, curr) => acc + curr[aspect], 0);
    return Math.round(sum / nilaiList.length);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - hidden on print */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-6 md:p-8 shadow-sm no-print">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full gap-1 border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Portal Orang Tua / Wali Santri
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Ketahui Perkembangan Mengaji Ananda</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Masukkan nama lengkap santri dan nama wali untuk melihat grafik rekam jejak nilai serta mengunduh Rapor Evaluasi Belajar Belajar.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-6">
            <div className="md:col-span-5 relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nama Lengkap Santri..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium transition-all"
              />
            </div>
            <div className="md:col-span-4 relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Nama Wali (Opsional)..."
                value={searchWali}
                onChange={(e) => setSearchWali(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-700 font-medium transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-3 px-6 shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Cari Data
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Multiple Search Results Selector - hidden on print */}
      {searchResults.length > 1 && !selectedResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm no-print">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Ditemukan Beberapa Santri yang Cocok:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((result) => (
              <div 
                key={result.santri.id}
                onClick={() => setSelectedResult(result)}
                className="p-4 border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-700">{result.santri.nama}</h4>
                  <p className="text-xs text-slate-400">Wali: {result.santri.namaWali} | {result.santri.jilid}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - hidden on print */}
      {hasSearched && searchResults.length === 0 && !loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center no-print space-y-4">
          <div className="mx-auto w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Santri Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Periksa kembali ketikan nama santri atau nama wali. Pastikan sesuai dengan yang didaftarkan oleh admin/ustadz TPQ.
            </p>
          </div>
        </div>
      )}

      {/* Main Student Progress Dashboard */}
      <AnimatePresence mode="wait">
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Action buttons list - Hidden on print */}
            <div className="flex bg-white items-center justify-between no-print p-4 border border-slate-200 rounded-xl">
              <span className="text-slate-500 text-sm">
                Menampilkan hasil evaluasi untuk: <strong className="text-slate-800">{selectedResult.santri.nama}</strong>
              </span>
              <div className="flex gap-2">
                {searchResults.length > 1 && (
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-xs transition-colors cursor-pointer"
                  >
                    Kembali ke Daftar
                  </button>
                )}
                <button
                  onClick={triggerPrint}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg py-2 px-4 shadow-md shadow-emerald-600/5 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Cetak PDF Rapor
                </button>
              </div>
            </div>

            {/* Profile Overview Indicators (Screen Only) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Nama Santri</p>
                  <h4 className="font-bold text-slate-700 text-base">{selectedResult.santri.nama}</h4>
                  <p className="text-xs text-slate-400">Wali: {selectedResult.santri.namaWali}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Kelas / Jilid Saat Ini</p>
                  <h4 className="font-bold text-slate-700 text-base">{selectedResult.santri.jilid}</h4>
                  <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    Status: {selectedResult.santri.status.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tanggal Lahir</p>
                  <h4 className="font-bold text-slate-700 text-base">
                    {selectedResult.santri.tanggalLahir 
                      ? new Date(selectedResult.santri.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </h4>
                  <p className="text-xs text-slate-400">Masuk: {selectedResult.santri.tanggalMasuk}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Jumlah Evaluasi Nilai</p>
                  <h4 className="font-bold text-slate-700 text-lg">{selectedResult.nilai.length} Kali</h4>
                  <p className="text-xs text-slate-400">Rekomendasi Ustadz Tersedia</p>
                </div>
              </div>
            </div>

            {/* Performance Averages widgets (Screen Only) */}
            {selectedResult.nilai.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                {/* Kelancaran Average */}
                <div className="bg-gradient-to-br from-white to-emerald-50/20 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" /> Fashohah / Kelancaran
                    </span>
                    <span className="text-3xl font-extrabold text-slate-800">
                      {getAverage(selectedResult.nilai, 'aspekKelancaran')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Rata-rata fashohah, intonasi, dan kecepatan bacaan alqur'an.</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full" 
                      style={{ width: `${getAverage(selectedResult.nilai, 'aspekKelancaran')}%` }} 
                    />
                  </div>
                </div>

                {/* Tajwid Average */}
                <div className="bg-gradient-to-br from-white to-blue-50/20 border border-blue-100 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Tajwid & Makhraj
                    </span>
                    <span className="text-3xl font-extrabold text-slate-800">
                      {getAverage(selectedResult.nilai, 'aspekTajwid')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Ketepatan makhraj huruf hijaiyah serta kepatuhan hukum tajwid.</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${getAverage(selectedResult.nilai, 'aspekTajwid')}%` }} 
                    />
                  </div>
                </div>

                {/* Adab Average */}
                <div className="bg-gradient-to-br from-white to-amber-50/20 border border-amber-100 p-5 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> Adab & Sikap Belajar
                    </span>
                    <span className="text-3xl font-extrabold text-slate-800">
                      {getAverage(selectedResult.nilai, 'aspekAdab')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Kerapian berpakaian, ketertiban di kelas, serta kepatuhan ustadz.</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-amber-600 h-1.5 rounded-full" 
                      style={{ width: `${getAverage(selectedResult.nilai, 'aspekAdab')}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Progress Chart Panel - Screen Only */}
            {selectedResult.nilai.length >= 1 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm no-print">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-800">Sumbu Tren Perkembangan Santri</h3>
                </div>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedResult.nilai.map(n => ({
                        ...n,
                        formattedDate: new Date(n.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                      }))}
                      margin={{ top: 10, right: 30, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Line 
                        type="monotone" 
                        dataKey="aspekKelancaran" 
                        name="Kelancaran / Fashohah" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="aspekTajwid" 
                        name="Tajwid & Makhraj" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="aspekAdab" 
                        name="Adab & Sikap" 
                        stroke="#d97706" 
                        strokeWidth={3} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center no-print">
                <p className="text-sm text-slate-500 font-medium">Santri terdaftar tetapi belum memiliki rekam rekam nilai tertulis dari Ustadz.</p>
              </div>
            )}

            {/* Evaluations History Log Table - Screen Only */}
            {selectedResult.nilai.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm no-print">
                <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-800">Detail Rekam Nilai Historis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                        <th className="p-4">Tanggal Diuji</th>
                        <th className="p-4">Tingkat Jilid</th>
                        <th className="p-4">Halaman / Materi Bahasan</th>
                        <th className="p-4 text-center">Lancar</th>
                        <th className="p-4 text-center">Tajwid</th>
                        <th className="p-4 text-center">Adab</th>
                        <th className="p-4">Catatan Ustadz/ah</th>
                        <th className="p-4">Penguji</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                      {selectedResult.nilai.slice().reverse().map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap font-medium text-slate-600">
                            {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              {item.jilid}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-800">{item.materi}</td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-emerald-600">{item.aspekKelancaran}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-blue-600">{item.aspekTajwid}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-amber-600">{item.aspekAdab}</span>
                          </td>
                          <td className="p-4 max-w-xs text-slate-500 font-medium whitespace-normal truncate-lines">{item.catatan || '-'}</td>
                          <td className="p-4 text-slate-500 text-xs italic font-medium">{item.guru}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ======================= OFFICIAL RAPORT PDF LAYOUT ======================= */}
            {/* ONLY active when browser print is triggered (see css styling at indices etc) */}
            <div className="hidden print:block bg-white p-8 rounded-none border-0 min-h-screen text-black font-sans leading-relaxed text-sm">
              
              {/* Kop Surat Sekolah / Letterhead */}
              <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6 gap-6">
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src="/api/logo.png" 
                    alt="Logo TPQ Al Asyhar" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center flex-grow">
                  <h1 className="font-bold text-2xl uppercase tracking-wider font-arabic text-emerald-800 leading-tight">
                    TAMAN PENDIDIKAN AL QUR'AN AL ASYHAR
                  </h1>
                  <p className="text-xs uppercase tracking-widest font-bold mt-1">
                    Metode Al-Furqoniyyah | Dusun Karangbulu Desa Sima Kecamatan Moga Kabupaten Pemalang
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Dusun Karangbulu, Desa Sima, Kecamatan Moga, Kabupaten Pemalang, Jawa Tengah 52354
                  </p>
                </div>
                <div className="w-16 h-16 flex-shrink-0 invisible md:block">
                  {/* Keberimbangan ruang visual */}
                </div>
              </div>

              {/* Rapor Title */}
              <div className="text-center mb-6 space-y-1">
                <h2 className="text-lg font-bold uppercase tracking-tight text-gray-800 decoration-1 underline">
                  LAPORAN PEMANTANGAN HASIL EVALUASI BELAJAR SANTRI
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  No Dokumen: KHS-{selectedResult.santri.id}-{new Date().getFullYear()}
                </p>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 gap-4 border border-black p-4 rounded-lg mb-6 bg-gray-50/50">
                <div className="space-y-1 text-xs">
                  <div className="flex">
                    <span className="w-28 font-semibold">Nama Santri</span>
                    <span className="mr-2">:</span>
                    <span className="font-bold uppercase text-gray-800">{selectedResult.santri.nama}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold">Nomor Induk / ID</span>
                    <span className="mr-2">:</span>
                    <span className="font-mono">{selectedResult.santri.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold">Tanggal Lahir</span>
                    <span className="mr-2">:</span>
                    <span>
                      {selectedResult.santri.tanggalLahir 
                        ? new Date(selectedResult.santri.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex">
                    <span className="w-28 font-semibold">Orang Tua / Wali</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold">{selectedResult.santri.namaWali}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold">Jilid Kelas</span>
                    <span className="mr-2">:</span>
                    <span className="font-bold">{selectedResult.santri.jilid}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 font-semibold">Tanggal Masuk</span>
                    <span className="mr-2">:</span>
                    <span>{selectedResult.santri.tanggalMasuk}</span>
                  </div>
                </div>
              </div>

              {/* Evaluation Average Summary Table */}
              {selectedResult.nilai.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b-2 border-slate-300 pb-1">
                      A. RINGKASAN AKADEMIS (RATA-RATA EVALUASI)
                    </h3>
                    <table className="w-full border-collapse border border-black text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100 border-b border-black font-bold uppercase text-center">
                          <th className="border border-black p-2 w-12">No</th>
                          <th className="border border-black p-2 text-left">Aspek Kompetensi Dinilai</th>
                          <th className="border border-black p-2 w-24">Rata-Rata Angka</th>
                          <th className="border border-black p-2 w-24">Nilai Mutu</th>
                          <th className="border border-black p-2">Keterangan Capaian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Kelancaran */}
                        <tr className="border-b border-black">
                          <td className="border border-black p-2 text-center font-bold">1</td>
                          <td className="border border-black p-2 font-semibold">Kemampuan Fashohah & Kelancaran Membaca</td>
                          <td className="border border-black p-2 text-center font-bold">
                            {getAverage(selectedResult.nilai, 'aspekKelancaran')} / 100
                          </td>
                          <td className="border border-black p-2 text-center">
                            <span className="font-bold text-sm">
                              {getLetterGrade(getAverage(selectedResult.nilai, 'aspekKelancaran')).grade}
                            </span>
                          </td>
                          <td className="border border-black p-2 text-slate-600 font-medium">
                            {getLetterGrade(getAverage(selectedResult.nilai, 'aspekKelancaran')).label}
                          </td>
                        </tr>
                        {/* Tajwid */}
                        <tr className="border-b border-black">
                          <td className="border border-black p-2 text-center font-bold">2</td>
                          <td className="border border-black p-2 font-semibold">Ketepatan Tajwid & Makhrajul Huruf</td>
                          <td className="border border-black p-2 text-center font-bold">
                            {getAverage(selectedResult.nilai, 'aspekTajwid')} / 100
                          </td>
                          <td className="border border-black p-2 text-center">
                            <span className="font-bold text-sm">
                              {getLetterGrade(getAverage(selectedResult.nilai, 'aspekTajwid')).grade}
                            </span>
                          </td>
                          <td className="border border-black p-2 text-slate-600 font-medium">
                            {getLetterGrade(getAverage(selectedResult.nilai, 'aspekTajwid')).label}
                          </td>
                        </tr>
                        {/* Adab */}
                        <tr className="border-b border-black">
                          <td className="border border-black p-2 text-center font-bold">3</td>
                          <td className="border border-black p-2 font-semibold">Adab, Etika & Sikap Belajar Harian</td>
                          <td className="border border-black p-2 text-center font-bold">
                            {getAverage(selectedResult.nilai, 'aspekAdab')} / 100
                          </td>
                          <td className="border border-black p-2 text-center">
                            <span className="font-bold text-sm">
                              {getLetterGrade(getAverage(selectedResult.nilai, 'aspekAdab')).grade}
                            </span>
                          </td>
                          <td className="border border-black p-2 text-slate-600 font-medium">
                            {getLetterGrade(getAverage(selectedResult.nilai, 'aspekAdab')).label}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Kriteria Threshold */}
                  <div className="bg-slate-50 border border-slate-300 p-2 text-[10px] space-y-1">
                    <span className="font-bold uppercase text-[9px]">Standar Kelayakan Kompetensi Nilai Pembelajaran:</span>
                    <div className="flex gap-4">
                      <span><strong>A</strong> (85 - 100) : Istimewa / Sangat Memuaskan</span>
                      <span><strong>B</strong> (75 - 84)  : Baik / Lancar</span>
                      <span><strong>C</strong> (65 - 74)  : Cukup / Masih Latihan</span>
                      <span><strong>D</strong> (0 - 64)   : Kurang / Butuh Pelatihan Berulang</span>
                    </div>
                  </div>

                  {/* detailed tracking log */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b-2 border-slate-300 pb-1">
                      B. RIWAYAT PRESTASI BELAJAR (REKAM DETIL)
                    </h3>
                    <table className="w-full border-collapse border border-black text-[11px] text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-black font-bold">
                          <th className="border border-black p-1.5 w-24">Tanggal Uji</th>
                          <th className="border border-black p-1.5 w-16 text-center">Jilid</th>
                          <th className="border border-black p-1.5 text-left">Materi Kejar / Surat / Halaman</th>
                          <th className="border border-black p-1.5 text-center w-12">Lancar</th>
                          <th className="border border-black p-1.5 text-center w-12">Tajwid</th>
                          <th className="border border-black p-1.5 text-center w-12">Adab</th>
                          <th className="border border-black p-1.5">Catatan Motivasi Guru / Ustadz</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedResult.nilai.map((entry) => (
                          <tr key={entry.id} className="border-b border-black">
                            <td className="border border-black p-1.5 font-medium">
                              {new Date(entry.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="border border-black p-1.5 text-center">{entry.jilid}</td>
                            <td className="border border-black p-1.5 font-semibold text-gray-800">{entry.materi}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{entry.aspekKelancaran}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{entry.aspekTajwid}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{entry.aspekAdab}</td>
                            <td className="border border-black p-1.5 font-medium italic text-gray-600">{entry.catatan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures / Tanda Tangan */}
                  <div className="pt-12 grid grid-cols-3 gap-4 text-center text-xs mt-12">
                    <div className="space-y-16">
                      <p>Wali Santri,</p>
                      <div className="border-b border-black w-40 mx-auto" />
                      <p className="font-bold">( {selectedResult.santri.namaWali} )</p>
                    </div>

                    <div className="space-y-16">
                      <p>Ustadz / Ustadzah Evaluator,</p>
                      <div className="border-b border-black w-40 mx-auto" />
                      <p className="font-bold">
                        ( {selectedResult.nilai[selectedResult.nilai.length - 1]?.guru || 'Ustadzah Rahma'} )
                      </p>
                    </div>

                    <div className="space-y-16">
                      <p>Mengetahui,<br/>Kepala TPQ AL ASYHAR</p>
                      <div className="border-b border-black w-40 mx-auto" />
                      <p className="font-bold">( Ustadz Nasrudin Ahmad )</p>
                    </div>
                  </div>

                </div>
              ) : (
                <p className="text-center font-bold text-rose-600 py-4">SANTRI INI BELUM MEMILIKI REKAM NILAI AKADEMIK.</p>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* PRINT ADVICE MODAL (IFRAME & DOWNLOAD COMPATIBILITY) */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border text-left rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-emerald-600 px-6 py-4 flex items-center gap-2 text-white">
                <Printer className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-bold text-base">Petunjuk Cetak / Simpan PDF Rapor</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs space-y-2 border border-emerald-100 font-medium">
                  <p className="font-bold">💡 Tips Mengunduh PDF:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Setelah mengklik "Cari/Buka Dokumen", kotak dialog cetak browser akan muncul.</li>
                    <li>Pada kolom <strong>"Tujuan"</strong> (Destination), pilih opsi <strong>"Simpan sebagai PDF"</strong> (Save as PDF).</li>
                    <li>Pastikan opsi <strong>"Sembunyikan Header dan Footer"</strong> dicentang dan <strong>"Grafik Latar Belakang"</strong> diaktifkan agar tampilan kop surat rapi.</li>
                  </ol>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-2.5 items-start text-amber-800 text-xs">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-[11px]">Apakah Kotak Dialog Cetak Tidak Muncul?</p>
                    <p className="leading-relaxed text-[11px]">
                      Jika Anda berada di dalam layar pratinjau AI Studio, sistem keamanan browser mungkin memblokir popup pencetakan. 
                      Silakan klik tombol <strong>"Buka di Tab Baru"</strong> di ujung kanan atas layar browser Anda terlebih dahulu, lalu lakukan pencetakan dari sana agar lancar.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executePrint}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-emerald-600/10"
                >
                  <Printer className="w-4 h-4" />
                  Mulai Cetak / Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
