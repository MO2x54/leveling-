import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { Translations, Language } from '../utils/i18n';

interface ConfirmDeleteAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  t: Translations;
  language: Language;
}

export const ConfirmDeleteAllModal: React.FC<ConfirmDeleteAllModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
  t,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0A1017] border border-[#FF4655]/40 rounded-xl shadow-[0_0_30px_rgba(255,70,85,0.25)] overflow-hidden text-[#CAD6E2]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#25151A] bg-[#160B0F]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FF4655] animate-pulse" />
            <h2 className="text-sm font-extrabold text-white tracking-wider uppercase font-sans">
              {language === 'en' ? 'CONFIRM DELETION' : 'تأكيد الحذف'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8494A5] hover:text-white hover:bg-[#201015] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-[#FF4655]/10 border border-[#FF4655]/30 rounded-lg flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-[#FF4655] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">
                {language === 'en'
                  ? `Delete all ${count} account${count > 1 ? 's' : ''}?`
                  : `هل أنت متأكد من حذف جميع الحسابات (${count})؟`}
              </p>
              <p className="text-[#A5B4C2] leading-relaxed">
                {language === 'en'
                  ? 'This will permanently remove all accounts, live timers, and saved levels. This action CANNOT be undone!'
                  : 'سيتم مسح جميع الحسابات ومؤقتات الـ 19 ساعة والليفلات نهائياً. لا يمكن التراجع عن هذا الإجراء!'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8494A5] hover:text-white hover:bg-[#152332] rounded-lg transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onConfirm();
                onClose();
              }}
              className="px-5 py-2 text-xs font-black font-mono uppercase text-white bg-[#FF4655] hover:bg-[#E03444] rounded-lg transition-all shadow-[0_0_16px_rgba(255,70,85,0.4)] cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'DELETE ALL ACCOUNTS' : 'حذف الكل نهائياً'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
