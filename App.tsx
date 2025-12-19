
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
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-20">
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
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white p-2 rounded-xl shadow-inner">
              <i className="fas fa-graduation-cap text-orange-600 text-xl md:text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-none">Kalkulator IPS</h1>
              <p className="text-orange-100 text-xs mt-1 opacity-80">Smart Transcript Scanner</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
             <label className="flex-1 md:flex-none cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20 group">
              <i className={`fas ${isScanning ? 'fa-spinner fa-spin' : 'fa-camera'} group-hover:scale-110 transition-transform`}></i>
              <span className="font-semibold text-sm">{isScanning ? 'Menganalisa...' : 'Scan'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isScanning} />
            </label>
            <button 
              onClick={addCourse}
              className="hidden md:flex bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 active:scale-95 transition-all items-center gap-2 shadow-sm"
            >
              <i className="fas fa-plus"></i>
              <span>Tambah MK</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 md:px-4 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Course List Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Mata Kuliah</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-32">SKS</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-32">Nilai</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16 text-center">Aksi</th>
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
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500/30 outline-none text-center font-bold text-slate-700 text-lg"
                        value={course.sks}
                        onChange={(e) => updateCourse(course.id, 'sks', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500/30 outline-none appearance-none cursor-pointer text-center font-bold text-slate-700 text-lg"
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                        >
                          {GRADE_SCALE.map(g => (
                            <option key={g.letter} value={g.letter}>{g.letter}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => removeCourse(course.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 relative group animate-in slide-in-from-bottom-2 duration-300">
                <button 
                  onClick={() => removeCourse(course.id)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 active:text-red-500"
                >
                  <i className="fas fa-times"></i>
                </button>
                
                <div className="mb-4 pr-8">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mata Kuliah</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Kalkulus 1"
                    className="w-full bg-transparent text-lg font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Kode MK"
                    className="w-full bg-transparent text-sm text-slate-400 mt-1 focus:outline-none"
                    value={course.code}
                    onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Bobot SKS</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-black text-xl text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                      value={course.sks}
                      onChange={(e) => updateCourse(course.id, 'sks', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Nilai Huruf</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-black text-xl text-orange-600 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none appearance-none"
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      >
                        {GRADE_SCALE.map(g => (
                          <option key={g.letter} value={g.letter}>{g.letter}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                        <i className="fas fa-sort text-xs"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-4 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl">
                <i className="fas fa-folder-open opacity-30"></i>
              </div>
              <p className="max-w-[200px] font-medium leading-relaxed">Ketuk tombol + di bawah untuk mulai menambah nilai.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3">
              <i className="fas fa-exclamation-triangle"></i>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-200 p-8 text-center sticky top-28 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
            
            <h2 className="text-slate-400 font-bold mb-1 uppercase tracking-widest text-[10px]">Indeks Prestasi Semester</h2>
            <div 
              className={`text-7xl font-black text-slate-800 my-4 tracking-tighter inline-block transition-all duration-300 ${shouldAnimate ? 'animate-pop' : ''}`}
            >
              {ips}
            </div>
            
            <div className="flex gap-3 mt-6 mb-8">
              <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Total SKS</span>
                <span className="text-2xl font-black text-slate-700">{totalSKS}</span>
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Poin</span>
                <span className="text-2xl font-black text-slate-700">{totalPoints.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                   {['A', 'B', 'C'].map((label, idx) => (
                     <span key={idx} className={`w-2.5 h-2.5 rounded-full ${parseFloat(ips) >= (4-idx) ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-slate-200'}`}></span>
                   ))}
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase italic">Verified Calculation</span>
              </div>
              <button 
                onClick={() => window.print()}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group"
              >
                <i className="fas fa-file-pdf group-hover:rotate-12 transition-transform"></i>
                Simpan Transkrip
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden">
            <i className="fas fa-bolt absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12"></i>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <i className="fas fa-magic"></i>
              </div>
              <h3 className="font-bold text-lg">Fitur Scan AI</h3>
            </div>
            <p className="text-sm text-blue-50 leading-relaxed relative z-10 opacity-90">
              Malas mengetik? Foto saja KHS Anda! AI kami akan mendeteksi nama matkul, SKS, dan nilai secara otomatis.
            </p>
          </div>
        </div>
      </main>

      {/* Modern Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full px-6 flex justify-center">
        <button 
          onClick={addCourse}
          className="bg-orange-500 text-white w-full max-w-xs py-4 rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center justify-center gap-3 font-black text-lg active:scale-95 transition-all border-b-4 border-orange-700 active:border-b-0 translate-y-0 active:translate-y-1"
        >
          <i className="fas fa-plus"></i>
          TAMBAH NILAI
        </button>
      </div>
    </div>
  );
};

export default App;
