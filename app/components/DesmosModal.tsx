import React, { useEffect, useRef, useState } from 'react';
import { X, Calculator, ExternalLink } from 'lucide-react';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Only the two constructors this app builds, and the destroy() every one has. */
interface DesmosCalculator {
  destroy: () => void;
}
declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (el: HTMLElement, options?: Record<string, unknown>) => DesmosCalculator;
      ScientificCalculator: (el: HTMLElement, options?: Record<string, unknown>) => DesmosCalculator;
    };
  }
}

const CALCULATORS = {
  graphing: { label: 'Graphing', href: 'https://www.desmos.com/calculator' },
  scientific: { label: 'Scientific', href: 'https://www.desmos.com/scientific' },
} as const;

type CalculatorKind = keyof typeof CALCULATORS;

/** Inlined from DESMOS_KEY by next.config.ts. Empty in a checkout without one. */
const API_KEY = process.env.DESMOS_KEY ?? '';
const API_VERSION = 'v1.11';

/**
 * One script for the whole session: 4 MB, and a second copy would replace
 * window.Desmos underneath any calculator already on screen.
 */
let scriptLoad: Promise<void> | null = null;

const loadDesmos = () =>
(scriptLoad ??= new Promise<void>((resolve, reject) => {
  if (window.Desmos) return resolve();
  const script = document.createElement('script');
  script.src = `https://www.desmos.com/api/${API_VERSION}/calculator.js?apiKey=${encodeURIComponent(API_KEY)}`;
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => {
    scriptLoad = null; // let the next open try again
    reject(new Error('Could not load the Desmos calculator'));
  };
  document.head.appendChild(script);
}));

/**
 * The real Desmos, the same calculator the Digital SAT provides — its own API,
 * not a screenshot and not a mock. Without an API key it falls back to the
 * public calculator in an iframe, so a checkout with no key still works.
 */
export const DesmosModal: React.FC<DesmosModalProps> = ({ isOpen, onClose }) => {
  const [kind, setKind] = useState<CalculatorKind>('graphing');
  // Which calculator finished loading, rather than a status that has to be
  // reset to 'loading' on every switch — a synchronous setState in the effect
  // below is exactly what react-hooks/set-state-in-effect refuses.
  const [settled, setSettled] = useState<{ kind: CalculatorKind; ok: boolean } | null>(null);
  const status = settled?.kind !== kind ? 'loading' : settled.ok ? 'ready' : 'error';
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !API_KEY) return;
    let calculator: DesmosCalculator | undefined;
    let cancelled = false;
    const opened = kind;

    loadDesmos()
      .then(() => {
        if (cancelled || !mountRef.current || !window.Desmos) return;
        calculator =
          kind === 'graphing'
            ? window.Desmos.GraphingCalculator(mountRef.current, {
              border: false,
              // The SAT gives students the full graphing suite; the only thing
              // hidden is Desmos's own account/settings chrome.
              settingsMenu: false,
            })
            : window.Desmos.ScientificCalculator(mountRef.current, { border: false });
        setSettled({ kind: opened, ok: true });
      })
      .catch(() => {
        if (!cancelled) setSettled({ kind: opened, ok: false });
      });

    return () => {
      cancelled = true;
      // Desmos keeps listeners on window; destroying is what stops a reopened
      // modal from stacking a second calculator on the same page.
      calculator?.destroy();
    };
  }, [isOpen, kind]);

  if (!isOpen) return null;
  const active = CALCULATORS[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--surface) rounded-2xl shadow-2xl border border-(--border) w-full max-w-4xl h-[94dvh] sm:h-[90vh] flex flex-col overflow-hidden">
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-4 border-b border-(--border) flex items-center justify-between gap-2 sm:gap-3 bg-(--surface)">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-(--brand) flex items-center justify-center text-white shrink-0">
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-(--foreground) text-[13px] sm:text-[14px] truncate">Desmos calculator</h3>
              <p className="text-[11px] sm:text-[12px] text-(--foreground-secondary) truncate hidden sm:block">
                The same one the Digital SAT provides
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex rounded-[10px] bg-(--surface-soft) p-0.5 text-[11.5px] sm:text-[12px] font-semibold">
              {(Object.keys(CALCULATORS) as CalculatorKind[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setKind(key)}
                  className={`px-2.5 sm:px-3 h-7 sm:h-8 rounded-lg transition-colors cursor-pointer ${kind === key
                      ? 'bg-(--surface) text-(--brand-text) shadow-xs font-bold'
                      : 'text-(--foreground-secondary) hover:text-(--foreground)'
                    }`}
                >
                  {CALCULATORS[key].label}
                </button>
              ))}
            </div>
            <a
              href={active.href}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in a new tab"
              className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              aria-label="Close the calculator"
              className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          {!API_KEY ? (
            <iframe
              key={kind}
              src={active.href}
              title={`Desmos ${active.label} calculator`}
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <>
              {/* keyed so switching kind gets a clean node for the new calculator */}
              <div key={kind} ref={mountRef} className="absolute inset-0" />
              {status !== 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center bg-(--surface) text-[12px] text-(--foreground-secondary)">
                  {status === 'loading' ? (
                    'Loading the calculator…'
                  ) : (
                    <span>
                      The calculator could not load.{' '}
                      <a
                        href={active.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-(--brand-text) font-semibold underline"
                      >
                        Open it on desmos.com
                      </a>
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
