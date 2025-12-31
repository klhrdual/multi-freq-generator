import React, { useState, useEffect } from 'react';
import { X, Plus, Music, ListPlus, Sliders } from 'lucide-react';
import { OscillatorConfig, Waveform, InstrumentPreset } from '../types';
import { NOTES, INSTRUMENT_PRESETS, TRANSLATIONS } from '../constants';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (oscillators: OscillatorConfig[]) => void;
  t: typeof TRANSLATIONS.en;
}

const AddToneModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, t }) => {
  // --- Area 1: Base Configuration ---
  const [baseFreq, setBaseFreq] = useState<number>(440);
  const [baseWave, setBaseWave] = useState<Waveform>('sine');
  const [baseVol, setBaseVol] = useState<number>(0.5);
  const [selectedNote, setSelectedNote] = useState<string>('A4');
  
  // --- Area 2: Harmonics Generator ---
  const [selectedInstrument, setSelectedInstrument] = useState<string>('Piano');
  
  // --- Area 3: Staging (About to send) ---
  const [stagedOscillators, setStagedOscillators] = useState<OscillatorConfig[]>([]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStagedOscillators([]);
      setBaseFreq(440);
      setSelectedNote('A4');
      setBaseWave('sine');
    }
  }, [isOpen]);

  // Handle Note Selection
  const handleNoteChange = (note: string) => {
    setSelectedNote(note);
    if (NOTES[note]) {
      setBaseFreq(NOTES[note]);
    }
  };

  const handleFreqChange = (val: number) => {
    setBaseFreq(val);
    setSelectedNote('Custom');
  };

  // Add Single Base Tone to Stage
  const addBaseToStage = () => {
    const newOsc: OscillatorConfig = {
      id: generateId(),
      freq: baseFreq,
      type: baseWave,
      vol: baseVol,
      active: true,
    };
    setStagedOscillators((prev) => [...prev, newOsc]);
  };

  // Generate Harmonics Logic
  const generateHarmonics = () => {
    const preset = INSTRUMENT_PRESETS.find(p => p.name === selectedInstrument);
    if (!preset) return;

    const newOscillators: OscillatorConfig[] = [];
    
    // Waveform mapping
    const targetWaveType: Waveform = 
        ['Square Wave', 'Sawtooth', 'Triangle'].includes(preset.name) 
        ? (preset.name.toLowerCase().replace(' wave', '') as Waveform) 
        : 'sine';

    preset.harmonics.forEach((percentage, index) => {
      const harmonicNumber = index + 1;
      if (percentage > 0) {
        newOscillators.push({
          id: generateId(),
          freq: Number((baseFreq * harmonicNumber).toFixed(2)),
          type: targetWaveType,
          vol: Number((baseVol * (percentage / 100)).toFixed(2)),
          active: true,
        });
      }
    });

    setStagedOscillators(newOscillators);
  };

  // Remove from stage
  const removeFromStage = (id: string) => {
    setStagedOscillators((prev) => prev.filter(o => o.id !== id));
  };

  // Update Item in Stage
  const updateStagedItem = (id: string, updates: Partial<OscillatorConfig>) => {
    setStagedOscillators(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-obsidian-300 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-platinum-300 dark:border-obsidian-500 transition-colors">
        
        {/* Header */}
        <div className="p-4 border-b border-platinum-200 dark:border-obsidian-400 flex justify-between items-center bg-gradient-to-r from-platinum-50 to-white dark:from-obsidian-200 dark:to-obsidian-300">
          <h2 className="text-xl font-light text-platinum-800 dark:text-platinum-100 tracking-wide flex items-center gap-2">
            <ListPlus className="text-platinum-500 dark:text-platinum-300" />
            {t.addTone}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-platinum-100 dark:hover:bg-obsidian-100 transition-colors">
            <X className="text-platinum-500 dark:text-platinum-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 dark:text-platinum-200">
          
          {/* Section 1: Base Configuration */}
          <div className="bg-platinum-50 dark:bg-obsidian-200 p-5 rounded-xl border border-platinum-200 dark:border-obsidian-400 shadow-inner">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-platinum-500 dark:text-platinum-400 uppercase tracking-wider flex items-center gap-2">
                    <Music size={16} /> {t.baseFreq}
                 </h3>
                 <span className="text-xs text-platinum-400">{t.step1}</span>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="col-span-1">
                     <label className="text-xs text-platinum-500 dark:text-platinum-400 block mb-1">Note</label>
                     <select 
                        value={selectedNote} 
                        onChange={(e) => handleNoteChange(e.target.value)}
                        className="w-full bg-white dark:bg-obsidian-400 border border-platinum-300 dark:border-obsidian-500 rounded p-2 text-sm outline-none focus:border-platinum-500 dark:text-platinum-200"
                     >
                        <option value="Custom">{t.custom}</option>
                        {Object.keys(NOTES).map(n => <option key={n} value={n}>{n}</option>)}
                     </select>
                 </div>
                 <div className="col-span-1">
                     <label className="text-xs text-platinum-500 dark:text-platinum-400 block mb-1">{t.frequency}</label>
                     <input 
                        type="number" 
                        value={baseFreq} 
                        onChange={(e) => handleFreqChange(Number(e.target.value))}
                        className="w-full bg-white dark:bg-obsidian-400 border border-platinum-300 dark:border-obsidian-500 rounded p-2 text-sm outline-none focus:border-platinum-500 dark:text-platinum-200"
                     />
                 </div>
                 <div className="col-span-1">
                     <label className="text-xs text-platinum-500 dark:text-platinum-400 block mb-1">{t.waveform}</label>
                     <select 
                        value={baseWave} 
                        onChange={(e) => setBaseWave(e.target.value as Waveform)}
                        className="w-full bg-white dark:bg-obsidian-400 border border-platinum-300 dark:border-obsidian-500 rounded p-2 text-sm outline-none focus:border-platinum-500 dark:text-platinum-200"
                     >
                        <option value="sine">Sine</option>
                        <option value="square">Square</option>
                        <option value="sawtooth">Sawtooth</option>
                        <option value="triangle">Triangle</option>
                     </select>
                 </div>
                 <div className="col-span-1">
                     <label className="text-xs text-platinum-500 dark:text-platinum-400 block mb-1">{t.volume}</label>
                     <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={baseVol} 
                        onChange={(e) => setBaseVol(Number(e.target.value))}
                        className="w-full mt-2"
                     />
                 </div>
             </div>
             <button 
                onClick={addBaseToStage}
                className="mt-4 w-full py-2 border border-platinum-400 dark:border-obsidian-500 text-platinum-600 dark:text-platinum-300 rounded-lg hover:bg-platinum-200 dark:hover:bg-obsidian-100 transition-colors text-sm font-semibold shadow-sm"
             >
                Add Single Tone to Stage
             </button>
          </div>

          {/* Section 2: Instrument / Harmonics */}
          <div className="bg-platinum-50 dark:bg-obsidian-200 p-5 rounded-xl border border-platinum-200 dark:border-obsidian-400 shadow-inner relative overflow-hidden">
             {/* Decorative sheen */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 dark:from-white/5 to-transparent pointer-events-none rounded-bl-full"></div>

             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-platinum-500 dark:text-platinum-400 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={16} /> {t.instrument}
                 </h3>
                 <span className="text-xs text-platinum-400">{t.step2}</span>
             </div>
             
             <p className="text-xs text-platinum-400 mb-3">
                Generates up to 10 harmonics based on the Base Frequency above.
             </p>

             <div className="flex gap-4">
                <select 
                    value={selectedInstrument}
                    onChange={(e) => setSelectedInstrument(e.target.value)}
                    className="flex-1 bg-white dark:bg-obsidian-400 border border-platinum-300 dark:border-obsidian-500 rounded-lg p-2 text-sm outline-none shadow-sm dark:text-platinum-200"
                >
                    {INSTRUMENT_PRESETS.map(inst => (
                        <option key={inst.name} value={inst.name}>{inst.name}</option>
                    ))}
                </select>
                <button 
                    onClick={generateHarmonics}
                    className="px-6 py-2 bg-gradient-to-b from-platinum-600 to-platinum-800 dark:from-platinum-700 dark:to-obsidian-800 text-white rounded-lg shadow-md hover:shadow-lg active:translate-y-px transition-all text-sm font-medium"
                >
                    {t.generate}
                </button>
             </div>
          </div>

          {/* Section 3: Staging Area */}
          <div className="border-t border-platinum-200 dark:border-obsidian-400 pt-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-platinum-600 dark:text-platinum-300 uppercase tracking-wider">
                    {t.readyToAdd} ({stagedOscillators.length})
                 </h3>
                 {stagedOscillators.length > 0 && (
                     <button onClick={() => setStagedOscillators([])} className="text-xs text-red-400 hover:text-red-600 underline">{t.clear}</button>
                 )}
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {stagedOscillators.length === 0 && (
                      <div className="text-center py-8 text-platinum-300 dark:text-obsidian-500 italic text-sm border-2 border-dashed border-platinum-200 dark:border-obsidian-400 rounded-lg">
                          No tones generated yet.
                      </div>
                  )}
                  {stagedOscillators.map((osc) => (
                      <div key={osc.id} className="flex items-center gap-2 bg-white dark:bg-obsidian-400 p-2 rounded border border-platinum-200 dark:border-obsidian-500 text-sm">
                          <div className="w-20 font-mono text-platinum-700 dark:text-platinum-300">{osc.freq} {t.hz}</div>
                          <div className="w-20 text-xs text-platinum-500 dark:text-platinum-400">{osc.type}</div>
                          <input 
                            type="range" min="0" max="1" step="0.01" value={osc.vol}
                            onChange={(e) => updateStagedItem(osc.id, { vol: Number(e.target.value) })}
                            className="flex-1 h-1"
                          />
                          <span className="text-xs w-10 text-right text-platinum-400">{Math.round(osc.vol * 100)}%</span>
                          <button onClick={() => removeFromStage(osc.id)} className="text-platinum-400 hover:text-red-500">
                              <X size={14} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-platinum-50 dark:bg-obsidian-200 border-t border-platinum-200 dark:border-obsidian-400 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-platinum-600 dark:text-platinum-400 font-medium hover:bg-platinum-200 dark:hover:bg-obsidian-100 transition-colors"
            >
                {t.cancel}
            </button>
            <button 
                onClick={() => { onConfirm(stagedOscillators); onClose(); }}
                disabled={stagedOscillators.length === 0}
                className="px-6 py-2 rounded-lg bg-gradient-to-b from-platinum-500 to-platinum-700 dark:from-platinum-600 dark:to-obsidian-800 text-white font-medium shadow-metal active:shadow-metal-active disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {t.confirmAdd}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AddToneModal;
