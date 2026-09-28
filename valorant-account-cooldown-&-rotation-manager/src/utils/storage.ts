import { ValorantAccount } from '../types';
import { DEFAULT_COOLDOWN_HOURS } from './time';

const STORAGE_KEY = 'valorant_accounts_storage_v1';
const INITIALIZED_KEY = 'valorant_accounts_initialized';

export function getSeedAccounts(): ValorantAccount[] {
  const now = Date.now();
  // 1. Ready account (finished earlier)
  const readyTarget = new Date(now - 45 * 60 * 1000).toISOString();
  // 2. Active cooldown (3 hours 15 mins remaining)
  const cdTarget1 = new Date(now + (3 * 3600 + 15 * 60 + 20) * 1000).toISOString();
  // 3. Active cooldown (14 hours 42 mins remaining)
  const cdTarget2 = new Date(now + (14 * 3600 + 42 * 60 + 5) * 1000).toISOString();
  // 4. Fresh idle account
  return [
    {
      id: 'acc_seed_1',
      name: 'Reyna Smurf AP',
      username: 'reyna_ap_01',
      password: 'RadiantPassword99!',
      region: 'AP',
      notes: 'Ascendant 2 / Daily missions priority',
      targetEndTime: readyTarget,
      cooldownDurationHours: 19,
      lastStartedAt: new Date(now - 20 * 3600 * 1000).toISOString(),
      currentLevel: 24,
    },
    {
      id: 'acc_seed_2',
      name: 'Viper Leveling NA',
      username: 'viper_na_grind',
      password: 'SnakeBitePass2026#',
      region: 'NA',
      notes: 'Account Level 18 - 2 levels to competitive unlocked',
      targetEndTime: cdTarget1,
      cooldownDurationHours: 19,
      lastStartedAt: new Date(now - (19 - 3.25) * 3600 * 1000).toISOString(),
      currentLevel: 18,
    },
    {
      id: 'acc_seed_3',
      name: 'Jett Main EUW',
      username: 'jett_tailwind_eu',
      password: 'WindPassKey887!',
      region: 'EU',
      notes: 'Daily AP bonus reset rotation',
      targetEndTime: cdTarget2,
      cooldownDurationHours: 19,
      lastStartedAt: new Date(now - (19 - 14.7) * 3600 * 1000).toISOString(),
      currentLevel: 42,
    },
    {
      id: 'acc_seed_4',
      name: 'Cypher Trap KR',
      username: 'cypher_kr_cam',
      password: 'WireTrapSecret#22',
      region: 'KR',
      notes: 'Clean fresh smurf / Unranked',
      targetEndTime: null,
      cooldownDurationHours: 19,
      lastStartedAt: null,
      currentLevel: 12,
    },
  ];
}

export function loadStoredAccounts(): ValorantAccount[] {
  if (typeof window === 'undefined') return getSeedAccounts();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasInitialized = localStorage.getItem(INITIALIZED_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    if (!hasInitialized) {
      const seeds = getSeedAccounts();
      saveStoredAccounts(seeds);
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return seeds;
    }

    return [];
  } catch {
    return getSeedAccounts();
  }
}

export function saveStoredAccounts(accounts: ValorantAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem(INITIALIZED_KEY, 'true');

    // Asynchronously write to local disk (accounts_data.json) if running in standalone/desktop runner
    if (typeof fetch !== 'undefined') {
      fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accounts),
      }).catch(() => {
        // Local desktop server might not be running if in pure browser static preview
      });
    }
  } catch (err) {
    console.error('Failed to save accounts:', err);
  }
}

/**
 * Syncs accounts from the persistent disk file (accounts_data.json) via /api/accounts
 */
export async function syncAccountsFromServer(): Promise<ValorantAccount[] | null> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
  try {
    const res = await fetch('/api/accounts');
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(INITIALIZED_KEY, 'true');
      return data;
    }
  } catch {
    // Pure static preview or offline
  }
  return null;
}

/**
 * Converts web account model to the exact schema expected by the Python CustomTkinter app's accounts.json
 */
export function exportToPythonJson(accounts: ValorantAccount[]): string {
  const pythonCompatible = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    username: acc.username,
    password: acc.password,
    region: acc.region,
    notes: acc.notes || '',
    target_end_time: acc.targetEndTime,
    cooldown_duration_hours: acc.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS,
    last_started_at: acc.lastStartedAt,
    current_level: acc.currentLevel || 20,
  }));
  return JSON.stringify(pythonCompatible, null, 2);
}

/**
 * Imports accounts from Python format or web format JSON
 */
export function parseImportedJson(jsonStr: string): ValorantAccount[] {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error('Imported JSON must be an array of accounts');
  }

  return parsed.map((item, idx) => ({
    id: item.id || `acc_imported_${Date.now()}_${idx}`,
    name: item.name || `Imported Account ${idx + 1}`,
    username: item.username || '',
    password: item.password || '',
    region: (item.region || 'NA') as ValorantAccount['region'],
    notes: item.notes || '',
    targetEndTime: item.target_end_time !== undefined ? item.target_end_time : (item.targetEndTime || null),
    cooldownDurationHours: item.cooldown_duration_hours || item.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS,
    lastStartedAt: item.last_started_at !== undefined ? item.last_started_at : (item.lastStartedAt || null),
    currentLevel: item.current_level || item.currentLevel || 20,
  }));
}
