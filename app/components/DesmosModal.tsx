import React, { useState } from 'react';
import { X, Calculator, ExternalLink } from 'lucide-react';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The real Desmos, embedded — the same calculator the Digital SAT gives students.
 *
 * This used to be a mock: a fixed table of six points that never changed no
 * matter what equation was typed, presented as if it were the graph. A student
 * checking their work against it was being lied to, so it is gone.
 */
const CALCULATORS = {
  graphing: { label: 'Graphing', url: 'https://www.desmos.com/calculator' },
  scientific: { label: 'Scientific', url: 'https://www.desmos.com/scientific' },
} as const;

export const DesmosModal: React.FC<DesmosModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<keyof typeof CALCULATORS>('graphing');

  if (!isOpen) return null;
  const active = CALCULATORS[tab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0D918A] flex items-center justify-center text-white shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[#071126] text-[14px] truncate">Desmos calculator</h3>
              <p className="text-[12px] text-[#58708A] truncate">
                The same one the Digital SAT provides
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex rounded-[10px] bg-slate-100 p-0.5 text-[12px] font-semibold">
              {(Object.keys(CALCULATORS) as (keyof typeof CALCULATORS)[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 h-8 rounded-lg transition-colors cursor-pointer ${
                    tab === key
                      ? 'bg-white text-[#087C76] shadow-xs'
                      : 'text-[#58708A] hover:text-[#071126]'
                  }`}
                >
                  {CALCULATORS[key].label}
                </button>
              ))}
            </div>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in a new tab"
              className="p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              aria-label="Close the calculator"
              className="p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* keyed on the tab so switching actually reloads the other calculator */}
        <iframe
          key={tab}
          src={active.url}
          title={`Desmos ${active.label} calculator`}
          className="flex-1 w-full border-0"
        />
      </div>
    </div>
  );
};
