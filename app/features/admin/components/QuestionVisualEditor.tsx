import React, { useState } from 'react';
import Link from 'next/link';
import { Question, Subject, Domain, Difficulty } from '../../../types';
import { MathRenderer } from '../../../components/MathRenderer';
import { TiptapRichMathEditor } from '../../../components/TiptapRichMathEditor';
import {
  ArrowLeft,
  Database,
  Save,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface QuestionVisualEditorProps {
  initialQuestion?: Question | null;
  onSave: (questionData: any) => void;
}

export const QuestionVisualEditor: React.FC<QuestionVisualEditorProps> = ({
  initialQuestion,
  onSave,
}) => {
  // Metadata State
  const [code, setCode] = useState(
    initialQuestion?.code || `M-ALG-${Math.floor(100 + Math.random() * 900)}`
  );
  const [subject, setSubject] = useState<Subject>(initialQuestion?.subject || 'math');
  const [domain, setDomain] = useState<Domain>(initialQuestion?.domain || 'algebra');
  const [topic, setTopic] = useState(initialQuestion?.topic || 'Linear Equations');
  const [subtopic, setSubtopic] = useState(initialQuestion?.subtopic || 'Solving Systems');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialQuestion?.difficulty || 'medium');
  const [isFree, setIsFree] = useState(initialQuestion?.is_free ?? true);

  // Content Fields - Using inline math $...$ by default
  const [questionText, setQuestionText] = useState(
    initialQuestion?.question_text || 'If $3x - 7 = 14$, what is the value of $x$?'
  );

  const initialChoices = initialQuestion?.choices || initialQuestion?.answer_choices || [];
  const [choiceA, setChoiceA] = useState(initialChoices.find((c) => c.id === 'A')?.text || '$x = 5$');
  const [choiceB, setChoiceB] = useState(initialChoices.find((c) => c.id === 'B')?.text || '$x = 7$');
  const [choiceC, setChoiceC] = useState(initialChoices.find((c) => c.id === 'C')?.text || '$x = 8$');
  const [choiceD, setChoiceD] = useState(initialChoices.find((c) => c.id === 'D')?.text || '$x = 10$');

  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>(
    initialQuestion?.correct_answer || 'B'
  );
  const [explanation, setExplanation] = useState(
    initialQuestion?.explanation || 'Add 7 to both sides: $3x = 21$. Divide by 3: $x = 7$. Choice B is correct.'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const choicesPayload = [
      { id: 'A' as const, text: choiceA.trim() },
      { id: 'B' as const, text: choiceB.trim() },
      { id: 'C' as const, text: choiceC.trim() },
      { id: 'D' as const, text: choiceD.trim() },
    ];

    const payload = {
      id: initialQuestion?.id,
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
    };

    onSave(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-[#0D918A] text-white px-6 py-3.5 border-b border-teal-800 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] text-teal-100 font-bold uppercase tracking-wider">
              Visual Question Builder
            </div>
            <h1 className="text-base font-extrabold tracking-tight text-white">
              {initialQuestion ? `Edit Question: ${code}` : 'Create New SAT Question'}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-white text-[#0D918A] hover:bg-teal-50 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Question</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: Clean Form Controls */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-6 border-r border-slate-200">
          {/* 1. CLASSIFICATION CARD */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>Classification & Attributes</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    const subj = e.target.value as Subject;
                    setSubject(subj);
                    setDomain(subj === 'math' ? 'algebra' : 'information_ideas');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-xl font-medium"
                >
                  <option value="math">Math</option>
                  <option value="reading_writing">Reading & Writing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as Domain)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-xl font-medium"
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
                <label className="block font-semibold text-slate-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-xl font-medium"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Access Tier</label>
                <select
                  value={isFree ? 'free' : 'premium'}
                  onChange={(e) => setIsFree(e.target.value === 'free')}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-xl font-medium"
                >
                  <option value="free">Free Tier</option>
                  <option value="premium">Premium Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. QUESTION TEXT */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-2xs">
            <TiptapRichMathEditor
              label="Question Text"
              value={questionText}
              onChange={setQuestionText}
              placeholder="Type question content. Wrap inline math in $...$ e.g. $2x + 5 = 15$"
              rows={3}
            />
          </div>

          {/* 3. CLEAN CHOICES & CORRECT ANSWER SELECTOR */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs">Answer Choices & Correct Option</label>
              <span className="text-[11px] text-slate-400 font-mono">Wrap math in $...$</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { id: 'A', val: choiceA, setVal: setChoiceA },
                { id: 'B', val: choiceB, setVal: setChoiceB },
                { id: 'C', val: choiceC, setVal: setChoiceC },
                { id: 'D', val: choiceD, setVal: setChoiceD },
              ].map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    correctAnswer === c.id
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Radio Correct Button */}
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(c.id as any)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                      correctAnswer === c.id
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-300 hover:border-emerald-500'
                    }`}
                    title={`Mark Choice ${c.id} as correct answer`}
                  >
                    {c.id}
                  </button>

                  <input
                    type="text"
                    required
                    value={c.val}
                    onChange={(e) => c.setVal(e.target.value)}
                    placeholder={`Choice ${c.id} text...`}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0D918A]"
                  />

                  {correctAnswer === c.id && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full shrink-0">
                      Correct Choice
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. SOLUTION EXPLANATION */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-2xs">
            <TiptapRichMathEditor
              label="Step-by-Step Solution & Explanation"
              value={explanation}
              onChange={setExplanation}
              placeholder="Explain solution steps..."
              rows={3}
            />
          </div>
        </div>

        {/* RIGHT PANE: Clean Live Preview Canvas */}
        <div className="w-full lg:w-1/2 p-6 bg-slate-100 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Real-Time SAT Preview</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Live Render</span>
          </div>

          {/* Live Preview Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between font-mono font-bold text-xs">
              <span className="text-[#0D918A]">[{code}] • {topic}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded uppercase text-[10px]">
                {difficulty}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-slate-900 text-sm leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-200">
              <MathRenderer content={questionText || 'Question text...'} />
            </div>

            {/* Answer Choices */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              {[
                { id: 'A', text: choiceA },
                { id: 'B', text: choiceB },
                { id: 'C', text: choiceC },
                { id: 'D', text: choiceD },
              ].map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    c.id === correctAnswer
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      c.id === correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {c.id}
                  </span>
                  <MathRenderer content={c.text || '...'} />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 text-xs space-y-1.5">
              <div className="font-bold text-[#0D918A] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Explanation & Solution Steps</span>
              </div>
              <div className="text-slate-800 leading-relaxed">
                <MathRenderer content={explanation || 'Solution steps...'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
