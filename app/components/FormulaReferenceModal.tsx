import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface FormulaReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaReferenceModal: React.FC<FormulaReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--brand-soft)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-cta)] flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)] text-base">Digital SAT Reference Sheet</h3>
              <p className="text-xs text-[var(--foreground-secondary)]">Official geometric & algebraic formulas provided during the exam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: 2D Geometry */}
          <div>
            <h4 className="text-xs font-bold text-[var(--brand-text)] uppercase tracking-wider mb-3">
              1. Area & Perimeter Formulas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--brand-soft)] text-center space-y-1">
                <div className="text-xs font-semibold text-[var(--foreground)]">Circle Area & Circumference</div>
                <MathRenderer content="$A = \pi r^2$" className="text-sm font-semibold text-[var(--brand-text)]" />
                <MathRenderer content="$C = 2\pi r$" className="text-xs text-[var(--foreground-secondary)]" />
              </div>

              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--brand-soft)] text-center space-y-1">
                <div className="text-xs font-semibold text-[var(--foreground)]">Rectangle</div>
                <MathRenderer content="$A = lw$" className="text-sm font-semibold text-[var(--brand-text)]" />
                <MathRenderer content="$P = 2l + 2w$" className="text-xs text-[var(--foreground-secondary)]" />
              </div>

              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--brand-soft)] text-center space-y-1">
                <div className="text-xs font-semibold text-[var(--foreground)]">Triangle</div>
                <MathRenderer content="$A = \frac{1}{2}bh$" className="text-sm font-semibold text-[var(--brand-text)]" />
                <div className="text-[11px] text-[var(--foreground-secondary)]">Base $\times$ Height / 2</div>
              </div>

              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--brand-soft)] text-center space-y-1">
                <div className="text-xs font-semibold text-[var(--foreground)]">Pythagorean Theorem</div>
                <MathRenderer content="$a^2 + b^2 = c^2$" className="text-sm font-semibold text-[var(--brand-text)]" />
                <div className="text-[11px] text-[var(--foreground-secondary)]">Right triangle legs $a, b$, hypotenuse $c$</div>
              </div>
            </div>
          </div>

          {/* Section 2: Special Right Triangles */}
          <div>
            <h4 className="text-xs font-bold text-[var(--brand-text)] uppercase tracking-wider mb-3">
              2. Special Right Triangles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--brand-soft)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--foreground)] text-sm">30° – 60° – 90° Triangle</div>
                  <div className="text-xs text-[var(--foreground-secondary)] mt-1">Side ratios opposite to angles:</div>
                  <MathRenderer content="$x : x\sqrt{3} : 2x$" className="text-sm font-bold text-[var(--brand-text)] mt-1" />
                </div>
                <div className="w-16 h-12 border-l-2 border-b-2 border-[var(--border-strong)] relative">
                  <div className="absolute -left-4 top-3 text-[10px] font-mono">x</div>
                  <div className="absolute left-6 -bottom-4 text-[10px] font-mono">x√3</div>
                  <div className="absolute left-8 top-1 text-[10px] font-mono">2x</div>
                </div>
              </div>

              <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--brand-soft)] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--foreground)] text-sm">45° – 45° – 90° Triangle</div>
                  <div className="text-xs text-[var(--foreground-secondary)] mt-1">Side ratios (Isosceles Right):</div>
                  <MathRenderer content="$s : s : s\sqrt{2}$" className="text-sm font-bold text-[var(--brand-text)] mt-1" />
                </div>
                <div className="w-14 h-14 border-l-2 border-b-2 border-[var(--border-strong)] relative">
                  <div className="absolute -left-3 top-4 text-[10px] font-mono">s</div>
                  <div className="absolute left-4 -bottom-4 text-[10px] font-mono">s</div>
                  <div className="absolute left-5 top-2 text-[10px] font-mono">s√2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 3D Volumes */}
          <div>
            <h4 className="text-xs font-bold text-[var(--brand-text)] uppercase tracking-wider mb-3">
              3. Volume Formulas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-center">
                <div className="text-xs font-medium text-[var(--foreground-secondary)] mb-1">Rectangular Prism</div>
                <MathRenderer content="$V = lwh$" className="text-sm font-bold text-[var(--foreground)]" />
              </div>
              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-center">
                <div className="text-xs font-medium text-[var(--foreground-secondary)] mb-1">Right Cylinder</div>
                <MathRenderer content="$V = \pi r^2 h$" className="text-sm font-bold text-[var(--foreground)]" />
              </div>
              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-center">
                <div className="text-xs font-medium text-[var(--foreground-secondary)] mb-1">Sphere</div>
                <MathRenderer content="$V = \frac{4}{3}\pi r^3$" className="text-sm font-bold text-[var(--foreground)]" />
              </div>
              <div className="p-3 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-center">
                <div className="text-xs font-medium text-[var(--foreground-secondary)] mb-1">Right Cone</div>
                <MathRenderer content="$V = \frac{1}{3}\pi r^2 h$" className="text-sm font-bold text-[var(--foreground)]" />
              </div>
            </div>
          </div>

          {/* Key Facts */}
          <div className="p-4 bg-[var(--surface-soft)] rounded-xl text-xs text-[var(--foreground)] space-y-1.5 border border-[var(--border)]">
            <div className="font-bold text-[var(--foreground)]">Key Digital SAT Facts:</div>
            <ul className="list-disc list-inside space-y-0.5 text-[var(--foreground-secondary)]">
              <li>The number of degrees of arc in a circle is 360°.</li>
              <li>The number of radians of arc in a circle is $2\pi$.</li>
              <li>The sum of the measures in degrees of the angles of a triangle is 180°.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--brand-soft)] border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Close Reference Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
