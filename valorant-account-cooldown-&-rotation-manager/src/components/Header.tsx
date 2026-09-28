import React from 'react';
import { Plus, Volume2, VolumeX, Layers, ShieldCheck, Trash2 } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { Translations } from '../utils/i18n';
import { ValorantLogo } from './ValorantLogo';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  watermarkName: string;
  t: Translations;
  onOpenDeleteAll: () => void;
  hasAccounts: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenBulkModal,
  soundEnabled,
  onToggleSound,
  watermarkName,
  t,
  onOpenDeleteAll,
  hasAccounts,
}) => {
  return (
    <header className="border-b border-[#1E2D3D] bg-[#0A1017]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Zone with Official Valorant Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0F1923] border border-[#263C52] flex items-center justify-center p-1.5 shadow-[0_0_14px_rgba(255,70,85,0.35)] select-none group">
            <ValorantLogo size={24} className="group-hover:scale-110 transition-transform duration-200" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
            <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-sans">
              VALO.LEVELING
            </span>
            <span className="text-[11px] font-mono text-[#8B9DAE] hidden md:inline tracking-wider">
              // {t.appSubtitle}
            </span>
          </div>

          {/* Owner Watermark Badge */}
          <div
            className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101A24] border border-[#203244] text-xs select-none shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F5A0]" />
            <span className="font-mono font-black text-white tracking-widest uppercase text-[11px]">
              {watermarkName}
            </span>
            <span className="text-[9px] font-mono font-black text-[#FF4655] px-1 py-0.2 rounded bg-[#FF4655]/15 border border-[#FF4655]/30">
              {t.privateEdition}
            </span>
          </div>
        </div>

        {/* Primary Action Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Delete All Option (shown when accounts exist) */}
          {hasAccounts && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onOpenDeleteAll();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1F1115] hover:bg-[#FF4655]/20 border border-[#4A2027] hover:border-[#FF4655]/60 text-[#FF4655] rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
              title={t.deleteAll}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.deleteAll}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-[#101A24] border-[#203244] text-[#ECE8E1] hover:text-white hover:border-[#00F5A0]/40'
                : 'bg-[#080D12] border-[#16222E] text-[#526373]'
            }`}
            title={soundEnabled ? t.soundOn : t.soundOff}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00F5A0]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Bulk Add Button (Shared Password) */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenBulkModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#09221B] hover:bg-[#0E2F26] border border-[#00F5A0]/40 text-[#00F5A0] hover:text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,245,160,0.15)] whitespace-nowrap cursor-pointer"
            title={t.bulkAddSubtitle}
          >
            <Layers className="w-3.5 h-3.5 text-[#00F5A0]" />
            <span className="hidden sm:inline">{t.bulkAdd}</span>
            <span className="sm:hidden">Bulk</span>
          </button>

          {/* Add Account Button */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenAddModal();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#FF4655] hover:bg-[#E03444] text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_14px_rgba(255,70,85,0.35)] whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addAccount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
