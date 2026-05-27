/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Santri {
  id: string;
  nama: string;
  jilid: string; // "Jilid 1" | "Jilid 2" | "Jilid 3" | "Jilid 4" | "Jilid 5" | "Al-Qur'an 1" | "Al-Qur'an 2"
  namaWali: string;
  tanggalLahir: string;
  tanggalMasuk: string;
  status: 'aktif' | 'lulus' | 'pindah';
}

export interface Nilai {
  id: string;
  santriId: string;
  tanggal: string;
  jilid: string;
  materi: string; // Halaman / Surah / Bab
  aspekKelancaran: number; // 0 - 100
  aspekTajwid: number; // 0 - 100
  aspekAdab: number; // 0 - 100
  catatan: string; // Rekomendasi / evaluasi ustadz/ustadzah
  guru: string; // Nama Ustadz / Ustadzah
}

export interface DatabaseState {
  santri: Santri[];
  nilai: Nilai[];
  adminPassword?: string;
}
