import React, { useState, useEffect } from 'react';
import { Play, Square, ArrowUpDown, Share2, Plus, Volume2, Settings, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { audioService } from './services/audioService';
import { OscillatorConfig, Language, SortOrder } from './types';
import { TRANSLATIONS } from './constants';
import Visualizer from './components/Visualizer';
import OscillatorList from './components/OscillatorList';
import AddToneModal from './components/AddToneModal';

const App: React.FC = () => {
  // --- Global Settings State ---
  const [theme, setTheme] = useState<'platinum' | 'obsidian'>('platinum');
  const [language, setLanguage] = useState<Language>('en');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const t = TRANSLATIONS[language];

  // --- App State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [oscillators, setOscillators] = useState<OscillatorConfig[]>([]);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // Load Settings from LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('tonegen_theme') as 'platinum' | 'obsidian';
    if (savedTheme) setTheme(savedTheme);
    
    const savedLang = localStorage.getItem('tonegen_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'obsidian') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tonegen_theme', theme);
  }, [theme]);

  // Save Language
  useEffect(() => {
    localStorage.setItem('tonegen_lang', language);
  }, [language]);

  // Initialize Audio Context on first interaction or mount (but play only on user action)
  useEffect(() => {
    audioService.init();
  }, []);

  // Sync Master Volume
  useEffect(() => {
    audioService.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Play/Stop Logic
  const togglePlay = () => {
    if (isPlaying) {
      audioService.stopAll();
      setIsPlaying(false);
    } else {
      audioService.init(); // Ensure context is ready
      oscillators.forEach(osc => {
        if (osc.active) audioService.startOscillator(osc);
      });
      setIsPlaying(true);
    }
  };

  // Add Oscillators from Modal
  const handleAddOscillators = (newOscillators: OscillatorConfig[]) => {
    const updated = [...oscillators, ...newOscillators];
    
    // If sort order is active, we should re-sort immediately or keep appended? 
    // Usually append is better UX until user sorts again, but sticking to requested logic of "single sort action" -> manual adjustment allowed.
    // So we just append.
    setOscillators(updated);
    
    // If currently playing, start the new ones immediately
    if (isPlaying) {
      newOscillators.forEach(osc => {
        if (osc.active) audioService.startOscillator(osc);
      });
    }
  };

  // Remove Oscillator
  const removeOscillator = (id: string) => {
    audioService.stopOscillator(id);
    setOscillators(prev => prev.filter(o => o.id !== id));
  };

  // Delete All
  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all frequencies?')) {
        audioService.stopAll();
        setOscillators([]);
        setIsPlaying(false);
    }
  };

  // Update Oscillator
  const updateOscillator = (id: string, updates: Partial<OscillatorConfig>) => {
    const updatedList = oscillators.map(osc => {
      if (osc.id === id) {
        const newConfig = { ...osc, ...updates };
        // Real-time audio update
        if (isPlaying) {
            audioService.updateOscillator(newConfig);
        }
        return newConfig;
      }
      return osc;
    });
    setOscillators(updatedList);
  };

  // Sort Logic: Cycle None -> Asc -> Desc -> Asc ...
  const handleSort = () => {
    let nextOrder: SortOrder = 'asc';
    
    if (sortOrder === 'none') nextOrder = 'asc';
    else if (sortOrder === 'asc') nextOrder = 'desc';
    else if (sortOrder === 'desc') nextOrder = 'asc';
    
    setSortOrder(nextOrder);

    setOscillators(prev => {
        const sorted = [...prev].sort((a, b) => {
            if (nextOrder === 'asc') return a.freq - b.freq;
            if (nextOrder === 'desc') return b.freq - a.freq;
            return 0;
        });
        return sorted;
    });
  };
  
  // Render Sort Icon
  const getSortIcon = () => {
      if (sortOrder === 'asc') return <ArrowDown size={18} />; // Ascending (Small to Large) often depicted as A->Z down
      if (sortOrder === 'desc') return <ArrowUp size={18} />;
      return <ArrowUpDown size={18} />;
  };

  // Share Feature (Base64 encoding state)
  const handleShare = () => {
    const data = JSON.stringify(oscillators.map(o => ({ f: o.freq, t: o.type, v: o.vol })));
    const b64 = btoa(data);
    const url = `${window.location.origin}${window.location.pathname}#config=${b64}`;
    navigator.clipboard.writeText(url).then(() => {
        alert(t.linkCopied);
    });
  };

  // Load from URL Hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
        try {
            const b64 = hash.substring(8);
            const data = JSON.parse(atob(b64));
            const loaded: OscillatorConfig[] = data.map((d: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                freq: d.f,
                type: d.t,
                vol: d.v,
                active: true
            }));
            setOscillators(loaded);
        } catch(e) {
            console.error("Invalid config");
        }
    }
  }, []);

  return (
    <div className="min-h-screen pb-10 text-platinum-800 dark:text-platinum-100 font-sans transition-colors">
      
      {/* Header / Title */}
      <header className="pt-8 pb-4 text-center relative max-w-3xl mx-auto">
        <h1 className="text-3xl font-light tracking-[0.2em] text-platinum-600 dark:text-platinum-300 uppercase mb-2" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.1), -1px -1px 2px rgba(0,0,0,0.1)' }}>
          {t.appTitle}
          <span className="text-xs align-top ml-1 text-platinum-400 dark:text-platinum-500">{t.subtitle}</span>
        </h1>

        {/* Settings Button */}
        <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="absolute top-8 right-4 p-2 text-platinum-400 hover:text-platinum-600 dark:hover:text-platinum-200 transition-colors"
        >
            <Settings size={20} />
        </button>

        {/* Settings Dropdown/Panel */}
        {isSettingsOpen && (
            <div className="absolute top-16 right-4 w-48 bg-white dark:bg-obsidian-300 shadow-xl rounded-xl border border-platinum-200 dark:border-obsidian-500 z-20 p-3 flex flex-col gap-3">
                
                {/* Theme Toggle */}
                <div>
                    <label className="text-xs text-platinum-400 uppercase font-bold block mb-1">{t.theme}</label>
                    <div className="flex bg-platinum-100 dark:bg-obsidian-500 rounded-lg p-1">
                        <button 
                            onClick={() => setTheme('platinum')} 
                            className={`flex-1 text-xs py-1 rounded-md transition-all ${theme === 'platinum' ? 'bg-white shadow text-platinum-800' : 'text-platinum-400 hover:text-platinum-600'}`}
                        >
                            {t.platinum}
                        </button>
                        <button 
                            onClick={() => setTheme('obsidian')} 
                            className={`flex-1 text-xs py-1 rounded-md transition-all ${theme === 'obsidian' ? 'bg-obsidian-300 shadow text-platinum-100' : 'text-platinum-400 hover:text-platinum-300'}`}
                        >
                            {t.obsidian}
                        </button>
                    </div>
                </div>

                {/* Language Toggle */}
                <div>
                    <label className="text-xs text-platinum-400 uppercase font-bold block mb-1">{t.language}</label>
                    <div className="flex bg-platinum-100 dark:bg-obsidian-500 rounded-lg p-1">
                        <button 
                            onClick={() => setLanguage('en')} 
                            className={`flex-1 text-xs py-1 rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-obsidian-300 shadow text-platinum-800 dark:text-platinum-100' : 'text-platinum-400'}`}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => setLanguage('zh')} 
                            className={`flex-1 text-xs py-1 rounded-md transition-all ${language === 'zh' ? 'bg-white dark:bg-obsidian-300 shadow text-platinum-800 dark:text-platinum-100' : 'text-platinum-400'}`}
                        >
                            繁中
                        </button>
                    </div>
                </div>
            </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4">
        
        {/* Visualizer Card */}
        <div className="mb-6">
            <Visualizer />
        </div>

        {/* Controls Toolbar */}
        <div className="bg-platinum-100 dark:bg-obsidian-200 rounded-2xl p-4 mb-6 shadow-metal dark:shadow-obsidian-metal flex flex-wrap items-center justify-between gap-4 border border-white dark:border-obsidian-400 transition-colors">
            
            {/* Left: Play/Stop & Add */}
            <div className="flex gap-3">
                <button
                    onClick={togglePlay}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:shadow-inner ${
                        isPlaying 
                        ? 'bg-platinum-200 dark:bg-obsidian-400 text-red-500 border border-platinum-300 dark:border-obsidian-500' 
                        : 'bg-gradient-to-br from-white to-platinum-200 dark:from-obsidian-300 dark:to-obsidian-500 text-green-600 dark:text-green-400 border border-white dark:border-obsidian-400'
                    }`}
                >
                    {isPlaying ? <Square fill="currentColor" size={18} /> : <Play fill="currentColor" size={20} className="ml-1" />}
                </button>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-platinum-600 to-platinum-800 dark:from-platinum-500 dark:to-obsidian-900 text-white flex items-center justify-center shadow-lg active:shadow-inner hover:scale-105 transition-transform"
                    title={t.addTone}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* Middle: Master Vol */}
            <div className="flex items-center gap-3 bg-white/50 dark:bg-obsidian-400/50 px-4 py-2 rounded-full border border-white/60 dark:border-obsidian-500 shadow-inner flex-1 max-w-[250px]">
                <Volume2 size={18} className="text-platinum-500 dark:text-platinum-400" />
                <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-platinum-300 dark:bg-obsidian-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Right: Tools */}
            <div className="flex gap-2">
                <button 
                    onClick={handleSort}
                    className="p-3 rounded-xl bg-platinum-50 dark:bg-obsidian-300 border border-platinum-200 dark:border-obsidian-500 text-platinum-600 dark:text-platinum-300 hover:bg-white dark:hover:bg-obsidian-200 shadow-sm active:shadow-inner transition-colors"
                    title={t.sort}
                >
                    {getSortIcon()}
                </button>
                <button 
                    onClick={handleShare}
                    className="p-3 rounded-xl bg-platinum-50 dark:bg-obsidian-300 border border-platinum-200 dark:border-obsidian-500 text-platinum-600 dark:text-platinum-300 hover:bg-white dark:hover:bg-obsidian-200 shadow-sm active:shadow-inner transition-colors"
                    title={t.share}
                >
                    <Share2 size={18} />
                </button>
                {oscillators.length > 0 && (
                    <button 
                        onClick={handleDeleteAll}
                        className="p-3 rounded-xl bg-platinum-50 dark:bg-obsidian-300 border border-platinum-200 dark:border-obsidian-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm active:shadow-inner transition-colors"
                        title={t.deleteAll}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </div>

        {/* List of Oscillators */}
        <OscillatorList 
            oscillators={oscillators} 
            onUpdate={updateOscillator} 
            onRemove={removeOscillator}
            t={t}
        />

      </main>

      <AddToneModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleAddOscillators} 
        t={t}
      />
    </div>
  );
};

export default App;
