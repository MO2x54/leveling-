import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Plus,
  Clock,
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';
import { ValorantAccount, FilterStatus } from './types';
import { loadStoredAccounts, saveStoredAccounts, syncAccountsFromServer } from './utils/storage';
import { calculateTimeInfo, DEFAULT_COOLDOWN_HOURS } from './utils/time';
import { soundFX } from './utils/audio';
import { translations, Language } from './utils/i18n';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { AccountRow } from './components/AccountRow';
import { AccountModal } from './components/AccountModal';
import { BulkAccountModal } from './components/BulkAccountModal';
import { ConfirmDeleteAllModal } from './components/ConfirmDeleteAllModal';
import { InstallModal } from './components/InstallModal';
import { ValorantLogo } from './components/ValorantLogo';

export default function App() {
  const [accounts, setAccounts] = useState<ValorantAccount[]>([]);
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [autoSort, setAutoSort] = useState(true);

  // Language is locked to English
  const language: Language = 'en';
  const t = translations.en;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ValorantAccount | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('Install error:', err);
      }
    }
  };

  // Custom Watermark Branding (Default: MO2A)
  const [watermarkName, setWatermarkName] = useState<string>(() => {
    return localStorage.getItem('valorant_watermark_name') || 'MO2A';
  });

  const handleEditWatermark = () => {
    const input = prompt(t.enterOwnerName, watermarkName);
    if (input && input.trim()) {
      const trimmed = input.trim().toUpperCase();
      setWatermarkName(trimmed);
      localStorage.setItem('valorant_watermark_name', trimmed);
    }
  };

  // Ready tracking to trigger alert chime when an account hits 0s
  const previouslyReadyIdsRef = useRef<Set<string>>(new Set());

  // Heartbeat to keep desktop launcher alive when running in local standalone mode
  useEffect(() => {
    const pingInterval = setInterval(() => {
      fetch('/api/heartbeat').catch(() => {});
    }, 4000);

    const handleUnload = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/exit');
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(pingInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // Initial load
  useEffect(() => {
    const loaded = loadStoredAccounts();
    setAccounts(loaded);

    // Initial ready set
    const readySet = new Set<string>();
    loaded.forEach((acc) => {
      if (calculateTimeInfo(acc, Date.now()).isReady) {
        readySet.add(acc.id);
      }
    });
    previouslyReadyIdsRef.current = readySet;
  }, []);

  // 1-second dynamic countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);

      // Check if any cooldown account just transitioned to ready
      setAccounts((currentAccounts) => {
        let hasNewReady = false;
        const newReadySet = new Set<string>();

        currentAccounts.forEach((acc) => {
          const info = calculateTimeInfo(acc, currentNow);
          if (info.isReady) {
            newReadySet.add(acc.id);
            if (!previouslyReadyIdsRef.current.has(acc.id) && acc.targetEndTime) {
              hasNewReady = true;
            }
          }
        });

        if (hasNewReady) {
          soundFX.playReadyChime();
        }
        previouslyReadyIdsRef.current = newReadySet;
        return currentAccounts;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update storage whenever accounts change
  const updateAccounts = (updater: (prev: ValorantAccount[]) => ValorantAccount[]) => {
    setAccounts((prev) => {
      const next = updater(prev);
      saveStoredAccounts(next);
      return next;
    });
  };

  // Handlers
  const handleStartCooldown = (accountId: string, hours: number = DEFAULT_COOLDOWN_HOURS) => {
    const now = new Date();
    const target = new Date(now.getTime() + hours * 3600 * 1000);

    updateAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              targetEndTime: target.toISOString(),
              cooldownDurationHours: hours,
              lastStartedAt: now.toISOString(),
            }
          : acc
      )
    );
  };

  const handleMarkReady = (accountId: string) => {
    const past = new Date(Date.now() - 1000);
    updateAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              targetEndTime: past.toISOString(),
            }
          : acc
      )
    );
  };

  const handleResetTimer = (accountId: string) => {
    updateAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? {
              ...acc,
              targetEndTime: null,
              lastStartedAt: null,
            }
          : acc
      )
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    updateAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  const handleDeleteAllAccounts = () => {
    soundFX.playClick();
    updateAccounts(() => []);
    previouslyReadyIdsRef.current.clear();
  };

  const handleUpdateLevel = (accountId: string, newLevel: number) => {
    const safeLevel = Math.max(1, Math.min(9999, Math.round(newLevel)));
    updateAccounts((prev) =>
      prev.map((acc) => (acc.id === accountId ? { ...acc, currentLevel: safeLevel } : acc))
    );
  };

  const handleSaveAccount = (accountData: Omit<ValorantAccount, 'id'>, existingId?: string) => {
    if (existingId) {
      updateAccounts((prev) =>
        prev.map((acc) => (acc.id === existingId ? { ...accountData, id: existingId } : acc))
      );
    } else {
      const newAcc: ValorantAccount = {
        ...accountData,
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      updateAccounts((prev) => [...prev, newAcc]);
    }
  };

  const handleAddBulkAccounts = (newAccountsData: Omit<ValorantAccount, 'id'>[]) => {
    const timestamp = Date.now();
    const formattedAccounts: ValorantAccount[] = newAccountsData.map((data, idx) => ({
      ...data,
      id: `acc_bulk_${timestamp}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    }));
    updateAccounts((prev) => [...prev, ...formattedAccounts]);
  };

  // Distinct list of passwords already saved
  const existingPasswords = useMemo(() => {
    const set = new Set<string>();
    accounts.forEach((a) => {
      if (a.password && a.password.trim()) {
        set.add(a.password.trim());
      }
    });
    return Array.from(set);
  }, [accounts]);

  const handleStartAllReady = () => {
    const now = new Date();
    updateAccounts((prev) =>
      prev.map((acc) => {
        const info = calculateTimeInfo(acc, now.getTime());
        if (info.isReady) {
          const hours = acc.cooldownDurationHours || DEFAULT_COOLDOWN_HOURS;
          const target = new Date(now.getTime() + hours * 3600 * 1000);
          return {
            ...acc,
            targetEndTime: target.toISOString(),
            lastStartedAt: now.toISOString(),
          };
        }
        return acc;
      })
    );
  };

  // Filter and sort accounts
  const processedAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return accounts
      .filter((acc) => {
        const info = calculateTimeInfo(acc, nowMs);

        // Status filter
        if (statusFilter === 'READY' && !info.isReady) return false;
        if (statusFilter === 'COOLDOWN' && info.isReady) return false;

        // Region filter
        if (regionFilter !== 'ALL' && acc.region !== regionFilter) return false;

        // Search query
        if (query) {
          const matchName = acc.name.toLowerCase().includes(query);
          const matchUser = acc.username.toLowerCase().includes(query);
          const matchRegion = acc.region.toLowerCase().includes(query);
          const matchNotes = (acc.notes || '').toLowerCase().includes(query);
          if (!matchName && !matchUser && !matchRegion && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (!autoSort) return 0;
        const infoA = calculateTimeInfo(a, nowMs);
        const infoB = calculateTimeInfo(b, nowMs);

        // 1. Ready accounts float to top
        if (infoA.isReady && !infoB.isReady) return -1;
        if (!infoA.isReady && infoB.isReady) return 1;

        // 2. Cooldown accounts sorted by remaining time ASC (soonest first)
        if (!infoA.isReady && !infoB.isReady) {
          return infoA.remainingSeconds - infoB.remainingSeconds;
        }

        return a.name.localeCompare(b.name);
      });
  }, [accounts, nowMs, searchQuery, statusFilter, regionFilter, autoSort]);

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col bg-[#070C12] text-[#CAD6E2] selection:bg-[#FF4655] selection:text-white relative overflow-x-hidden font-sans"
    >
      {/* Sleek Cyber Grid Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#132232] via-[#070C12] to-[#04070A] opacity-75 z-0" />

      {/* Subtle Background Watermark */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 flex items-center justify-center overflow-hidden opacity-[0.035]">
        <div className="text-center rotate-[-12deg]">
          <span className="text-[12vw] font-black tracking-widest uppercase font-mono text-white block">
            {watermarkName}
          </span>
          <span className="text-[3vw] font-mono tracking-widest uppercase text-[#FF4655] font-black block">
            // VALOLEVELING //
          </span>
        </div>
      </div>

      {/* Top Bar Navigation */}
      <Header
        onOpenAddModal={() => {
          setEditingAccount(null);
          setIsAddModalOpen(true);
        }}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundFX.enabled = next;
        }}
        watermarkName={watermarkName}
        t={t}
        onOpenDeleteAll={() => setIsDeleteAllModalOpen(true)}
        hasAccounts={accounts.length > 0}
      />

      {/* Metrics Bar with Live Summaries */}
      <MetricsBar
        accounts={accounts}
        nowMs={nowMs}
        autoSort={autoSort}
        onToggleAutoSort={() => setAutoSort(!autoSort)}
        t={t}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5 relative z-10">
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-[#59697A] ${language === 'ar' ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full py-2 bg-[#0A1017] border border-[#1A2A3A] focus:border-[#FF4655] rounded-lg text-xs text-white placeholder-[#475769] outline-none transition-all shadow-inner ${
                language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>

          {/* Status and Region Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Segmented Control */}
            <div className="flex items-center bg-[#0A1017] border border-[#1A2A3A] rounded-lg p-1 text-xs">
              <button
                onClick={() => {
                  soundFX.playClick();
                  setStatusFilter('ALL');
                }}
                className={`px-3 py-1 rounded-md font-bold font-mono transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#182838] text-white shadow-sm'
                    : 'text-[#8494A5] hover:text-white'
                }`}
              >
                {t.filterAll}
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setStatusFilter('READY');
                }}
                className={`px-3 py-1 rounded-md font-bold font-mono transition-all cursor-pointer ${
                  statusFilter === 'READY'
                    ? 'bg-[#00F5A0]/20 text-[#00F5A0] border border-[#00F5A0]/30 shadow-[0_0_8px_rgba(0,245,160,0.2)]'
                    : 'text-[#8494A5] hover:text-white'
                }`}
              >
                {t.filterReady}
              </button>
              <button
                onClick={() => {
                  soundFX.playClick();
                  setStatusFilter('COOLDOWN');
                }}
                className={`px-3 py-1 rounded-md font-bold font-mono transition-all cursor-pointer ${
                  statusFilter === 'COOLDOWN'
                    ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30'
                    : 'text-[#8494A5] hover:text-white'
                }`}
              >
                {t.filterCooldown}
              </button>
            </div>

            {/* Region Select */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#0A1017] border border-[#1A2A3A] focus:border-[#FF4655] rounded-lg text-xs font-mono font-bold text-white outline-none cursor-pointer"
            >
              <option value="ALL">{t.filterAllRegions}</option>
              <option value="NA">NA</option>
              <option value="EU">EU</option>
              <option value="AP">AP</option>
              <option value="KR">KR</option>
              <option value="BR">BR</option>
              <option value="LATAM">LATAM</option>
            </select>
          </div>
        </div>

        {/* Account Rows List */}
        <div className="space-y-3">
          {processedAccounts.length > 0 ? (
            processedAccounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                nowMs={nowMs}
                onStartCooldown={handleStartCooldown}
                onMarkReady={handleMarkReady}
                onResetTimer={handleResetTimer}
                onEdit={(acc) => {
                  setEditingAccount(acc);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteAccount}
                onUpdateLevel={handleUpdateLevel}
                t={t}
                language={language}
              />
            ))
          ) : (
            <div className="p-12 text-center border border-dashed border-[#1C2C3D] rounded-xl bg-[#090F16]">
              <div className="flex justify-center mb-3">
                <ValorantLogo size={42} className="opacity-40" />
              </div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{t.noAccountsFound}</h3>
              <p className="text-xs text-[#8494A5] mt-1.5 max-w-sm mx-auto leading-relaxed">
                {searchQuery || statusFilter !== 'ALL' || regionFilter !== 'ALL'
                  ? t.noAccountsFilterDesc
                  : t.noAccountsEmptyDesc}
              </p>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setIsAddModalOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-[#FF4655] hover:bg-[#E03444] text-white text-xs font-black font-mono uppercase rounded-lg transition-all inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,70,85,0.35)] cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                {t.addFirstAccount}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Simplified Clean Footer with Custom Owner Watermark */}
      <footer className="border-t border-[#162330] bg-[#070B10] py-5 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8494A5] gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00F5A0] shadow-[0_0_6px_#00F5A0]" />
            <span className="text-white font-black tracking-widest">{watermarkName}</span>
            <span>— VALOLEVELING // 19H COOLDOWN ENGINE</span>
            <span className="text-[#FF4655] font-black text-[10px] px-1.5 py-0.5 rounded bg-[#FF4655]/15 border border-[#FF4655]/30">
              {t.privateEdition}
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#59697A]">
            {t.allRightsReserved} © {new Date().getFullYear()}
          </div>
        </div>
      </footer>

      {/* Add / Edit Account Modal */}
      <AccountModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
        existingPasswords={existingPasswords}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        t={t}
        language={language}
      />

      {/* Bulk Add (Shared Password) Modal */}
      <BulkAccountModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onAddBulkAccounts={handleAddBulkAccounts}
        existingSharedPassword={existingPasswords[0] || ''}
        t={t}
        language={language}
      />

      {/* Confirm Delete All Modal */}
      <ConfirmDeleteAllModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllAccounts}
        count={accounts.length}
        t={t}
        language={language}
      />

      {/* Standalone Desktop Run / Install Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        language={language}
        onPwaInstall={handlePwaInstall}
        canPwaInstall={!!deferredPrompt}
      />
    </div>
  );
}
