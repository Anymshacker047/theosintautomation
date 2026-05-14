import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Shield, Database, Upload, Info, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/`);
      setDbStatus(res.data.database_loaded);
    } catch (err) {
      setError("Backend connection failed. Ensure the server is running.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || query.length < 2) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/search?q=${query}`);
      setResults(res.data.results);
      if (res.data.results.length === 0) setError("No related information found.");
    } catch (err) {
      setError(err.response?.data?.detail || "Search failed.");
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
      alert("Database updated successfully!");
    } catch (err) {
      setError("Upload failed: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Header Section */}
      <header className="mb-12 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-3 mb-4 px-4 py-2 glass border-cyan-500/30 text-cyan-400"
        >
          <Shield size={20} />
          <span className="font-mono text-sm uppercase tracking-widest">OSINT Intelligence Core v2.0</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          NEBULA <span className="text-cyan-400">SEARCH</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Quantum-grade information retrieval from your encrypted ZIP databases. 
          Search by Name, Email, or Phone.
        </p>
      </header>

      {/* Main Search Interface */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative">
          <form onSubmit={handleSearch} className="relative z-10">
            <input 
              type="text" 
              placeholder="Enter target query (e.g. johndoe@email.com)..."
              className="cyber-input text-xl py-6 pl-14 pr-32"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500/50" size={24} />
            <button 
              type="submit"
              disabled={loading || !dbStatus}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'FETCH DATA'}
            </button>
          </form>
          
          {/* Status Indicators */}
          <div className="flex justify-between mt-4 px-2">
            <div className="flex items-center gap-2 text-sm">
              <Database size={14} className={dbStatus ? "text-green-500" : "text-red-500"} />
              <span className={dbStatus ? "text-green-500" : "text-red-500"}>
                {dbStatus ? "Database Online" : "Database Offline"}
              </span>
            </div>
            
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-cyan-400 transition-colors">
              <Upload size={14} />
              <span>{uploading ? "Updating..." : "Update ZIP Database"}</span>
              <input type="file" accept=".zip" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 glass border-red-500/30 text-red-400 flex items-center gap-3"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="results-grid"
          >
            {results.map((result, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass result-card border-white/5 hover:border-cyan-500/30 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="px-2 py-1 bg-cyan-500/10 text-cyan-500 text-[10px] font-mono rounded uppercase">
                    FILE: {result.file_name.split('/').pop()}
                  </div>
                  <Info size={16} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                
                <div className="space-y-3">
                  {Object.entries(result.content).map(([key, val]) => (
                    <div key={key} className="flex flex-col border-l-2 border-gray-800 pl-3 py-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{key}</span>
                      <span className="text-sm font-mono text-gray-300 break-all">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}

export default App;
