import React, { useState } from 'react';
import Link from 'next/link';
import { Question, Subject, Domain, Difficulty } from '../../../types';
import { MathRenderer } from '../../../components/MathRenderer';
import {
  ArrowLeft,
  Database,
  Save,
  Eye,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Code2,
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

  // Content Fields
  const [questionText, setQuestionText] = useState(
    initialQuestion?.question_text || 'If $$3x - 7 = 14$$, what is the value of $$x$$?'
  );

  const initialChoices = initialQuestion?.choices || initialQuestion?.answer_choices || [];
  const [choiceA, setChoiceA] = useState(initialChoices.find((c) => c.id === 'A')?.text || '$$x = 5$$');
  const [choiceB, setChoiceB] = useState(initialChoices.find((c) => c.id === 'B')?.text || '$$x = 7$$');
  const [choiceC, setChoiceC] = useState(initialChoices.find((c) => c.id === 'C')?.text || '$$x = 8$$');
  const [choiceD, setChoiceD] = useState(initialChoices.find((c) => c.id === 'D')?.text || '$$x = 10$$');

  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>(
    initialQuestion?.correct_answer || 'B'
  );
  const [explanation, setExplanation] = useState(
    initialQuestion?.explanation || 'Add 7 to both sides: $$3x = 21$$. Divide by 3: $$x = 7$$. Choice B is correct.'
  );

  // Active target field for math toolbar insertion
  const [targetField, setTargetField] = useState<
    'questionText' | 'choiceA' | 'choiceB' | 'choiceC' | 'choiceD' | 'explanation'
  >('questionText');

  // Math symbol insertion helper
  const insertMathSnippet = (mathSnippet: string) => {
    switch (targetField) {
      case 'questionText':
        setQuestionText((prev) => prev + ' ' + mathSnippet);
        break;
      case 'choiceA':
        setChoiceA((prev) => prev + ' ' + mathSnippet);
        break;
      case 'choiceB':
        setChoiceB((prev) => prev + ' ' + mathSnippet);
        break;
      case 'choiceC':
        setChoiceC((prev) => prev + ' ' + mathSnippet);
        break;
      case 'choiceD':
        setChoiceD((prev) => prev + ' ' + mathSnippet);
        break;
      case 'explanation':
        setExplanation((prev) => prev + ' ' + mathSnippet);
        break;
    }
  };

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

  // Preset Visual Math Symbols Toolbar Items
  const mathSymbols = [
    { label: 'Fraction (a/b)', snippet: '$$\\frac{a}{b}$$', desc: 'Fractions' },
    { label: 'Exponent (x²)', snippet: '$$x^2$$', desc: 'Power / Square' },
    { label: 'Square Root (√x)', snippet: '$$\\sqrt{x}$$', desc: 'Root' },
    { label: 'Subscript (x₁)', snippet: '$$x_1$$', desc: 'Subscript' },
    { label: 'Plus-Minus (±)', snippet: '$$\\pm$$', desc: 'Plus-Minus' },
    { label: 'Not Equal (≠)', snippet: '$$\\neq$$', desc: 'Not Equal' },
    { label: 'Less/Equal (≤)', snippet: '$$\\le$$', desc: 'Inequality' },
    { label: 'Greater/Equal (≥)', snippet: '$$\\ge$$', desc: 'Inequality' },
    { label: 'Times (×)', snippet: '$$\\times$$', desc: 'Multiply' },
    { label: 'Divide (÷)', snippet: '$$\\div$$', desc: 'Divide' },
    { label: 'Pi (π)', snippet: '$$\\pi$$', desc: 'Pi' },
    { label: 'Theta (θ)', snippet: '$$\\theta$$', desc: 'Angle' },
    { label: 'Infinity (∞)', snippet: '$$\\infty$$', desc: 'Infinity' },
    { label: 'Approx (≈)', snippet: '$$\\approx$$', desc: 'Approximate' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#0D918A] text-white px-6 py-4 border-b border-teal-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] text-teal-100 font-bold uppercase tracking-wider">
              Visual Question Builder & Math Editor
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              {initialQuestion ? `Editing Question (${code})` : 'Create New SAT Question'}
            </h1>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-white text-[#0D918A] hover:bg-teal-50 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save to Question Bank</span>
        </button>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: Form & Visual Math Toolbar */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-6 border-r border-slate-200">
          {/* NON-TECHNICAL VISUAL MATH TOOLBAR */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Visual Math Symbol Toolbar (Click to Insert)</span>
              </div>

              {/* Active Target Field Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Target:</span>
                <select
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value as any)}
                  className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-[#0D918A] font-bold rounded-lg text-xs"
                >
                  <option value="questionText">Question Text</option>
                  <option value="choiceA">Choice A</option>
                  <option value="choiceB">Choice B</option>
                  <option value="choiceC">Choice C</option>
                  <option value="choiceD">Choice D</option>
                  <option value="explanation">Explanation</option>
                </select>
              </div>
            </div>

            {/* Clickable Math Preset Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mathSymbols.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertMathSnippet(item.snippet)}
                  className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all cursor-pointer group"
                  title={`Insert ${item.label}`}
                >
                  <div className="font-bold text-xs text-slate-900 group-hover:text-[#0D918A]">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* QUESTION METADATA CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>1. Question Classification</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono font-bold"
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
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
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
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtopic</label>
                  <input
                    type="text"
                    required
                    value={subtopic}
                    onChange={(e) => setSubtopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as Domain)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
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
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
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
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                  >
                    <option value="free">Free Tier</option>
                    <option value="premium">Premium Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* QUESTION CONTENT & CHOICES CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>2. Question Content & Choices</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Toolbar inserts into active target</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Question Text</label>
                  {targetField === 'questionText' && (
                    <span className="text-[10px] text-[#0D918A] font-bold">Active Insert Target</span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onFocus={() => setTargetField('questionText')}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs ${
                    targetField === 'questionText' ? 'border-[#0D918A] ring-2 ring-teal-100' : 'border-slate-300'
                  }`}
                />
              </div>

              {/* Choices List */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-900">Answer Choices & Correct Option</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Choice A</label>
                    <input
                      type="text"
                      required
                      value={choiceA}
                      onFocus={() => setTargetField('choiceA')}
                      onChange={(e) => setChoiceA(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-mono ${
                        targetField === 'choiceA' ? 'border-[#0D918A] ring-2 ring-teal-100' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Choice B</label>
                    <input
                      type="text"
                      required
                      value={choiceB}
                      onFocus={() => setTargetField('choiceB')}
                      onChange={(e) => setChoiceB(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-mono ${
                        targetField === 'choiceB' ? 'border-[#0D918A] ring-2 ring-teal-100' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Choice C</label>
                    <input
                      type="text"
                      required
                      value={choiceC}
                      onFocus={() => setTargetField('choiceC')}
                      onChange={(e) => setChoiceC(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-mono ${
                        targetField === 'choiceC' ? 'border-[#0D918A] ring-2 ring-teal-100' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Choice D</label>
                    <input
                      type="text"
                      required
                      value={choiceD}
                      onFocus={() => setTargetField('choiceD')}
                      onChange={(e) => setChoiceD(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-mono ${
                        targetField === 'choiceD' ? 'border-[#0D918A] ring-2 ring-teal-100' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer Selection</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCorrectAnswer(opt)}
                        className={`py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                          correctAnswer === opt
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Option {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explanation Text */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Step-by-Step Explanation</label>
                  {targetField === 'explanation' && (
                    <span className="text-[10px] text-[#0D918A] font-bold">Active Insert Target</span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  value={explanation}
                  onFocus={() => setTargetField('explanation')}
                  onChange={(e) => setExplanation(e.target.value)}
                  className={`w-full px-3.5 py-2.5 border rounded-xl font-mono text-xs ${
                    targetField === 'explanation' ? 'border-[#0D918A] ring-2 ring-teal-100' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Real-time Render Visual Canvas */}
        <div className="w-full lg:w-1/2 p-6 bg-slate-100 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Real-Time SAT Math Render Canvas</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Live Student Experience</span>
          </div>

          {/* SAT Practice Card Visual Render */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
            <div className="flex items-center justify-between font-mono font-bold text-xs">
              <span className="text-[#0D918A]">[{code}] • {topic}</span>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded uppercase text-[10px]">
                {difficulty}
              </span>
            </div>

            {/* Question Text KaTeX Render */}
            <div className="text-slate-900 text-sm leading-relaxed p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <MathRenderer content={questionText || 'Question text...'} />
            </div>

            {/* Answer Choices Visual Render */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {[
                { id: 'A', text: choiceA },
                { id: 'B', text: choiceB },
                { id: 'C', text: choiceC },
                { id: 'D', text: choiceD },
              ].map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    c.id === correctAnswer
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-extrabold ${
                      c.id === correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {c.id}
                  </span>
                  <MathRenderer content={c.text || '...'} />
                </div>
              ))}
            </div>

            {/* Explanation KaTeX Visual Render */}
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs space-y-1.5">
              <div className="font-extrabold text-[#0D918A] flex items-center gap-1.5">
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
