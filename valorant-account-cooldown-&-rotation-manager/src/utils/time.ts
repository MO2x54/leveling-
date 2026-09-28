import { ValorantAccount, AccountTimeInfo } from '../types';

export const DEFAULT_COOLDOWN_HOURS = 19;

/**
 * Calculates remaining time dynamically by comparing targetEndTime against the current system time.
 * If targetEndTime <= now, account is marked as Ready.
 */
export function calculateTimeInfo(account: ValorantAccount, nowMs: number = Date.now()): AccountTimeInfo {
  if (!account.targetEndTime) {
    return {
      isReady: true,
      remainingSeconds: 0,
      formattedStr: 'READY TO PLAY',
      progressPercent: 1.0,
      targetDate: null,
    };
  }

  const targetDate = new Date(account.targetEndTime);
  const targetMs = targetDate.getTime();

  if (isNaN(targetMs)) {
    return {
      isReady: true,
      remainingSeconds: 0,
      formattedStr: 'READY TO PLAY',
      progressPercent: 1.0,
      targetDate: null,
    };
  }

  const diffSeconds = (targetMs - nowMs) / 1000;

  if (diffSeconds <= 0) {
    return {
      isReady: true,
      remainingSeconds: 0,
      formattedStr: 'READY TO PLAY',
      progressPercent: 1.0,
      targetDate,
    };
  }

  const totalDurationSeconds = (account.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS) * 3600;
  const elapsedSeconds = totalDurationSeconds - diffSeconds;
  const progressPercent = Math.max(0, Math.min(1, totalDurationSeconds > 0 ? elapsedSeconds / totalDurationSeconds : 1));

  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = Math.floor(diffSeconds % 60);

  const formattedStr = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return {
    isReady: false,
    remainingSeconds: diffSeconds,
    formattedStr,
    progressPercent,
    targetDate,
  };
}

/**
 * Formats a Date object into human-readable tactical time string: HH:mm:ss (or Today/Tomorrow)
 */
export function formatTargetTime(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
