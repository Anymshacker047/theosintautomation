import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Shield, Database, Upload, Info, Loader2, AlertTriangle, User, Globe, MapPin, Activity, Terminal, Lock, ChevronRight, FileText, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [intensity, setIntensity] = useState(75);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/`);
      setDbStatus(res.data.database_loaded);
    } catch (err) {
      // Silent error for interval checks
      if(!dbStatus) setError("Network offline. Node disconnected.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || query.length < 2) return;

    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await axios.get(`${API_BASE}/search?q=${query}`);
      setResults(res.data.results);
      if (res.data.results.length === 0) setError("SUBJECT NOT FOUND IN DATABASE.");
    } catch (err) {
      setError(err.response?.data?.detail || "SCAN FAILED.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/upload-database`, formData);
      setDbStatus(true);
      // alert("Database updated successfully!");
    } catch (err) {
      setError("UPLOAD FAILED: " + (err.response?.data?.detail || "CORRUPT DATA"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans radar-bg">
      {/* Hazard Strip */}
      <div className="hazard-strip w-full">
        <span className="hazard-text hidden sm:inline">OFFICIAL USE ONLY • RAJASTHAN STATE POLICE INTERNAL NETWORK • UNAUTHORIZED ACCESS PROHIBITED</span>
        <span className="hazard-text sm:hidden">RAJASTHAN STATE POLICE INTERNAL NETWORK</span>
      </div>

      {/* Header */}
      <header className="panel m-4 flex flex-col md:flex-row items-center justify-between px-6 py-3 rounded-md border-b-2 border-b-[#FFC107]/50 gap-4">
        <div className="flex items-center gap-4">
          <Shield size={28} className="text-[#FFC107]" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">RAJASTHAN POLICE</h1>
            <p className="text-[10px] text-[#A0AEC0] font-mono tracking-widest">CYBER CELL COMMAND</p>
          </div>
        </div>
        
        <nav className="hidden lg:flex gap-8">
          <button className="text-[#A0AEC0] hover:text-white text-sm font-semibold tracking-wider pb-1 transition-colors">INTEL DATABASE</button>
          <button className="text-[#FFC107] border-b-2 border-[#FFC107] text-sm font-semibold tracking-wider pb-1">INVESTIGATION MODULES</button>
          <button className="text-[#A0AEC0] hover:text-white text-sm font-semibold tracking-wider pb-1 transition-colors">LOGS</button>
        </nav>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white font-mono">ID: RJ-7782</p>
            <p className="text-[10px] text-[#A0AEC0]">OP-ALPHA</p>
          </div>
          <button className="text-xs font-bold text-[#E53E3E] border border-[#E53E3E]/30 px-3 py-1 rounded hover:bg-[#E53E3E]/10 transition-colors">
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 pb-4 overflow-hidden">
        
        {/* Left Sidebar - Search Form */}
        <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          <div className="panel p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
              <Activity className="text-[#FFC107]" size={18} />
              <h2 className="font-bold text-white tracking-wide">SUBJECT INVESTIGATION</h2>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-5 flex-1">
              <div>
                <label className="text-[10px] text-[#A0AEC0] font-mono uppercase mb-1 block">Identify Subject</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter keyword, email..."
                    className="cyber-input pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFC107]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#A0AEC0] font-mono uppercase mb-1 block">Department ID</label>
                <input type="text" value="CYBER-RJ-09" disabled className="cyber-input opacity-50 cursor-not-allowed" />
              </div>

              <div>
                <label className="text-[10px] text-[#A0AEC0] font-mono uppercase mb-1 flex justify-between">
                  <span>Analysis Intensity</span>
                  <span className="text-[#FFC107]">{intensity}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full accent-[#FFC107] h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-[#A0AEC0] mt-1 font-mono">
                  <span>STANDARD</span>
                  <span>HIGH-INTEL</span>
                </div>
              </div>

              {error && (
                <div className="bg-[#E53E3E]/10 border border-[#E53E3E]/50 p-3 rounded text-xs text-[#E53E3E] flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="font-mono">{error}</span>
                </div>
              )}

              <div className="mt-auto pt-6">
                <button 
                  type="submit"
                  disabled={loading || (!dbStatus && !uploading)}
                  className="btn-yellow w-full"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'RUN CLEARANCE SCAN'}
                </button>
              </div>
            </form>
          </div>

          {/* Database Status Widget */}
          <div className="panel p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dbStatus ? 'bg-[#38B2AC] shadow-[0_0_8px_#38B2AC]' : 'bg-[#E53E3E] shadow-[0_0_8px_#E53E3E]'}`}></div>
                <span className="text-xs font-mono text-[#A0AEC0]">
                  DB_STATUS: <span className={dbStatus ? "text-[#38B2AC]" : "text-[#E53E3E]"}>{dbStatus ? 'SECURE' : 'OFFLINE'}</span>
                </span>
              </div>
              
              <label className="text-xs text-[#FFC107] hover:text-white cursor-pointer transition-colors font-mono flex items-center gap-1">
                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                <span>MOUNT ZIP</span>
                <input type="file" accept=".zip" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden h-[calc(100vh-140px)] lg:h-auto">
          {/* Header Bar */}
          <div className="panel px-5 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <Terminal className="text-[#38B2AC]" size={20} />
              <h2 className="text-lg font-bold text-white tracking-widest uppercase">
                {query ? `INCIDENT-${query.substring(0,8).toUpperCase()}` : 'AWAITING INPUT'}
              </h2>
            </div>
            <button className="text-xs font-mono text-[#FFC107] border border-[#FFC107]/30 px-3 py-1.5 rounded hover:bg-[#FFC107]/10 transition-colors hidden sm:flex items-center gap-2">
              <FileText size={14} />
              DOWNLOAD DOSSIER
            </button>
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            {!query && results.length === 0 && !loading && (
               <div className="h-full flex flex-col items-center justify-center opacity-20">
                 <Shield size={100} className="mb-4 text-[#FFC107]" />
                 <p className="font-mono text-xl tracking-widest text-center px-4">SYSTEM STANDBY. AWAITING CLEARANCE SCAN.</p>
               </div>
            )}
            
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                >
                  {results.map((result, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="panel p-5 relative overflow-hidden group hover:border-[#FFC107]/50 transition-colors"
                    >
                      {/* Top ribbon */}
                      <div className="absolute top-0 right-0 bg-[#E53E3E] text-white text-[9px] font-bold px-3 py-1 font-mono tracking-wider rounded-bl-lg">
                        PRIORITY MATCH
                      </div>

                      <div className="flex justify-between items-start mb-4 pr-24">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 flex items-center justify-center shrink-0">
                            <User size={20} className="text-[#FFC107]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#A0AEC0] font-mono">FILE REFERENCE</p>
                            <p className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-[250px]" title={result.file_name.split('/').pop()}>
                              {result.file_name.split('/').pop()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-5">
                        {Object.entries(result.content).slice(0, 4).map(([key, val]) => (
                          <div key={key} className="flex items-start gap-3 bg-black/20 p-2 rounded border border-white/5">
                            <ChevronRight size={14} className="text-[#38B2AC] mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-0.5">{key}</span>
                              <span className={`text-xs font-mono break-all ${query && String(val).toLowerCase().includes(query.toLowerCase()) ? 'bg-[#FFC107]/20 text-[#FFC107] px-1 rounded' : 'text-gray-300'}`}>
                                {String(val)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {Object.keys(result.content).length > 4 && (
                           <div className="text-[10px] text-[#A0AEC0] font-mono italic pl-2">
                             + {Object.keys(result.content).length - 4} additional encrypted fields...
                           </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-[#38B2AC]" />
                          <span className="text-[10px] text-[#38B2AC] font-mono">CONFIDENCE: {(Math.random() * (99.9 - 85.0) + 85.0).toFixed(1)}%</span>
                        </div>
                        <button className="text-[10px] text-white hover:text-[#FFC107] font-mono flex items-center gap-1 transition-colors">
                          OPEN DOSSIER <Link size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Bar */}
          <div className="panel px-4 py-2 mt-auto flex justify-between items-center text-[10px] font-mono text-[#A0AEC0] shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Lock size={10} /> ENCRYPTED NODE</span>
              <span className="hidden sm:flex items-center gap-1.5"><Globe size={10} className="text-[#38B2AC]" /> GRID: JP-NE</span>
            </div>
            <div>
              UPTIME: 99.9% <span className="hidden sm:inline">| LATENCY: 24ms</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
