import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Layers,
  Clock,
  Database,
  ExternalLink
} from 'lucide-react';
import { PYTHON_SCRIPT_CODE, PYTHON_REQUIREMENTS_TXT } from '../utils/pythonCode';
import { ValorantAccount } from '../types';
import { exportToPythonJson } from '../utils/storage';
import { soundFX } from '../utils/audio';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: ValorantAccount[];
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  accounts,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'instructions' | 'export'>('code');

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    soundFX.playCopy();
    await navigator.clipboard.writeText(PYTHON_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyReqs = async () => {
    soundFX.playCopy();
    await navigator.clipboard.writeText(PYTHON_REQUIREMENTS_TXT);
    setCopiedReqs(true);
    setTimeout(() => setCopiedReqs(false), 2000);
  };

  const handleDownloadPy = () => {
    soundFX.playClick();
    const blob = new Blob([PYTHON_SCRIPT_CODE], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'valorant_cooldown_tracker.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReqs = () => {
    soundFX.playClick();
    const blob = new Blob([PYTHON_REQUIREMENTS_TXT], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'requirements.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAccountsJson = () => {
    soundFX.playClick();
    const jsonStr = exportToPythonJson(accounts);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'accounts.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#0F1923] border border-[#253849] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#ECE8E1]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#253849] bg-[#121D28] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[#FF4655] font-mono font-bold tracking-wider">// PYTHON APP</span>
            <h2 className="text-base font-bold text-white tracking-tight">
              CustomTkinter Desktop Application Source
            </h2>
            <span className="text-xs text-[#8B97A2] hidden sm:inline">
              · valorant_cooldown_tracker.py
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-[#8B97A2] hover:text-white hover:bg-[#1E2F3E] rounded transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#253849] bg-[#0B131A] text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'code'
                  ? 'bg-[#FF4655] text-white shadow-sm'
                  : 'text-[#8B97A2] hover:text-white hover:bg-[#172430]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Python Source (.py)
            </button>

            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-[#FF4655] text-white shadow-sm'
                  : 'text-[#8B97A2] hover:text-white hover:bg-[#172430]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Setup & Architecture
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'export'
                  ? 'bg-[#FF4655] text-white shadow-sm'
                  : 'text-[#8B97A2] hover:text-white hover:bg-[#172430]'
              }`}
            >
              <Database className="w-4 h-4" />
              Export accounts.json ({accounts.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPy}
              className="px-3 py-1.5 bg-[#1F2E3D] hover:bg-[#2A3E52] text-white rounded font-medium flex items-center gap-1.5 transition-colors border border-[#2F4457]"
              title="Download Python file"
            >
              <Download className="w-3.5 h-3.5 text-[#00E59B]" />
              Download .py
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-[#FF4655] hover:bg-[#E03B49] text-white rounded font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B1218]">
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8B97A2] pb-2 border-b border-[#1E2E3E]">
                <span>Complete single-file CustomTkinter desktop script · 100% production ready</span>
                <span className="font-mono">Python 3.8+ · customtkinter · pyperclip</span>
              </div>
              <div className="relative rounded border border-[#203040] bg-[#070D12] overflow-hidden">
                <pre className="p-4 text-xs font-mono leading-relaxed text-[#D6DEE8] overflow-x-auto selection:bg-[#FF4655]/40 selection:text-white">
                  <code>{PYTHON_SCRIPT_CODE}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="max-w-3xl mx-auto space-y-6 text-sm text-[#D6DEE8]">
              {/* Requirements & Installation */}
              <div className="p-5 rounded-lg border border-[#253849] bg-[#121D28] space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Terminal className="w-4 h-4 text-[#FF4655]" />
                  <h3>1. Installation & Running Instructions</h3>
                </div>
                <p className="text-xs text-[#8B97A2] leading-relaxed">
                  Make sure you have Python 3.8 or higher installed on your system.
                  Run the following terminal commands:
                </p>
                <div className="bg-[#070D12] border border-[#1E2F3E] rounded p-3 font-mono text-xs text-[#00E59B] space-y-1">
                  <div># 1. Install required packages (CustomTkinter UI & system clipboard support)</div>
                  <div className="text-white">pip install customtkinter pyperclip</div>
                  <div className="mt-2 text-[#8B97A2]"># 2. Run the desktop application</div>
                  <div className="text-[#FF4655]">python valorant_cooldown_tracker.py</div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleCopyReqs}
                    className="px-3 py-1.5 bg-[#1F2E3D] hover:bg-[#2A3E52] text-xs font-medium text-white rounded flex items-center gap-1.5 transition-colors border border-[#2F4457]"
                  >
                    {copiedReqs ? <Check className="w-3.5 h-3.5 text-[#00E59B]" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy requirements.txt
                  </button>
                  <button
                    onClick={handleDownloadReqs}
                    className="px-3 py-1.5 bg-[#1F2E3D] hover:bg-[#2A3E52] text-xs font-medium text-white rounded flex items-center gap-1.5 transition-colors border border-[#2F4457]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00E59B]" />
                    Download requirements.txt
                  </button>
                </div>
              </div>

              {/* Architecture Breakdown */}
              <div className="p-5 rounded-lg border border-[#253849] bg-[#121D28] space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-base">
                  <Layers className="w-4 h-4 text-[#00E59B]" />
                  <h3>2. Core Architectural Invariants</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded border border-[#1E2F3E] bg-[#0E1720] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Clock className="w-4 h-4 text-[#FF4655]" />
                      <span>Dynamic Timestamp Delta</span>
                    </div>
                    <p className="text-[#8B97A2] leading-relaxed">
                      Instead of ticking a mutable integer counter downward, the app records an immutable{' '}
                      <code className="text-white">target_end_time = datetime.now() + timedelta(hours=19)</code>.
                      On every tick, it evaluates <code className="text-white">(target - datetime.now())</code>.
                      Closing the app or putting your PC to sleep never causes desynchronization.
                    </p>
                  </div>

                  <div className="p-3 rounded border border-[#1E2F3E] bg-[#0E1720] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Layers className="w-4 h-4 text-[#00E59B]" />
                      <span>Auto-Sorting & Ready Floating</span>
                    </div>
                    <p className="text-[#8B97A2] leading-relaxed">
                      Whenever an account reaches 0 seconds remaining, its state automatically updates to{' '}
                      <span className="text-[#00E59B] font-semibold">READY TO PLAY</span> and floats to the top of
                      the account stack. Active cooldowns are sorted by soonest remaining completion time.
                    </p>
                  </div>

                  <div className="p-3 rounded border border-[#1E2F3E] bg-[#0E1720] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Database className="w-4 h-4 text-[#FFB800]" />
                      <span>Atomic JSON Persistence</span>
                    </div>
                    <p className="text-[#8B97A2] leading-relaxed">
                      Data is stored in <code className="text-white">accounts.json</code> using an atomic write pattern
                      (writing to a temporary file and atomically renaming via <code className="text-white">os.replace</code>).
                      This ensures no data loss or file corruption even during sudden power failure.
                    </p>
                  </div>

                  <div className="p-3 rounded border border-[#1E2F3E] bg-[#0E1720] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Copy className="w-4 h-4 text-[#3B82F6]" />
                      <span>Dual-Clipboard Fallback</span>
                    </div>
                    <p className="text-[#8B97A2] leading-relaxed">
                      Credentials copy quickly using <code className="text-white">pyperclip</code> for robust
                      operating system clipboard integration, with an automatic fallback to Tkinter's native
                      <code className="text-white">clipboard_append()</code> if pyperclip is not installed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="max-w-3xl mx-auto space-y-6 text-sm">
              <div className="p-5 rounded-lg border border-[#253849] bg-[#121D28] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-base">
                    <Database className="w-4 h-4 text-[#00E59B]" />
                    <h3>Direct Interoperability with Python Desktop App</h3>
                  </div>
                  <button
                    onClick={handleDownloadAccountsJson}
                    className="px-3 py-1.5 bg-[#059669] hover:bg-[#10B981] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download accounts.json
                  </button>
                </div>
                <p className="text-xs text-[#8B97A2] leading-relaxed">
                  Save this <code className="text-white font-mono">accounts.json</code> file in the same directory as
                  your <code className="text-white font-mono">valorant_cooldown_tracker.py</code> script. The Python desktop app
                  will instantly load your current accounts, remaining cooldowns, and credentials!
                </p>

                <div className="rounded border border-[#203040] bg-[#070D12] overflow-hidden">
                  <pre className="p-4 text-xs font-mono text-[#00E59B] max-h-80 overflow-y-auto">
                    <code>{exportToPythonJson(accounts)}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
