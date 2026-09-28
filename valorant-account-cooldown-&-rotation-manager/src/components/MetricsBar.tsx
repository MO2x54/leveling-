import React from 'react';
import { ArrowUpDown, Clock, CheckCircle2 } from 'lucide-react';
import { ValorantAccount } from '../types';
import { calculateTimeInfo } from '../utils/time';
import { soundFX } from '../utils/audio';
import { Translations } from '../utils/i18n';

interface MetricsBarProps {
  accounts: ValorantAccount[];
  nowMs: number;
  autoSort: boolean;
  onToggleAutoSort: () => void;
  t: Translations;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  accounts,
  nowMs,
  autoSort,
  onToggleAutoSort,
  t,
}) => {
  let readyCount = 0;
  let cooldownCount = 0;
  let soonestSeconds: number | null = null;

  accounts.forEach((acc) => {
    const info = calculateTimeInfo(acc, nowMs);
    if (info.isReady) {
      readyCount += 1;
    } else {
      cooldownCount += 1;
      if (soonestSeconds === null || info.remainingSeconds < soonestSeconds) {
        soonestSeconds = info.remainingSeconds;
      }
    }
  });

  const formatNextTime = () => {
    if (soonestSeconds === null) {
      return accounts.length > 0 ? (t.readyToPlay) : '--';
    }
    const h = Math.floor(soonestSeconds / 3600);
    const m = Math.floor((soonestSeconds % 3600) / 60);
    const s = Math.floor(soonestSeconds % 60);
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="border-b border-[#1A2634] bg-[#0B1118]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Metric Counters */}
        <div className="flex items-center gap-3 sm:gap-6 text-xs flex-wrap font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F1822] border border-[#1C2C3D]">
            <span className="text-[#8494A5] text-[11px] uppercase tracking-wider">{t.allAccounts}</span>
            <span className="text-white font-extrabold tabular-nums px-1.5 py-0.2 rounded bg-[#162536] text-[11px]">{accounts.length}</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#09221B] border border-[#00F5A0]/30 shadow-[0_0_8px_rgba(0,245,160,0.1)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5A0]" />
            <span className="text-[#A2D8C3] text-[11px] uppercase tracking-wider">{t.readyToPlay}</span>
            <span className="text-[#00F5A0] font-black tabular-nums">{readyCount}</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#211B11] border border-[#FFB800]/30">
            <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
            <span className="text-[#DAC292] text-[11px] uppercase tracking-wider">{t.onCooldown}</span>
            <span className="text-[#FFB800] font-black tabular-nums">{cooldownCount}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F1822] border border-[#1C2C3D]">
            <span className="text-[#8494A5] text-[11px] uppercase tracking-wider">NEXT READY</span>
            <span className="text-[#ECE8E1] font-bold tabular-nums">{formatNextTime()}</span>
          </div>
        </div>

        {/* Tactical Controls: Auto-Sort Switch */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleAutoSort();
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
              autoSort
                ? 'bg-[#0E2820] border-[#00F5A0]/50 text-[#00F5A0] shadow-[0_0_8px_rgba(0,245,160,0.15)]'
                : 'bg-[#0F1822] border-[#203244] text-[#8494A5] hover:text-white'
            }`}
            title="Auto-Sort puts accounts in Ready state at the very top"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Auto-Sort Ready</span>
          </button>
        </div>
      </div>
    </div>
  );
};
