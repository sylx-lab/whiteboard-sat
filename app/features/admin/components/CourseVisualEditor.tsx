import React, { useState } from 'react';
import Link from 'next/link';
import { Course, Subject, Lesson } from '../../../types';
import {
  ArrowLeft,
  BookOpen,
  Video,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Eye,
  Sparkles,
  Play,
  Layers,
  Save,
} from 'lucide-react';

interface CourseVisualEditorProps {
  initialCourse?: Course | null;
  onSave: (courseData: any) => void;
  onAddLesson?: (courseId: string, lessonData: any) => void;
  onUpdateLesson?: (courseId: string, lessonId: string, lessonData: any) => void;
  onDeleteLesson?: (courseId: string, lessonId: string) => void;
}

export const CourseVisualEditor: React.FC<CourseVisualEditorProps> = ({
  initialCourse,
  onSave,
}) => {
  // Metadata Form State
  const [title, setTitle] = useState(initialCourse?.title || 'SAT Math 800: Masterclass');
  const [subtitle, setSubtitle] = useState(initialCourse?.subtitle || 'Complete Digital SAT Math Strategy & System');
  const [description, setDescription] = useState(
    initialCourse?.description ||
      'Comprehensive preparation for Digital SAT Math covering Algebra, Advanced Math, Problem-Solving, and Geometry with Desmos graphing calculator hacks.'
  );
  const [subject, setSubject] = useState<Subject | 'both'>(initialCourse?.subject || 'math');
  const [level, setLevel] = useState<'All Levels' | 'Intermediate' | 'Advanced 1500+'>(
    initialCourse?.level || 'All Levels'
  );
  const [price, setPrice] = useState(initialCourse?.price || 3500);
  const [originalPrice, setOriginalPrice] = useState(initialCourse?.originalPrice || 5000);
  const [badge, setBadge] = useState(initialCourse?.badge || 'Best Seller');
  const [features, setFeatures] = useState(
    initialCourse?.features.join('\n') ||
      'Full HD Video Breakdowns\nTargeted Diagnostic Quizzes\nFormula Cheat Sheets\nDesmos Hacks'
  );
  const [isPublished, setIsPublished] = useState(initialCourse?.is_published ?? true);

  // Lessons Hierarchy State
  const [lessons, setLessons] = useState<Lesson[]>(
    initialCourse?.lessons || [
      {
        id: 'les-1',
        courseId: initialCourse?.id || 'new',
        title: 'Lesson 1: Digital SAT Math Blueprint & Timing Protocol',
        description: 'Module structure breakdown, pacing rules, and high-yield topic distribution.',
        durationMinutes: 18,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        isFreePreview: true,
        order: 1,
      },
      {
        id: 'les-2',
        courseId: initialCourse?.id || 'new',
        title: 'Lesson 2: Desmos Speed Graphing & System Hacks',
        description: 'How to solve 40% of SAT Math questions directly inside Desmos without pencil algebra.',
        durationMinutes: 24,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        isFreePreview: false,
        order: 2,
      },
    ]
  );

  // Lesson Edit Sub-State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lesTitle, setLesTitle] = useState('');
  const [lesDesc, setLesDesc] = useState('');
  const [lesDuration, setLesDuration] = useState(15);
  const [lesVideoUrl, setLesVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [lesFreePreview, setLesFreePreview] = useState(false);
  const [activePreviewLessonId, setActivePreviewLessonId] = useState<string | null>('les-1');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const featList = features.split('\n').map((f) => f.trim()).filter(Boolean);

    const payload = {
      id: initialCourse?.id,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subtitle: subtitle.trim(),
      description: description.trim(),
      subject,
      level,
      price: Number(price),
      originalPrice: Number(originalPrice),
      badge: badge.trim(),
      features: featList,
      is_published: isPublished,
      lessonsCount: lessons.length,
      totalHours: Math.round((lessons.reduce((sum, l) => sum + l.durationMinutes, 0) / 60) * 10) / 10,
      lessons,
    };

    onSave(payload);
  };

  const handleAddLessonBlock = () => {
    const newLes: Lesson = {
      id: `les-${Date.now()}`,
      courseId: initialCourse?.id || 'new',
      title: `Lesson ${lessons.length + 1}: Core Strategy Module`,
      description: 'Step-by-step diagnostic breakdown and formula applications.',
      durationMinutes: 15,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      isFreePreview: false,
      order: lessons.length + 1,
    };
    setLessons([...lessons, newLes]);
    setEditingLessonId(newLes.id);
    setLesTitle(newLes.title);
    setLesDesc(newLes.description);
    setLesDuration(newLes.durationMinutes);
    setLesVideoUrl(newLes.videoUrl || '');
    setLesFreePreview(newLes.isFreePreview);
  };

  const handleSaveLessonBlock = () => {
    if (!editingLessonId) return;
    setLessons(
      lessons.map((l) =>
        l.id === editingLessonId
          ? {
              ...l,
              title: lesTitle.trim(),
              description: lesDesc.trim(),
              durationMinutes: Number(lesDuration),
              videoUrl: lesVideoUrl.trim(),
              isFreePreview: lesFreePreview,
            }
          : l
      )
    );
    setEditingLessonId(null);
  };

  const handleDeleteLessonBlock = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  const previewLesson = lessons.find((l) => l.id === activePreviewLessonId) || lessons[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Visual Editor Bar */}
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
              Visual Course & Curriculum Editor
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              {initialCourse ? `Editing: ${title}` : 'Create New Master Course'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold bg-teal-800/60 px-3 py-1.5 rounded-xl border border-teal-200/30 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#0D918A]"
            />
            <span>Published Status</span>
          </label>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-white text-[#0D918A] hover:bg-teal-50 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Course & Curriculum</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANE: Metadata & Visual Curriculum Blocks */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-6 border-r border-slate-200">
          {/* Metadata Section Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>1. Course Metadata & Pricing</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 bg-white text-slate-900 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                  >
                    <option value="math">Math</option>
                    <option value="reading_writing">Reading & Writing</option>
                    <option value="both">Both Subjects</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-medium"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced 1500+">Advanced 1500+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original Price</label>
                  <input
                    type="number"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Curriculum Lesson Blocks Section Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>2. Curriculum Video Lesson Blocks ({lessons.length})</span>
              </div>
              <button
                type="button"
                onClick={handleAddLessonBlock}
                className="px-3.5 py-1.5 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lesson Block</span>
              </button>
            </div>

            <div className="space-y-3">
              {lessons.map((les, index) => (
                <div
                  key={les.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    les.id === activePreviewLessonId
                      ? 'bg-teal-50/60 border-[#0D918A]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {editingLessonId === les.id ? (
                    /* Inline Lesson Editor */
                    <div className="space-y-3 text-xs bg-white p-4 rounded-xl border border-teal-200">
                      <div className="font-bold text-slate-900">Editing Lesson #{index + 1}</div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Lesson Title</label>
                        <input
                          type="text"
                          value={lesTitle}
                          onChange={(e) => setLesTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={lesDesc}
                          onChange={(e) => setLesDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                          <input
                            type="number"
                            value={lesDuration}
                            onChange={(e) => setLesDuration(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Stream URL / Embed</label>
                          <input
                            type="text"
                            value={lesVideoUrl}
                            onChange={(e) => setLesVideoUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`freePrev-${les.id}`}
                          checked={lesFreePreview}
                          onChange={(e) => setLesFreePreview(e.target.checked)}
                          className="w-4 h-4 text-[#0D918A]"
                        />
                        <label htmlFor={`freePrev-${les.id}`} className="font-bold text-slate-700">
                          Free Preview Lesson
                        </label>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingLessonId(null)}
                          className="px-3 py-1.5 border border-slate-300 rounded-xl font-bold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveLessonBlock}
                          className="px-4 py-1.5 bg-[#0D918A] text-white font-bold rounded-xl"
                        >
                          Update Block
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Lesson Summary Card */
                    <div className="flex items-center justify-between gap-4">
                      <div
                        className="space-y-1 cursor-pointer flex-1"
                        onClick={() => setActivePreviewLessonId(les.id)}
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0D918A] flex items-center justify-center text-[10px] font-mono">
                            {index + 1}
                          </span>
                          <span>{les.title}</span>
                          {les.isFreePreview && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded font-bold">
                              Free Preview
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{les.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{les.durationMinutes} mins • {les.videoUrl}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setActivePreviewLessonId(les.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            les.id === activePreviewLessonId ? 'text-[#0D918A] bg-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Preview in Visual Player"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLessonId(les.id);
                            setLesTitle(les.title);
                            setLesDesc(les.description);
                            setLesDuration(les.durationMinutes);
                            setLesVideoUrl(les.videoUrl || '');
                            setLesFreePreview(les.isFreePreview);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#0D918A] rounded-lg cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLessonBlock(les.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Real-Time Interactive Visual Canvas & Player */}
        <div className="w-full lg:w-1/2 p-6 bg-slate-100 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D918A] uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Real-Time Visual Canvas Preview</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Live Student View</span>
          </div>

          {/* Student Catalog Card Visual Render */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-teal-100 text-[#0D918A] font-extrabold text-[11px] rounded-full uppercase">
                {badge || 'Master Pass'}
              </span>
              <span className="text-xs font-bold text-slate-500">{level}</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">{title || 'Course Title'}</h3>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="font-bold text-slate-900">What's included:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {features.split('\n').map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Enrollment Fee</div>
                <div className="flex items-baseline gap-2 font-mono">
                  <span className="text-2xl font-black text-slate-900">৳{price}</span>
                  <span className="text-xs text-slate-400 line-through">৳{originalPrice}</span>
                </div>
              </div>
              <button type="button" className="px-5 py-2.5 bg-[#0D918A] text-white font-extrabold text-xs rounded-xl shadow-xs">
                Enroll Now
              </button>
            </div>
          </div>

          {/* Video Lesson Player Visual Preview */}
          {previewLesson && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase">
                  <Video className="w-4 h-4" />
                  <span>Video Lesson Stream Preview (#{previewLesson.order})</span>
                </div>
                <span className="font-mono text-xs text-slate-400">{previewLesson.durationMinutes} mins</span>
              </div>

              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative">
                {previewLesson.videoUrl ? (
                  <iframe
                    src={previewLesson.videoUrl}
                    title={previewLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Play className="w-10 h-10 text-teal-400 mx-auto opacity-80" />
                    <div className="text-xs text-slate-400 font-mono">No video stream URL provided</div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-white">{previewLesson.title}</h4>
                <p className="text-xs text-slate-400">{previewLesson.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
