import React, { useState, useEffect } from 'react';
import { MockTest, Difficulty } from '../../../types';
import { Award } from 'lucide-react';

interface MockTestEditorModalProps {
  mockTest: MockTest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mockData: any) => void;
}

export const MockTestEditorModal: React.FC<MockTestEditorModalProps> = ({
  mockTest,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [totalQuestions, setTotalQuestions] = useState(98);
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(134);
  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    if (mockTest) {
      setTitle(mockTest.title);
      setDescription(mockTest.description);
      setDifficulty(mockTest.difficulty);
      setTotalQuestions(mockTest.totalQuestions);
      setTotalTimeMinutes(mockTest.totalTimeMinutes);
      setIsFree(mockTest.is_free);
    } else {
      setTitle('Digital SAT Practice Test #2');
      setDescription('Full-length adaptive style diagnostic mock test with timed modules.');
      setDifficulty('medium');
      setTotalQuestions(98);
      setTotalTimeMinutes(134);
      setIsFree(false);
    }
  }, [mockTest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: mockTest?.id,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      totalQuestions: Number(totalQuestions),
      totalTimeMinutes: Number(totalTimeMinutes),
      is_free: isFree,
      modules: mockTest?.modules || [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D918A] text-white flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {mockTest ? 'Edit Digital SAT Mock Test' : 'Add New Digital SAT Mock Test'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Questions</label>
              <input
                type="number"
                required
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Time (Mins)</label>
              <input
                type="number"
                required
                value={totalTimeMinutes}
                onChange={(e) => setTotalTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="mFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D918A]"
            />
            <label htmlFor="mFree" className="font-bold text-slate-700">
              Free Diagnostic Mock Test
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {mockTest ? 'Update Mock Test' : 'Save Mock Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
