import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { ValorantAccount, ValorantRegion } from '../types';
import { DEFAULT_COOLDOWN_HOURS } from '../utils/time';
import { soundFX } from '../utils/audio';
import { Translations, Language } from '../utils/i18n';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<ValorantAccount, 'id'>, id?: string) => void;
  editingAccount?: ValorantAccount | null;
  existingPasswords?: string[];
  onOpenBulkModal?: () => void;
  t: Translations;
  language: Language;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
  existingPasswords = [],
  onOpenBulkModal,
  t,
  language,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<ValorantRegion>('NA');
  const [notes, setNotes] = useState('');
  const [currentLevel, setCurrentLevel] = useState<number>(20);
  const [cooldownDuration, setCooldownDuration] = useState<number>(DEFAULT_COOLDOWN_HOURS);
  const [startTimerNow, setStartTimerNow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setUsername(editingAccount.username);
      setPassword(editingAccount.password);
      setRegion(editingAccount.region);
      setNotes(editingAccount.notes || '');
      setCurrentLevel(editingAccount.currentLevel || 20);
      setCooldownDuration(editingAccount.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS);
      setStartTimerNow(false);
    } else {
      setName('');
      setUsername('');
      setPassword('');
      setRegion('NA');
      setNotes('');
      setCurrentLevel(20);
      setCooldownDuration(DEFAULT_COOLDOWN_HOURS);
      setStartTimerNow(false);
    }
    setErrors({});
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string } = {};

    if (!username.trim()) newErrors.username = t.usernameReq;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    soundFX.playClick();

    const now = new Date();
    let targetEndTime = editingAccount ? editingAccount.targetEndTime : null;
    let lastStartedAt = editingAccount ? editingAccount.lastStartedAt : null;

    if (startTimerNow) {
      const target = new Date(now.getTime() + cooldownDuration * 3600 * 1000);
      targetEndTime = target.toISOString();
      lastStartedAt = now.toISOString();
    }

    const finalName = name.trim() || username.trim();

    onSave(
      {
        name: finalName,
        username: username.trim(),
        password: password.trim(),
        region,
        notes: notes.trim(),
        targetEndTime,
        cooldownDurationHours: cooldownDuration,
        lastStartedAt,
        currentLevel: Number(currentLevel) || 20,
      },
      editingAccount?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0A1017] border border-[#1F3347] rounded-xl shadow-2xl overflow-hidden text-[#CAD6E2]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A2C3D] bg-[#0E1722]">
          <div className="flex items-center gap-2">
            <span className="text-[#FF4655] font-mono font-bold">//</span>
            <h2 className="text-base font-extrabold text-white tracking-wide uppercase font-sans">
              {editingAccount ? t.editAccount : t.createAccount}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider">
                Account Name / Nickname
              </label>
              <span className="text-[10px] text-[#59697A] font-mono">
                {language === 'en' ? '(Optional - defaults to username)' : '(اختياري - يملأ تلقائياً باليوزر)'}
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={username ? username : (language === 'en' ? 'e.g. Smurf / Main (or leave blank)' : 'اتركه فارغاً ليأخذ اليوزر تلقائياً')}
              className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white placeholder-[#475769] outline-none transition-colors"
            />
          </div>

          {/* Riot Username */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
              {t.username} <span className="text-[#FF4655]">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. reyna_ap_01#1234"
              className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white placeholder-[#475769] outline-none transition-colors font-mono"
            />
            {errors.username && <p className="text-xs text-[#FF4655] mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider">
                {t.password}
              </label>
              <div className="flex items-center gap-2">
                {onOpenBulkModal && !editingAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBulkModal();
                    }}
                    className="text-xs text-[#00F5A0] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {t.bulkAdd}?
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#8494A5] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Riot Account Password"
                className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white placeholder-[#475769] outline-none transition-colors font-mono"
              />
            </div>

            {/* Quick Fill from Previously Used / Shared Passwords */}
            {existingPasswords.length > 0 && !editingAccount && (
              <div className="mt-2 p-2.5 bg-[#070D14] border border-[#1C2C3D] rounded-lg">
                <span className="text-[11px] text-[#8494A5] block mb-1.5 font-medium">
                  🔑 {t.autoFillPass}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {existingPasswords.slice(0, 3).map((pwd, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPassword(pwd)}
                      className={`text-[11px] font-mono px-2 py-1 rounded transition-colors border cursor-pointer ${
                        password === pwd
                          ? 'bg-[#00F5A0]/20 border-[#00F5A0] text-[#00F5A0] font-bold'
                          : 'bg-[#101A24] border-[#1C2C3D] text-[#CAD6E2] hover:bg-[#162433] hover:text-white'
                      }`}
                    >
                      {pwd.length > 18 ? `${pwd.substring(0, 16)}...` : pwd}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Region & Cooldown Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
                {t.region}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as ValorantRegion)}
                className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white outline-none transition-colors cursor-pointer"
              >
                <option value="NA">NA (North America)</option>
                <option value="EU">EU (Europe)</option>
                <option value="AP">AP (Asia-Pacific)</option>
                <option value="KR">KR (Korea)</option>
                <option value="BR">BR (Brazil)</option>
                <option value="LATAM">LATAM</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider">
                  {t.durationHours}
                </label>
                <span className="text-[10px] font-mono text-[#00F5A0] font-bold">
                  {cooldownDuration === 19 ? '(Default 19h)' : `${cooldownDuration}h`}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  max="720"
                  value={cooldownDuration}
                  onChange={(e) => setCooldownDuration(parseFloat(e.target.value) || 19)}
                  placeholder="19"
                  className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white font-mono outline-none transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#59697A]">
                  hours
                </span>
              </div>
              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[19, 24, 12, 8].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCooldownDuration(h)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                      cooldownDuration === h
                        ? 'bg-[#FF4655]/20 border-[#FF4655] text-[#FF4655]'
                        : 'bg-[#0E1722] border-[#1C2C3D] text-[#8494A5] hover:text-white'
                    }`}
                  >
                    {h === 19 ? '19h (Default)' : `${h}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Account Level */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider">
                {t.level}
              </label>
              <span className={`text-[11px] font-mono font-bold ${currentLevel >= 20 ? 'text-[#00F5A0]' : 'text-[#FFB800]'}`}>
                {currentLevel >= 20 ? t.rankedReady : `${20 - currentLevel} ${t.levelsRemaining}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentLevel((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 bg-[#070D14] hover:bg-[#152332] border border-[#1C2C3D] rounded-lg text-base font-bold text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title="-1"
              >
                -
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3.5 py-2 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white font-mono font-bold text-center outline-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setCurrentLevel((prev) => prev + 1)}
                className="w-10 h-10 bg-[#070D14] hover:bg-[#152332] border border-[#1C2C3D] rounded-lg text-base font-bold text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title="+1"
              >
                +
              </button>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentLevel(1)}
                  className="px-2.5 py-2 bg-[#101A24] hover:bg-[#162433] border border-[#1C2C3D] text-xs font-mono rounded-lg text-[#8494A5] hover:text-white cursor-pointer"
                >
                  Lvl 1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentLevel(20)}
                  className="px-2.5 py-2 bg-[#00F5A0]/15 hover:bg-[#00F5A0]/25 border border-[#00F5A0]/40 text-xs font-mono font-bold rounded-lg text-[#00F5A0] cursor-pointer"
                >
                  Lvl 20
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#8494A5] uppercase tracking-wider mb-1">
              {t.notes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#070D14] border border-[#1C2C3D] focus:border-[#FF4655] rounded-lg text-sm text-white placeholder-[#475769] outline-none transition-colors"
            />
          </div>

          {/* Trigger Immediately Option */}
          {!editingAccount && (
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={startTimerNow}
                  onChange={(e) => setStartTimerNow(e.target.checked)}
                  className="mt-0.5 rounded bg-[#070D14] border-[#1C2C3D] text-[#FF4655] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#CAD6E2]">
                  {t.startTimerNow} ({cooldownDuration}h)
                </span>
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A2C3D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#8494A5] hover:text-white hover:bg-[#152332] rounded-lg transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold font-mono uppercase text-white bg-[#FF4655] hover:bg-[#E03444] rounded-lg transition-all shadow-[0_0_12px_rgba(255,70,85,0.35)] cursor-pointer active:scale-95"
            >
              {editingAccount ? t.saveChanges : t.createAccount}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
