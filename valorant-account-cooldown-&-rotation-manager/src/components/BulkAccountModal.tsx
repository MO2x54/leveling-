import React, { useState } from 'react';
import { X, Layers, AlertCircle, Info } from 'lucide-react';
import { ValorantAccount, ValorantRegion } from '../types';
import { DEFAULT_COOLDOWN_HOURS } from '../utils/time';
import { soundFX } from '../utils/audio';
import { Translations, Language } from '../utils/i18n';

interface BulkAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBulkAccounts: (accounts: Omit<ValorantAccount, 'id'>[]) => void;
  existingSharedPassword?: string;
  t: Translations;
  language: Language;
}

export const BulkAccountModal: React.FC<BulkAccountModalProps> = ({
  isOpen,
  onClose,
  onAddBulkAccounts,
  existingSharedPassword = '',
  t,
  language,
}) => {
  const [sharedPassword, setSharedPassword] = useState(existingSharedPassword);
  const [usernamesText, setUsernamesText] = useState('');
  const [namePrefix, setNamePrefix] = useState('Smurf');
  const [region, setRegion] = useState<ValorantRegion>('NA');
  const [startingLevel, setStartingLevel] = useState<number>(20);
  const [startTimerNow, setStartTimerNow] = useState(false);
  const [cooldownDuration, setCooldownDuration] = useState<number>(DEFAULT_COOLDOWN_HOURS);
  const [sharedNotes, setSharedNotes] = useState('Daily missions rotation');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedUsernames = usernamesText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedUsernames.length === 0) {
      setError(language === 'en' ? 'Please enter at least one username.' : 'يرجى إدخال اسم مستخدم واحد على الأقل.');
      return;
    }

    if (!sharedPassword.trim()) {
      setError(language === 'en' ? 'Please provide the shared password.' : 'يرجى إدخال كلمة المرور الموحدة.');
      return;
    }

    soundFX.playClick();
    const now = new Date();
    const nowIso = now.toISOString();
    const targetEndTime = startTimerNow
      ? new Date(now.getTime() + cooldownDuration * 3600 * 1000).toISOString()
      : null;

    const newAccounts: Omit<ValorantAccount, 'id'>[] = parsedUsernames.map((rawUser, index) => {
      let accName = '';
      let username = rawUser;

      if (rawUser.includes(':')) {
        const parts = rawUser.split(':');
        accName = parts[0].trim();
        username = parts[1].trim();
      } else if (rawUser.includes(',')) {
        const parts = rawUser.split(',');
        accName = parts[0].trim();
        username = parts[1].trim();
      } else {
        const cleanUser = rawUser.replace(/#.*$/, '');
        accName = namePrefix.trim() ? `${namePrefix.trim()} #${index + 1} (${cleanUser})` : cleanUser;
      }

      return {
        name: accName || username,
        username,
        password: sharedPassword.trim(),
        region,
        notes: sharedNotes.trim(),
        targetEndTime,
        cooldownDurationHours: cooldownDuration,
        lastStartedAt: startTimerNow ? nowIso : null,
        currentLevel: Number(startingLevel) || 20,
      };
    });

    onAddBulkAccounts(newAccounts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0A1017] border border-[#1F3347] rounded-xl shadow-2xl overflow-hidden text-[#CAD6E2]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A2C3D] bg-[#0E1722]">
          <div className="flex items-center gap-2">
            <span className="text-[#00F5A0] font-mono font-bold">// BATCH IMPORT</span>
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase font-sans">
              {t.bulkAdd}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8494A5] hover:text-white hover:bg-[#152332] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FF4655]/10 border border-[#FF4655]/40 rounded-lg flex items-center gap-2 text-[#FF4655]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shared Password Field */}
          <div>
            <label className="block font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
              {t.password} (Shared Password) <span className="text-[#FF4655]">*</span>
            </label>
            <input
              type="text"
              value={sharedPassword}
              onChange={(e) => {
                setSharedPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. SecretP@ss2026!"
              className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-sm text-white placeholder-[#475769] font-mono outline-none transition-colors"
            />
          </div>

          {/* Usernames list textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono font-bold text-[#8494A5] uppercase tracking-wider">
                {t.bulkUsernamesLabel} <span className="text-[#FF4655]">*</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-[#00F5A0]">
                {parsedUsernames.length} {language === 'en' ? 'accounts detected' : 'حساب تم التعرف عليه'}
              </span>
            </div>
            <textarea
              rows={5}
              value={usernamesText}
              onChange={(e) => {
                setUsernamesText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t.bulkUsernamesPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-xs font-mono text-white placeholder-[#475769] outline-none transition-colors leading-relaxed"
            />
            <p className="text-[11px] text-[#59697A] mt-1">
              {t.bulkNotice}
            </p>
          </div>

          {/* Prefix, Region, Level & Cooldown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
                {t.prefixName}
              </label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                placeholder="e.g. Smurf"
                className="w-full px-3 py-2 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-xs text-white placeholder-[#475769] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
                {t.region}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as ValorantRegion)}
                className="w-full px-3 py-2 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-xs text-white outline-none transition-colors cursor-pointer"
              >
                <option value="NA">NA</option>
                <option value="EU">EU</option>
                <option value="AP">AP</option>
                <option value="KR">KR</option>
                <option value="BR">BR</option>
                <option value="LATAM">LATAM</option>
              </select>
            </div>

            <div>
              <label className="block font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
                {t.startingLevel}
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={startingLevel}
                onChange={(e) => setStartingLevel(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-2 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-xs text-white font-mono font-bold text-center outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
                {t.durationHours}
              </label>
              <input
                type="number"
                step="any"
                min={0.1}
                max={720}
                value={cooldownDuration}
                onChange={(e) => setCooldownDuration(parseFloat(e.target.value) || 19)}
                className="w-full px-3 py-2 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-xs text-white font-mono font-bold text-center outline-none transition-colors"
                placeholder="19"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
              {t.sharedNotes}
            </label>
            <input
              type="text"
              value={sharedNotes}
              onChange={(e) => setSharedNotes(e.target.value)}
              placeholder="e.g. Daily missions priority / XP rotation"
              className="w-full px-3 py-2 bg-[#070D14] border border-[#1C2C3D] focus:border-[#00F5A0] rounded-lg text-xs text-white placeholder-[#475769] outline-none transition-colors"
            />
          </div>

          {/* Immediate Cooldown Start Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startTimerNow}
                onChange={(e) => setStartTimerNow(e.target.checked)}
                className="mt-0.5 rounded bg-[#070D14] border-[#1C2C3D] text-[#00F5A0] focus:ring-0 cursor-pointer"
              />
              <span className="text-[#CAD6E2]">
                {t.startTimerNow} ({cooldownDuration}h)
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A2C3D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-bold text-[#8494A5] hover:text-white hover:bg-[#152332] rounded-lg transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-black font-mono uppercase text-black bg-[#00F5A0] hover:bg-[#00D98E] rounded-lg transition-all shadow-[0_0_14px_rgba(0,245,160,0.35)] cursor-pointer active:scale-95"
            >
              {t.bulkSubmitBtn} ({parsedUsernames.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
