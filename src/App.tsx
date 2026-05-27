/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Users, 
  Lock, 
  BookOpen, 
  CheckCircle, 
  X, 
  AlertCircle,
  Award,
  BookMarked
} from 'lucide-react';
import WaliPortal from './components/WaliPortal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'wali' | 'admin'>('wali');
  
  // Custom Toast notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000); // Dissipates after 4 seconds
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 font-sans antialiased selection:bg-emerald-600 selection:text-white pb-12">
      
      {/* Dynamic Toast Notifications (No print) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl border shadow-lg bg-white max-w-md w-[90%] no-print"
            style={{
              borderColor: toast.type === 'success' ? '#bbf7d0' : '#fecdd3',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)'
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <p className="text-xs font-bold text-slate-700 leading-normal flex-grow">{toast.message}</p>
            <button 
              onClick={() => setToast(null)} 
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Navigation Header (No print) */}
      <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-30 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Main Logo & Title with Islamic Calligraphy Vibe */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-0.5 shadow-md shadow-emerald-600/10 border border-emerald-100 overflow-hidden">
              <img 
                src="/api/logo.png" 
                alt="Logo TPQ Al Asyhar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-800 flex items-center gap-1.5 leading-none">
                SI-SANTRI TPQ AL ASYHAR SIMA
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">v1.2</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">SI Laporan & Evaluasi Belajar Santri TPQ</p>
            </div>
          </div>

          {/* Wali vs Admin Tab switches */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('wali')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'wali' 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Portal Wali Santri
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === 'admin' 
                  ? 'bg-white text-emerald-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              Akses Admin / Guru
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Banner Informasional UI (No print) */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md shadow-emerald-950/10 no-print mb-6">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-300 via-emerald-200 to-transparent pointer-events-none" />
          
          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-400/20 font-bold uppercase tracking-wider">
              Taman Pendidikan Al-Qur'an (TPQ)
            </span>
            <h2 className="text-xl md:text-2xl font-black font-sans leading-tight">Mewujudkan Generasi Qur'ani yang Cerdas & Beradab Mulia</h2>
            <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed font-medium">
              Sistem rekam evaluasi terintegrasi untuk kelas Jilid 1 sampai Jilid 5 serta kelas Al-Qur'an 1 dan Al-Qur'an 2. Mendukung rekam jejak hafalan, makhraj, tajwid, fashohah, dan adab santri.
            </p>
          </div>
        </div>

        {/* Tab Router Section */}
        <div className="space-y-6">
          {activeTab === 'wali' ? (
            <WaliPortal onNotify={showNotification} />
          ) : (
            <AdminPanel onNotify={showNotification} />
          )}
        </div>

      </main>
      
    </div>
  );
}
