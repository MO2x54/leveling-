export type ValorantRegion = 'NA' | 'EU' | 'AP' | 'KR' | 'BR' | 'LATAM';

export interface ValorantAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  region: ValorantRegion;
  notes?: string;
  targetEndTime: string | null; // ISO 8601 string
  cooldownDurationHours: number;
  lastStartedAt: string | null; // ISO 8601 string
  currentLevel?: number;
}

export interface AccountTimeInfo {
  isReady: boolean;
  remainingSeconds: number;
  formattedStr: string;
  progressPercent: number;
  targetDate: Date | null;
}

export type FilterStatus = 'ALL' | 'READY' | 'COOLDOWN';
