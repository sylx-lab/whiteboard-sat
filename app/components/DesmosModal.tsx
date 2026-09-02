import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Calculator, ExternalLink, Maximize2, Minimize2, RotateCcw, GripHorizontal } from 'lucide-react';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Only the two constructors this app builds, and the destroy() every one has. */
interface DesmosCalculator {
  destroy: () => void;
  resize?: () => void;
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

interface WindowLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STORAGE_KEY = 'sat_desmos_window_layout_v2';
const MIN_WIDTH = 340;
const MIN_HEIGHT = 280;

/** Inlined from DESMOS_KEY by next.config.ts. Empty in a checkout without one. */
const API_KEY = process.env.DESMOS_KEY ?? '';
const API_VERSION = 'v1.11';

let scriptLoad: Promise<void> | null = null;

const loadDesmos = () =>
  (scriptLoad ??= new Promise<void>((resolve, reject) => {
    if (window.Desmos) return resolve();
    const script = document.createElement('script');
    script.src = `https://www.desmos.com/api/${API_VERSION}/calculator.js?apiKey=${encodeURIComponent(API_KEY)}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoad = null;
      reject(new Error('Could not load the Desmos calculator'));
    };
    document.head.appendChild(script);
  }));

const getDefaultLayout = (): WindowLayout => {
  if (typeof window === 'undefined') {
    return { x: 100, y: 70, width: 620, height: 520 };
  }
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // On iPad/tablets (e.g. 768px - 834px width), 46% of width is too narrow (~350px) for Desmos keypad
  const isTablet = screenWidth >= 640 && screenWidth <= 1024;
  const defaultWidth = isTablet
    ? Math.min(screenWidth - 24, Math.max(480, Math.floor(screenWidth * 0.62)))
    : Math.min(600, Math.max(MIN_WIDTH, Math.floor(screenWidth * 0.46)));

  const defaultHeight = Math.min(540, Math.max(MIN_HEIGHT, Math.floor(screenHeight * (isTablet ? 0.65 : 0.72))));

  // Position on top-right by default so student can see question on left
  const defaultX = Math.max(12, screenWidth - defaultWidth - 20);
  const defaultY = Math.min(72, Math.max(12, Math.floor(screenHeight * 0.08)));

  return {
    x: defaultX,
    y: defaultY,
    width: defaultWidth,
    height: defaultHeight,
  };
};

const getSavedLayout = (): WindowLayout => {
  const defaultLayout = getDefaultLayout();
  if (typeof window === 'undefined') return defaultLayout;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLayout;

    const parsed = JSON.parse(raw);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const width = Math.min(
      Math.max(MIN_WIDTH, Number(parsed.width) || defaultLayout.width),
      screenWidth - 24
    );
    const height = Math.min(
      Math.max(MIN_HEIGHT, Number(parsed.height) || defaultLayout.height),
      screenHeight - 24
    );
    const x = Math.max(8, Math.min(Number(parsed.x) ?? defaultLayout.x, screenWidth - width - 8));
    const y = Math.max(8, Math.min(Number(parsed.y) ?? defaultLayout.y, screenHeight - 60));

    return { x, y, width, height };
  } catch {
    return defaultLayout;
  }
};

const saveLayoutToStorage = (layout: WindowLayout) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // ignore localstorage errors
  }
};

export const DesmosModal: React.FC<DesmosModalProps> = ({ isOpen, onClose }) => {
  const [kind, setKind] = useState<CalculatorKind>('graphing');
  const [settled, setSettled] = useState<{ kind: CalculatorKind; ok: boolean } | null>(null);
  const status = settled?.kind !== kind ? 'loading' : settled.ok ? 'ready' : 'error';

  const [layout, setLayout] = useState<WindowLayout>(getDefaultLayout);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const calcInstanceRef = useRef<DesmosCalculator | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Initialize saved layout when opened
  useEffect(() => {
    if (isOpen) {
      setLayout(getSavedLayout());
    }
  }, [isOpen]);

  // Load Desmos instance
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
                settingsMenu: false,
              })
            : window.Desmos.ScientificCalculator(mountRef.current, { border: false });
        calcInstanceRef.current = calculator;
        setSettled({ kind: opened, ok: true });
      })
      .catch(() => {
        if (!cancelled) setSettled({ kind: opened, ok: false });
      });

    return () => {
      cancelled = true;
      calcInstanceRef.current = null;
      calculator?.destroy();
    };
  }, [isOpen, kind]);

  // Trigger Desmos resize when window dimensions change
  useEffect(() => {
    if (status === 'ready') {
      try {
        calcInstanceRef.current?.resize?.();
        window.dispatchEvent(new Event('resize'));
      } catch {
        // ignore
      }
    }
  }, [layout.width, layout.height, isMaximized, status]);

  // Dragging logic
  const handleHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // Don't drag if clicking interactive buttons in header
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    if (isMaximized) return;

    e.preventDefault();
    setIsInteracting(true);

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startX = layout.x;
    const startY = layout.y;
    let latestLayout = layout;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const nextX = Math.max(8, Math.min(startX + deltaX, screenWidth - layout.width - 8));
      const nextY = Math.max(8, Math.min(startY + deltaY, screenHeight - 60));

      latestLayout = { ...latestLayout, x: nextX, y: nextY };
      setLayout(latestLayout);
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
      saveLayoutToStorage(latestLayout);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [isMaximized, layout]);

  // Resize handler logic
  const handleResizePointerDown = useCallback((
    e: React.PointerEvent<HTMLDivElement>,
    direction: 'se' | 'e' | 's' | 'w' | 'sw'
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isMaximized) return;

    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startX = layout.x;
    const startY = layout.y;
    const startW = layout.width;
    const startH = layout.height;
    let latestLayout = layout;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let nextW = startW;
      let nextH = startH;
      let nextX = startX;
      const nextY = startY;

      if (direction.includes('e')) {
        nextW = Math.max(MIN_WIDTH, Math.min(startW + deltaX, screenWidth - startX - 12));
      }
      if (direction.includes('s')) {
        nextH = Math.max(MIN_HEIGHT, Math.min(startH + deltaY, screenHeight - startY - 12));
      }
      if (direction.includes('w')) {
        const potentialW = Math.max(MIN_WIDTH, Math.min(startW - deltaX, startX + startW - 12));
        nextX = startX + (startW - potentialW);
        nextW = potentialW;
      }

      latestLayout = { x: nextX, y: nextY, width: nextW, height: nextH };
      setLayout(latestLayout);
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
      saveLayoutToStorage(latestLayout);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [isMaximized, layout]);

  const handleResetLayout = () => {
    const defaultLayout = getDefaultLayout();
    setLayout(defaultLayout);
    setIsMaximized(false);
    saveLayoutToStorage(defaultLayout);
  };

  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  if (!isOpen) return null;
  const active = CALCULATORS[kind];

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        left: 12,
        top: 12,
        width: 'calc(100dvw - 24px)',
        height: 'calc(100dvh - 24px)',
        zIndex: 55,
      }
    : {
        position: 'fixed',
        left: layout.x,
        top: layout.y,
        width: layout.width,
        height: layout.height,
        zIndex: 55,
      };

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      className="flex flex-col bg-(--surface) rounded-2xl shadow-2xl border border-(--border-strong) overflow-hidden select-text animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Invisible overlay while dragging/resizing so Desmos iframe doesn't swallow pointer events */}
      {isInteracting && <div className="absolute inset-0 z-50 cursor-move" />}

      {/* Draggable Header */}
      <div
        onPointerDown={handleHeaderPointerDown}
        style={{ touchAction: isMaximized ? 'auto' : 'none' }}
        className={`px-3 sm:px-4 py-2 border-b border-(--border) flex items-center justify-between gap-2 bg-(--surface-soft) select-none ${
          isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        title={isMaximized ? undefined : 'Click and drag to move calculator anywhere on screen'}
      >
        <div className="flex items-center gap-2 min-w-0 pointer-events-none">
          <div className="p-1 rounded text-(--foreground-muted) flex items-center justify-center">
            <GripHorizontal className="w-4 h-4" />
          </div>
          <div className="w-6 h-6 rounded-md bg-(--brand) flex items-center justify-center text-white shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-(--foreground) text-[12.5px] sm:text-[13px] truncate flex items-center gap-1.5">
              <span>Desmos Calculator</span>
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-(--brand-soft) text-(--brand-text)">
                Digital SAT
              </span>
            </h3>
          </div>
        </div>

        {/* Action buttons in header */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pointer-events-auto">
          {/* Switcher */}
          <div className="flex rounded-lg bg-(--surface) p-0.5 text-[11px] font-semibold border border-(--border)">
            {(Object.keys(CALCULATORS) as CalculatorKind[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setKind(key)}
                className={`px-2 sm:px-2.5 h-6 sm:h-6.5 rounded-md transition-colors cursor-pointer ${
                  kind === key
                    ? 'bg-(--brand) text-white shadow-xs font-bold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground)'
                }`}
              >
                {CALCULATORS[key].label}
              </button>
            ))}
          </div>

          {/* Reset position & size button */}
          <button
            type="button"
            onClick={handleResetLayout}
            title="Reset position and size to default"
            className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface) rounded-lg transition-colors cursor-pointer border border-transparent hover:border-(--border)"
            aria-label="Reset window size and position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            type="button"
            onClick={toggleMaximize}
            title={isMaximized ? 'Restore size' : 'Maximize calculator'}
            className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface) rounded-lg transition-colors cursor-pointer border border-transparent hover:border-(--border)"
            aria-label={isMaximized ? 'Restore size' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* External link */}
          <a
            href={active.href}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in a new tab"
            className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface) rounded-lg transition-colors border border-transparent hover:border-(--border)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the calculator"
            title="Close"
            className="p-1.5 text-(--foreground-secondary) hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Desmos Calculator Canvas */}
      <div className="flex-1 relative bg-(--surface) min-h-0">
        {!API_KEY ? (
          <iframe
            key={kind}
            src={active.href}
            title={`Desmos ${active.label} calculator`}
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <>
            <div key={kind} ref={mountRef} className="absolute inset-0" />
            {status !== 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center bg-(--surface) text-[12px] text-(--foreground-secondary)">
                {status === 'loading' ? (
                  <span className="animate-pulse">Loading Desmos calculator…</span>
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

      {/* Resize Handles (disabled when maximized) — touch-friendly for iPad/tablets */}
      {!isMaximized && (
        <>
          {/* Bottom-right corner resize handle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            style={{ touchAction: 'none' }}
            className="absolute -bottom-1 -right-1 w-9 h-9 cursor-se-resize flex items-end justify-end p-1.5 z-40 select-none group"
            title="Drag to resize"
          >
            <div className="w-3 h-3 border-r-2 border-b-2 border-(--foreground-muted) group-hover:border-(--brand) rounded-br-xs transition-colors pointer-events-none" />
          </div>

          {/* Right edge resize */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            style={{ touchAction: 'none' }}
            className="absolute top-10 -right-1.5 w-4 bottom-4 cursor-e-resize z-30 hover:bg-(--brand)/20 transition-colors"
            title="Drag to resize width"
          />

          {/* Bottom edge resize */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            style={{ touchAction: 'none' }}
            className="absolute -bottom-1.5 left-4 right-6 h-4 cursor-s-resize z-30 hover:bg-(--brand)/20 transition-colors"
            title="Drag to resize height"
          />

          {/* Left edge resize */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            style={{ touchAction: 'none' }}
            className="absolute top-10 -left-1.5 w-4 bottom-4 cursor-w-resize z-30 hover:bg-(--brand)/20 transition-colors"
            title="Drag to resize width"
          />
        </>
      )}
    </div>
  );
};

