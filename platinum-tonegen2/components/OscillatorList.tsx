import React from 'react';
import { OscillatorConfig } from '../types';
import { Trash2, Activity, Volume2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  oscillators: OscillatorConfig[];
  onUpdate: (id: string, updates: Partial<OscillatorConfig>) => void;
  onRemove: (id: string) => void;
  t: typeof TRANSLATIONS.en;
}

const OscillatorList: React.FC<Props> = ({ oscillators, onUpdate, onRemove, t }) => {
  if (oscillators.length === 0) {
    return (
      <div className="text-center py-10 text-platinum-400 dark:text-platinum-600 font-light italic transition-colors">
        {t.noTones}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {oscillators.map((osc) => (
        <div
          key={osc.id}
          className="bg-white/80 dark:bg-obsidian-300/80 backdrop-blur-sm rounded-xl p-4 shadow-metal dark:shadow-obsidian-metal border border-white dark:border-obsidian-400 flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-lg dark:text-platinum-100"
        >
          {/* Frequency Control & Mobile Delete Button */}
          <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
            <div className="w-10 h-10 rounded-full bg-platinum-100 dark:bg-obsidian-200 flex items-center justify-center text-platinum-600 dark:text-platinum-300 shadow-inner">
               <Activity size={18} />
            </div>
            <div className="flex flex-col flex-1">
                <label className="text-xs text-platinum-500 dark:text-platinum-400 font-semibold uppercase tracking-wide">{t.frequency} ({t.hz})</label>
                <div className="flex items-center gap-2">
                    <input
                    type="number"
                    value={osc.freq}
                    onChange={(e) => onUpdate(osc.id, { freq: Number(e.target.value) })}
                    className="w-full bg-transparent border-b border-platinum-300 dark:border-obsidian-500 focus:border-platinum-600 dark:focus:border-platinum-300 outline-none text-platinum-800 dark:text-platinum-100 font-mono text-lg transition-colors"
                    />
                    <span className="text-xs text-platinum-400">{t.hz}</span>
                </div>
            </div>
            
            {/* Mobile Delete Button (Visible only on small screens) */}
            <button
              onClick={() => onRemove(osc.id)}
              className="md:hidden p-2 rounded-full text-platinum-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title={t.remove}
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Waveform Select */}
          <div className="flex flex-col w-full md:w-32">
             <label className="text-xs text-platinum-500 dark:text-platinum-400 font-semibold uppercase tracking-wide">{t.waveform}</label>
             <select
                value={osc.type}
                onChange={(e) => onUpdate(osc.id, { type: e.target.value as any })}
                className="bg-transparent border-b border-platinum-300 dark:border-obsidian-500 focus:border-platinum-600 dark:focus:border-platinum-300 outline-none text-platinum-800 dark:text-platinum-100 text-sm py-1 cursor-pointer transition-colors"
             >
                 <option value="sine" className="dark:bg-obsidian-300">Sine</option>
                 <option value="square" className="dark:bg-obsidian-300">Square</option>
                 <option value="sawtooth" className="dark:bg-obsidian-300">Sawtooth</option>
                 <option value="triangle" className="dark:bg-obsidian-300">Triangle</option>
             </select>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 w-full md:w-48">
             <Volume2 size={16} className="text-platinum-400" />
             <div className="flex flex-col w-full">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={osc.vol}
                    onChange={(e) => onUpdate(osc.id, { vol: Number(e.target.value) })}
                    className="w-full h-1.5 bg-platinum-200 dark:bg-obsidian-500 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-platinum-400 mt-1">
                    <span>{t.vol}</span>
                    <span>{Math.round(osc.vol * 100)}%</span>
                </div>
             </div>
          </div>

          {/* Desktop Remove Button (Hidden on mobile) */}
          <button
            onClick={() => onRemove(osc.id)}
            className="hidden md:block p-2 rounded-full text-platinum-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title={t.remove}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default OscillatorList;
