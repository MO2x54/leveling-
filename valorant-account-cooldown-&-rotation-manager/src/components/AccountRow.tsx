import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Play,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  FastForward,
  Shield
} from 'lucide-react';
import { ValorantAccount, AccountTimeInfo } from '../types';
import { calculateTimeInfo, formatTargetTime, DEFAULT_COOLDOWN_HOURS } from '../utils/time';
import { soundFX } from '../utils/audio';
import { Translations, Language } from '../utils/i18n';

interface AccountRowProps {
  account: ValorantAccount;
  nowMs: number;
  onStartCooldown: (accountId: string, hours?: number) => void;
  onMarkReady: (accountId: string) => void;
  onResetTimer: (accountId: string) => void;
  onEdit: (account: ValorantAccount) => void;
  onDelete: (accountId: string) => void;
  onUpdateLevel?: (accountId: string, newLevel: number) => void;
  t: Translations;
  language: Language;
}

export const AccountRow: React.FC<AccountRowProps> = ({
  account,
  nowMs,
  onStartCooldown,
  onMarkReady,
  onResetTimer,
  onEdit,
  onDelete,
  onUpdateLevel,
  t,
  language,
}) => {
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const timeInfo: AccountTimeInfo = calculateTimeInfo(account, nowMs);
  const { isReady, formattedStr, progressPercent, targetDate } = timeInfo;

  const handleCopyUsername = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCopy();
    await navigator.clipboard.writeText(account.username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  const handleCopyPassword = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCopy();
    await navigator.clipboard.writeText(account.password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleStartCooldownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playStartCooldown();
    onStartCooldown(account.id, account.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS);
  };

  const handleToggleCheckmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReady) {
      soundFX.playStartCooldown();
      onStartCooldown(account.id, account.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS);
    } else {
      soundFX.playReadyChime();
      onMarkReady(account.id);
    }
  };

  const currentLvl = account.currentLevel || 20;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 ${menuOpen ? 'z-40' : 'z-10'} ${
        isReady
          ? 'bg-[#0E1722]/90 border-[#1B3246] hover:border-[#00F5A0]/60 shadow-[0_4px_20px_rgba(0,245,160,0.06)]'
          : 'bg-[#0A1017]/90 border-[#162433] hover:border-[#283E54]'
      }`}
    >
      {/* Ready Left Indicator Glow */}
      {isReady ? (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00F5A0] shadow-[0_0_12px_#00F5A0] rounded-l-xl" />
      ) : (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFB800]/40 rounded-l-xl" />
      )}

      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Section: Checkbox Trigger + Account Credentials */}
        <div className="flex-1 min-w-0 flex items-start sm:items-center gap-3.5">
          {/* Tactical Checkbox Button to Start / Stop Countdown */}
          <button
            type="button"
            onClick={handleToggleCheckmark}
            title={
              isReady
                ? (language === 'en'
                    ? `Click (✔) to start ${account.cooldownDurationHours || 19}-hour cooldown now`
                    : `اضغط (✔) لبدء العد التنازلي لـ ${account.cooldownDurationHours || 19} ساعة فوراً`)
                : (language === 'en' ? 'Cooldown active. Click to reset to Ready' : 'العد شغال حالياً. اضغط لإعادته جاهز للعب')
            }
            className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer select-none group/chk relative active:scale-95 ${
              isReady
                ? 'border-[#263E52] hover:border-[#00F5A0] bg-[#070D14] hover:bg-[#00F5A0]/10 text-transparent hover:text-[#00F5A0]'
                : 'border-[#00F5A0] bg-[#00F5A0]/20 text-[#00F5A0] shadow-[0_0_16px_rgba(0,245,160,0.4)]'
            }`}
          >
            <Check
              className={`w-5 h-5 transition-all duration-200 ${
                isReady
                  ? 'opacity-0 group-hover/chk:opacity-100 scale-75 group-hover/chk:scale-100 stroke-[2.5]'
                  : 'opacity-100 scale-110 stroke-[3]'
              }`}
            />
          </button>

          {/* Account Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-extrabold text-white tracking-tight truncate">
                {account.name}
              </h3>

              {/* Region Tag */}
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#070D14] text-[#8494A5] border border-[#1C2C3D]">
                {account.region}
              </span>

              {/* Interactive Manual Level Controller */}
              <div
                className="flex items-center bg-[#070D14] border border-[#1C2C3D] hover:border-[#38516B] rounded px-1.5 py-0.5 text-xs font-mono transition-colors shadow-inner"
                title={language === 'en' ? 'Change account level manually (+ / - or click number)' : 'تعديل ليفل الحساب يدوياً (+ أو - أو اضغط الرقم)'}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentLvl > 1 && onUpdateLevel) {
                      soundFX.playClick();
                      onUpdateLevel(account.id, currentLvl - 1);
                    }
                  }}
                  className="text-[#8494A5] hover:text-[#FF4655] px-1 hover:bg-[#121E2B] rounded cursor-pointer font-bold select-none text-xs transition-colors"
                  title="-1"
                >
                  -
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const promptMsg = language === 'en'
                      ? `Enter manual level for "${account.name}":`
                      : `تغيير ليفل حساب "${account.name}" يدوياً:`;
                    const res = prompt(promptMsg, String(currentLvl));
                    if (res !== null) {
                      const parsed = parseInt(res, 10);
                      if (!isNaN(parsed) && parsed >= 1 && parsed <= 9999 && onUpdateLevel) {
                        soundFX.playClick();
                        onUpdateLevel(account.id, parsed);
                      }
                    }
                  }}
                  className={`font-black px-1.5 transition-colors cursor-pointer select-none ${
                    currentLvl >= 20
                      ? 'text-[#00F5A0] hover:text-white'
                      : 'text-[#FFB800] hover:text-white'
                  }`}
                  title={language === 'en' ? 'Click to type exact level' : 'اضغط لكتابة الليفل المطلوب'}
                >
                  Lvl {currentLvl}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateLevel) {
                      soundFX.playClick();
                      onUpdateLevel(account.id, currentLvl + 1);
                    }
                  }}
                  className="text-[#8494A5] hover:text-[#00F5A0] px-1 hover:bg-[#121E2B] rounded cursor-pointer font-bold select-none text-xs transition-colors"
                  title="+1"
                >
                  +
                </button>
              </div>

              {currentLvl >= 20 ? (
                <span className="text-[10px] font-mono font-bold text-[#00F5A0] bg-[#00F5A0]/10 border border-[#00F5A0]/30 px-2 py-0.5 rounded-full hidden sm:inline shadow-[0_0_8px_rgba(0,245,160,0.15)]">
                  {t.rankedReady}
                </span>
              ) : (
                <span className="text-[10px] font-mono font-medium text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/25 px-2 py-0.5 rounded-full hidden sm:inline">
                  {20 - currentLvl} {t.levelsRemaining}
                </span>
              )}
            </div>

            {/* Credentials Bar & Notes */}
            <div className="mt-1.5 flex items-center gap-3 text-xs text-[#8494A5] flex-wrap">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[#59697A]">{t.username}:</span>
                <span className="text-white font-semibold select-all bg-[#070D14] px-1.5 py-0.5 rounded border border-[#162433]">{account.username}</span>
              </div>

              <span className="text-[#203040]">·</span>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[#59697A]">{t.password}:</span>
                <span className="text-[#CAD6E2] select-all bg-[#070D14] px-1.5 py-0.5 rounded border border-[#162433]">
                  {showPass ? account.password : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[#8494A5] hover:text-white p-0.5 transition-colors cursor-pointer"
                  title={showPass ? 'Hide' : 'Show'}
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {account.notes && (
                <>
                  <span className="text-[#203040]">·</span>
                  <span className="text-[#8494A5] truncate max-w-xs">{account.notes}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section: Live Dynamic Timer & Progress */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {isReady ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0]" />
                  <span className="text-xs font-black text-[#00F5A0] tracking-wider font-mono">
                    {t.readyStatus}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-[#FFB800] animate-pulse" />
                  <span className="text-xs font-black font-mono text-[#FFB800] tracking-wider tabular-nums">
                    {formattedStr}
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] font-mono text-[#59697A] tabular-nums">
              {isReady ? `${account.cooldownDurationHours || 19}h Ready` : `Unlocks ${formatTargetTime(targetDate)}`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-[#070D14] rounded-full overflow-hidden border border-[#1C2C3D]">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isReady
                  ? 'bg-[#00F5A0] shadow-[0_0_8px_#00F5A0]'
                  : 'bg-gradient-to-r from-[#FFB800] to-[#FF4655]'
              }`}
              style={{ width: `${Math.round(progressPercent * 100)}%` }}
            />
          </div>
        </div>

        {/* Right Section: Tactical Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Start / Reset Cooldown Button */}
          <button
            onClick={handleStartCooldownClick}
            className={`px-3.5 py-2 rounded-lg text-xs font-black font-mono flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap cursor-pointer active:scale-95 ${
              isReady
                ? 'bg-[#FF4655] hover:bg-[#E03444] text-white shadow-[0_0_12px_rgba(255,70,85,0.35)]'
                : 'bg-[#152332] hover:bg-[#1E3042] text-[#CAD6E2] border border-[#263C50]'
            }`}
            title={`Start or reset ${account.cooldownDurationHours || 19}-hour cooldown timer`}
          >
            {isReady ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {language === 'en'
                    ? `START ${account.cooldownDurationHours || 19}H`
                    : `بدء ${account.cooldownDurationHours || 19} س`}
                </span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                {t.resetTimer}
              </>
            )}
          </button>

          {/* Quick Copy Username */}
          <button
            onClick={handleCopyUsername}
            className={`px-2.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
              copiedUser
                ? 'bg-[#00F5A0]/15 border-[#00F5A0] text-[#00F5A0]'
                : 'bg-[#0E1722] border-[#1C2C3D] hover:bg-[#152332] text-[#CAD6E2]'
            }`}
            title={t.copyUser}
          >
            {copiedUser ? <Check className="w-3.5 h-3.5 text-[#00F5A0]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedUser ? t.copied : 'USER'}</span>
          </button>

          {/* Quick Copy Password */}
          <button
            onClick={handleCopyPassword}
            className={`px-2.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
              copiedPass
                ? 'bg-[#00F5A0]/15 border-[#00F5A0] text-[#00F5A0]'
                : 'bg-[#0E1722] border-[#1C2C3D] hover:bg-[#152332] text-[#CAD6E2]'
            }`}
            title={t.copyPass}
          >
            {copiedPass ? <Check className="w-3.5 h-3.5 text-[#00F5A0]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedPass ? t.copied : 'PASS'}</span>
          </button>

          {/* Context Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#8494A5] hover:text-white bg-[#0E1722] hover:bg-[#152332] border border-[#1C2C3D] rounded-lg transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0F1822] border border-[#2B4055] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.85)] py-1.5 z-50 text-xs backdrop-blur-md">
                  {/* Mark Ready immediately */}
                  <button
                    onClick={() => {
                      soundFX.playReadyChime();
                      onMarkReady(account.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-[#00F5A0] hover:bg-[#152332] flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>{t.readyToPlay}</span>
                  </button>

                  <button
                    onClick={() => {
                      onEdit(account);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-[#CAD6E2] hover:text-white hover:bg-[#152332] flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t.edit}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(t.confirmDelete)) {
                        onDelete(account.id);
                      }
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-[#FF4655] hover:bg-[#FF4655]/10 flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.delete}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
