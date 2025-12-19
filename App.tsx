
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Course, Grade } from './types';
import { INITIAL_COURSES, GRADE_SCALE, getPointsForGrade } from './constants';
import { scanTranscriptImage } from './geminiService';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  const addCourse = () => {
    const newCourse: Course = {
      id: uuidv4(),
      code: '',
      name: '',
      sks: 2,
      grade: 'A',
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const totalSKS = useMemo(() => courses.reduce((sum, c) => sum + (Number(c.sks) || 0), 0), [courses]);
  const totalPoints = useMemo(() => {
    return courses.reduce((sum, c) => {
      const sks = Number(c.sks) || 0;
      const points = getPointsForGrade(c.grade);
      return sum + (sks * points);
    }, 0);
  }, [courses]);

  const ips = totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : '0.00';

  // Trigger animation when IPS value changes
  const prevIpsRef = useRef(ips);
  useEffect(() => {
    if (prevIpsRef.current !== ips) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 400);
      prevIpsRef.current = ips;
      return () => clearTimeout(timer);
    }
  }, [ips]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const extracted = await scanTranscriptImage(base64String);
        if (extracted.length > 0) {
          const newCourses: Course[] = extracted.map(item => ({
            id: uuidv4(),
            code: item.code || '',
            name: item.name || 'Mata Kuliah Baru',
            sks: item.sks || 2,
            grade: (item.grade as Grade) || 'A',
          }));
          setCourses(prev => [...prev, ...newCourses]);
        } else {
          setError("Tidak dapat mengekstrak data dari gambar.");
        }
      } catch (err) {
        setError("Gagal menghubungi AI. Periksa koneksi atau kunci API.");
        console.error(err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* CSS Animation defined locally for convenience */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); color: #f97316; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl">
              <i className="fas fa-graduation-cap text-orange-600 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Kalkulator IPS Pintar</h1>
              <p className="text-orange-100 text-sm">Hitung prestasimu dengan cerdas</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-all flex items-center gap-2 border border-white/40 group">
              <i className={`fas ${isScanning ? 'fa-spinner fa-spin' : 'fa-camera'} group-hover:scale-110 transition-transform`}></i>
              <span className="font-medium">{isScanning ? 'Menganalisa...' : 'Scan Transcript'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isScanning} />
            </label>
            <button 
              onClick={addCourse}
              className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
              <i className="fas fa-plus"></i>
              <span>Tambah MK</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Kuliah</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">SKS</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Nilai</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          placeholder="Nama Mata Kuliah"
                          className="w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500/20 rounded px-2 py-1 transition-all font-medium text-slate-700"
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Kode"
                          className="w-full bg-transparent text-xs text-slate-400 focus:outline-none mt-1 px-2"
                          value={course.code}
                          onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[100px]">
                          <input 
                            type="number" 
                            min="0"
                            placeholder="SKS"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none text-center font-bold text-slate-700 text-lg transition-all"
                            value={course.sks}
                            onChange={(e) => updateCourse(course.id, 'sks', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none appearance-none cursor-pointer text-center font-bold text-slate-700 text-lg transition-all"
                            value={course.grade}
                            onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                          >
                            {GRADE_SCALE.map(g => (
                              <option key={g.letter} value={g.letter}>{g.letter}</option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                            <i className="fas fa-chevron-down"></i>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => removeCourse(course.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 p-2"
                          title="Hapus Mata Kuliah"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-book-open text-2xl opacity-40"></i>
                  </div>
                  <p className="max-w-xs">Belum ada mata kuliah yang dimasukkan. Tambahkan secara manual atau scan berkas Anda.</p>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-bounce-short">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Sidebar Summary Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 text-center sticky top-32 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            
            <h2 className="text-slate-500 font-medium mb-1 uppercase tracking-widest text-xs">Indeks Prestasi Semester</h2>
            <div 
              className={`text-6xl font-black text-slate-800 my-6 tracking-tighter inline-block transition-all duration-300 ${shouldAnimate ? 'animate-pop' : ''}`}
            >
              {ips}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group hover:border-orange-200 transition-colors">
                <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Total SKS</span>
                <span className="text-xl font-bold text-slate-700">{totalSKS}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group hover:border-orange-200 transition-colors">
                <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Total Poin</span>
                <span className="text-xl font-bold text-slate-700">{totalPoints.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 italic">Rumus: Σ(SKS × Poin) / ΣSKS</span>
                <div className="flex gap-1">
                  <span className={`w-2 h-2 rounded-full ${parseFloat(ips) >= 3.5 ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                  <span className={`w-2 h-2 rounded-full ${parseFloat(ips) >= 3.0 ? 'bg-blue-400' : 'bg-slate-200'}`}></span>
                </div>
              </div>
              <button 
                onClick={() => window.print()}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                <i className="fas fa-print"></i>
                Simpan Sebagai PDF
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 transform group-hover:scale-125 transition-transform duration-700">
               <i className="fas fa-magic text-8xl"></i>
            </div>
             <div className="flex items-center gap-3 mb-3 text-blue-700">
              <div className="bg-blue-100 p-2 rounded-lg">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="font-bold">Tips Cerdas</h3>
            </div>
            <p className="text-sm text-blue-600 leading-relaxed relative z-10">
              Coba fitur <strong>Scan Transcript</strong>. AI akan mengekstrak data dari foto KHS Anda secara otomatis untuk mempercepat pengisian data.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-8 right-8 z-20">
        <button 
          onClick={addCourse}
          className="bg-orange-500 text-white w-16 h-16 rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center text-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default App;
