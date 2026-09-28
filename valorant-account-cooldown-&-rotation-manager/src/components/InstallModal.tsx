import React from 'react';
import { X, Download, Monitor, Terminal, Check, ExternalLink } from 'lucide-react';
import { ValorantLogo } from './ValorantLogo';
import { Language } from '../utils/i18n';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onPwaInstall?: () => void;
  canPwaInstall?: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  language,
  onPwaInstall,
  canPwaInstall,
}) => {
  const [copiedBatch, setCopiedBatch] = React.useState(false);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B131C] border border-[#233547] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1B2A38] flex items-center justify-between bg-[#0F1923]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14202C] border border-[#2B3F54] flex items-center justify-center p-2 shadow-[0_0_15px_rgba(255,70,85,0.4)]">
              <ValorantLogo size={24} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>{isAr ? 'تشغيل البرنامج على الديسكتوب' : 'Run Standalone on Desktop'}</span>
                <span className="text-[10px] font-mono bg-[#FF4655]/20 text-[#FF4655] px-2 py-0.5 rounded border border-[#FF4655]/40">
                  100% IDENTICAL
                </span>
              </h2>
              <p className="text-xs text-[#8494A5] mt-0.5">
                {isAr
                  ? 'الحصول على نفس الواجهة والمؤثرات الصوتية كبرنامج مستقل على الويندوز'
                  : 'Get the exact same modern UI and audio FX in a standalone Windows app'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8494A5] hover:text-white rounded-lg hover:bg-[#1A2838] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Method 1: Instant PWA Desktop App */}
          <div className="p-4 rounded-xl border border-[#00F5A0]/40 bg-[#00F5A0]/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00F5A0]/20 flex items-center justify-center text-[#00F5A0]">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'الطريقة 1: التثبيت المباشر بنقرة واحدة (موصى بها)' : 'Option 1: 1-Click Instant App (Recommended)'}
                  </h3>
                  <p className="text-xs text-[#8BB8A8]">
                    {isAr ? 'تثبيت البرنامج فوراً بأيقونة فالورانت في التاسك بار وسطح المكتب' : 'Instantly installs with Valorant taskbar icon & zero setup'}
                  </p>
                </div>
              </div>
            </div>

            {canPwaInstall ? (
              <button
                onClick={() => {
                  if (onPwaInstall) onPwaInstall();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-[#00F5A0] hover:bg-[#00D287] text-[#0A1017] font-black rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,245,160,0.3)] cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isAr ? 'تثبيت الآن على الديسكتوب' : 'Install VALO.LEVELING Now'}</span>
              </button>
            ) : (
              <div className="text-xs text-[#CAD6E2] bg-[#0A141E] p-3 rounded-lg border border-[#1A2F40] leading-relaxed">
                {isAr ? (
                  <span>
                    إذا كنت تفتح الرابط في متصفح (Edge أو Chrome): اضغط على أيقونة <strong>التثبيت (Install)</strong> الموجودة في أعلى المتصفح يمين شريط العنوان، وسيفتح فوراً كنافذة تطبيق ويندوز مستقلة بدون متصفح.
                  </span>
                ) : (
                  <span>
                    In your browser address bar (Edge or Chrome), click the <strong>Install App</strong> icon (or Menu → Apps → Install VALO.LEVELING) to create an isolated native desktop window!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Method 2: Build Standalone EXE */}
          <div className="p-4 rounded-xl border border-[#223548] bg-[#0E1722] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FF4655]/20 flex items-center justify-center text-[#FF4655]">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'الطريقة 2: تشغيل أو تجميع ملف EXE من جهازك' : 'Option 2: Run or Build Standalone EXE'}
                </h3>
                <p className="text-xs text-[#8494A5]">
                  {isAr ? 'تشغيل نفس واجهة الويب داخل ملف تنفيذي مستقل' : 'Run the exact web engine as a standalone executable'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#070C11] p-3 rounded-lg border border-[#162432] space-y-2">
                <p className="text-[#8494A5]">
                  {isAr
                    ? 'في مجلد المشروع على جهازك، قمنا بإنشاء ملفات تجميع جاهزة:'
                    : 'Inside your project folder on your PC, simply run:'}
                </p>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="p-2 bg-[#0B131A] rounded border border-[#1C2C3D] text-[#00F5A0] flex items-center justify-between">
                    <span>RUN_DESKTOP.bat</span>
                    <span className="text-[#8494A5] text-[10px]">{isAr ? 'تشغيل فوري' : 'Instant Launch'}</span>
                  </div>
                  <div className="p-2 bg-[#0B131A] rounded border border-[#1C2C3D] text-[#FF4655] flex items-center justify-between">
                    <span>BUILD_EXE.bat</span>
                    <span className="text-[#8494A5] text-[10px]">{isAr ? 'تجميع ملف EXE مستقل' : 'Build VALO.LEVELING.exe'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1B2A38] bg-[#0E1722] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1B2B3B] hover:bg-[#253A4F] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
