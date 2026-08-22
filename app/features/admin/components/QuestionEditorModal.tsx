import React, { useState, useEffect } from 'react';
import { Question, Subject, Domain, Difficulty } from '../../../types';
import { MathRenderer } from '../../../components/MathRenderer';
import { Database, Eye } from 'lucide-react';

interface QuestionEditorModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: any) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('M-ALG-100');
  const [subject, setSubject] = useState<Subject>('math');
  const [domain, setDomain] = useState<Domain>('algebra');
  const [topic, setTopic] = useState('Linear Equations');
  const [subtopic, setSubtopic] = useState('Solving Systems');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isFree, setIsFree] = useState(true);
  const [questionText, setQuestionText] = useState('If $$3x - 7 = 14$$, what is the value of $$x$$?');
  const [choiceA, setChoiceA] = useState('$$x = 5$$');
  const [choiceB, setChoiceB] = useState('$$x = 7$$');
  const [choiceC, setChoiceC] = useState('$$x = 8$$');
  const [choiceD, setChoiceD] = useState('$$x = 10$$');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [explanation, setExplanation] = useState('Add 7: $$3x = 21$$. Divide by 3: $$x = 7$$.');

  useEffect(() => {
    if (question) {
      setCode(question.code);
      setSubject(question.subject);
      setDomain(question.domain);
      setTopic(question.topic);
      setSubtopic(question.subtopic);
      setDifficulty(question.difficulty);
      setIsFree(question.is_free);
      setQuestionText(question.question_text);
      const choices = question.choices || question.answer_choices || [];
      setChoiceA(choices.find((c) => c.id === 'A')?.text || '');
      setChoiceB(choices.find((c) => c.id === 'B')?.text || '');
      setChoiceC(choices.find((c) => c.id === 'C')?.text || '');
      setChoiceD(choices.find((c) => c.id === 'D')?.text || '');
      setCorrectAnswer(question.correct_answer);
      setExplanation(question.explanation);
    } else {
      setCode(`M-ALG-${Math.floor(100 + Math.random() * 900)}`);
      setSubject('math');
      setDomain('algebra');
      setTopic('Linear Equations');
      setSubtopic('Systems of Equations');
      setDifficulty('medium');
      setIsFree(true);
      setQuestionText('If $$2x + 5 = 19$$, what is the value of $$x$$?');
      setChoiceA('$$x = 5$$');
      setChoiceB('$$x = 7$$');
      setChoiceC('$$x = 9$$');
      setChoiceD('$$x = 12$$');
      setCorrectAnswer('B');
      setExplanation('Subtract 5: $$2x = 14$$. Divide by 2: $$x = 7$$. Choice B is correct.');
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const choicesPayload = [
      { id: 'A' as const, text: choiceA.trim() },
      { id: 'B' as const, text: choiceB.trim() },
      { id: 'C' as const, text: choiceC.trim() },
      { id: 'D' as const, text: choiceD.trim() },
    ];

    onSave({
      id: question?.id,
      code: code.trim(),
      subject,
      section: subject === 'math' ? 'Math' : 'Reading & Writing',
      domain,
      topic: topic.trim(),
      subtopic: subtopic.trim(),
      difficulty,
      is_free: isFree,
      question_text: questionText.trim(),
      choices: choicesPayload,
      answer_choices: choicesPayload,
      correct_answer: correctAnswer,
      explanation: explanation.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D918A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">
              {question ? `Edit SAT Question (${question.code})` : 'Create New SAT Question'}
            </h3>
          </div>

          <button onClick={onClose} className="text-teal-100 hover:text-white cursor-pointer font-bold">
            ✕
          </button>
        </div>

        {/* Split Pane Editor */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Form Inputs */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-4 border-r border-slate-200 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    const subj = e.target.value as Subject;
                    setSubject(subj);
                    setDomain(subj === 'math' ? 'algebra' : 'information_ideas');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                >
                  <option value="math">Math</option>
                  <option value="reading_writing">Reading & Writing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtopic</label>
                <input
                  type="text"
                  required
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                >
                  {subject === 'math' ? (
                    <>
                      <option value="algebra">Algebra</option>
                      <option value="advanced_math">Advanced Math</option>
                      <option value="problem_solving_data_analysis">Problem-Solving</option>
                      <option value="geometry_trigonometry">Geometry & Trig</option>
                    </>
                  ) : (
                    <>
                      <option value="information_ideas">Information & Ideas</option>
                      <option value="craft_structure">Craft & Structure</option>
                      <option value="expression_ideas">Expression of Ideas</option>
                      <option value="standard_english_conventions">English Conventions</option>
                    </>
                  )}
                </select>
              </div>

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
                <label className="block font-bold text-slate-700 mb-1">Tier</label>
                <select
                  value={isFree ? 'free' : 'premium'}
                  onChange={(e) => setIsFree(e.target.value === 'free')}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                >
                  <option value="free">Free Tier</option>
                  <option value="premium">Premium Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Question Text (KaTeX $$ supported)</label>
              <textarea
                rows={3}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choice A</label>
                <input
                  type="text"
                  required
                  value={choiceA}
                  onChange={(e) => setChoiceA(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choice B</label>
                <input
                  type="text"
                  required
                  value={choiceB}
                  onChange={(e) => setChoiceB(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choice C</label>
                <input
                  type="text"
                  required
                  value={choiceC}
                  onChange={(e) => setChoiceC(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choice D</label>
                <input
                  type="text"
                  required
                  value={choiceD}
                  onChange={(e) => setChoiceD(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Correct Choice</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-bold"
                >
                  <option value="A">Choice A</option>
                  <option value="B">Choice B</option>
                  <option value="C">Choice C</option>
                  <option value="D">Choice D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">KaTeX Explanation</label>
              <textarea
                rows={2}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          {/* Right Live Preview Pane */}
          <div className="w-full md:w-1/2 p-6 bg-slate-50 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#0D918A] font-bold uppercase tracking-wider text-[11px]">
              <Eye className="w-4 h-4" />
              <span>Real-Time KaTeX Render Preview</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <div className="font-mono font-bold text-xs text-[#0D918A]">
                [{code}] • {topic} ({difficulty.toUpperCase()})
              </div>

              <div className="text-slate-900 text-sm">
                <MathRenderer content={questionText || 'Question text...'} />
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {[
                  { id: 'A', text: choiceA },
                  { id: 'B', text: choiceB },
                  { id: 'C', text: choiceC },
                  { id: 'D', text: choiceD },
                ].map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      c.id === correctAnswer
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center text-[10px] font-mono font-bold">
                      {c.id}
                    </span>
                    <MathRenderer content={c.text || '...'} />
                  </div>
                ))}
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px]">
                <div className="font-bold text-teal-900 mb-1">Explanation Preview:</div>
                <MathRenderer content={explanation || 'Explanation steps...'} />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {question ? 'Update Question' : 'Save Question to Bank'}
          </button>
        </div>
      </div>
    </div>
  );
};
