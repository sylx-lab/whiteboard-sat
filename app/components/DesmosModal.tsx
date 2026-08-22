import React, { useState } from 'react';
import { X, Calculator, RefreshCw, ZoomIn, ZoomOut, HelpCircle } from 'lucide-react';

interface DesmosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesmosModal: React.FC<DesmosModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'graphing' | 'scientific'>('graphing');
  const [customEquation, setCustomEquation] = useState('y = 2x^2 - 4x + 1');
  const [pointTable] = useState<{ x: number; y: number }[]>([
    { x: -2, y: 17 },
    { x: -1, y: 7 },
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: 2, y: 1 },
    { x: 3, y: 7 },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Digital SAT Desmos Graphing Suite</h3>
              <p className="text-xs text-slate-500">Official-grade interactive calculator & equation visualizer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('graphing')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'graphing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Graphing
              </button>
              <button
                onClick={() => setActiveTab('scientific')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'scientific' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scientific Calculations
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls column */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Expression / Function
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customEquation}
                  onChange={(e) => setCustomEquation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. y = mx + b"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500">Quick Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'y = 2x - 3',
                  'y = -x^2 + 4',
                  'y = 3(1.05)^x',
                  'x^2 + y^2 = 25',
                  'y = |2x - 6|',
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCustomEquation(preset)}
                    className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded px-2 py-1 font-mono text-slate-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Values Table</div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-center font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-1 px-2 border-r border-slate-200">x</th>
                      <th className="py-1 px-2">y</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-1 px-2 border-r border-slate-100">{row.x}</td>
                        <td className="py-1 px-2 font-semibold text-teal-600">{row.y}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-200/70 rounded-xl text-[11px] text-teal-900 flex gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                <strong>SAT Tip:</strong> Use the intersect tool or table inspection to quickly find roots ($y=0$) and system solutions.
              </span>
            </div>
          </div>

          {/* Interactive Graph Canvas Area */}
          <div className="md:col-span-2 flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative min-h-[320px]">
            {/* Top Graph Toolbar */}
            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-teal-400">{customEquation}</span>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-slate-700 rounded text-slate-300">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-700 rounded text-slate-300">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCustomEquation('y = 2x^2 - 4x + 1')}
                  className="p-1 hover:bg-slate-700 rounded text-slate-300"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SVG Visual Coordinate Plane */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              <svg className="w-full h-full max-h-[300px]" viewBox="-10 -10 20 20">
                {/* Grid lines */}
                {[-8, -6, -4, -2, 2, 4, 6, 8].map((val) => (
                  <React.Fragment key={val}>
                    <line x1={val} y1="-10" x2={val} y2="10" stroke="#1E293B" strokeWidth="0.08" />
                    <line x1="-10" y1={val} x2="10" y2={val} stroke="#1E293B" strokeWidth="0.08" />
                    <text x={val} y="0.7" fill="#64748B" fontSize="0.5" textAnchor="middle">{val}</text>
                    <text x="-0.7" y={-val + 0.2} fill="#64748B" fontSize="0.5" textAnchor="end">{val}</text>
                  </React.Fragment>
                ))}

                {/* X & Y Axes */}
                <line x1="-10" y1="0" x2="10" y2="0" stroke="#64748B" strokeWidth="0.2" />
                <line x1="0" y1="-10" x2="0" y2="10" stroke="#64748B" strokeWidth="0.2" />

                {/* Parabola representation */}
                <path
                  d="M -3 19 Q 1 -3 5 19"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="0.3"
                  transform="scale(1, -1)"
                />

                {/* Vertex Dot */}
                <circle cx="1" cy="1" r="0.35" fill="#F43F5E" />
                <text x="1.5" y="-1.3" fill="#F43F5E" fontSize="0.6" fontWeight="bold">Vertex (1, -1)</text>

                {/* Y-intercept */}
                <circle cx="0" cy="-1" r="0.3" fill="#10B981" />
                <text x="0.6" y="-1" fill="#10B981" fontSize="0.55">Y-int (0, 1)</text>
              </svg>
            </div>

            <div className="p-2 bg-slate-800/90 border-t border-slate-700 flex justify-between text-[11px] text-slate-400 px-4">
              <span>Domain: [-10, 10]</span>
              <span>Range: [-10, 10]</span>
              <span className="text-emerald-400">Roots: x ≈ 0.29, x ≈ 1.71</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
