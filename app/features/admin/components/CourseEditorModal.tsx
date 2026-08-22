import React, { useState, useEffect } from 'react';
import { Course, Subject, Lesson } from '../../../types';
import { BookOpen, Video, Plus, Edit3, Trash2 } from 'lucide-react';

interface CourseEditorModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (courseData: any) => void;
  onAddLesson: (courseId: string, lessonData: any) => void;
  onUpdateLesson: (courseId: string, lessonId: string, lessonData: any) => void;
  onDeleteLesson: (courseId: string, lessonId: string) => void;
}

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaveCourse,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
}) => {
  const [tab, setTab] = useState<'info' | 'lessons'>('info');

  // Course Info Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<Subject | 'both'>('math');
  const [level, setLevel] = useState<'All Levels' | 'Intermediate' | 'Advanced 1500+'>('All Levels');
  const [price, setPrice] = useState(2900);
  const [originalPrice, setOriginalPrice] = useState(4900);
  const [badge, setBadge] = useState('Popular');
  const [features, setFeatures] = useState('Full HD Video Lessons\nTargeted Diagnostic Tests\nPDF Study Sheets');
  const [isPublished, setIsPublished] = useState(true);

  // Lesson Form Sub-State
  const [isLessonSubModalOpen, setIsLessonSubModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lesTitle, setLesTitle] = useState('');
  const [lesDesc, setLesDesc] = useState('');
  const [lesDuration, setLesDuration] = useState(15);
  const [lesVideoUrl, setLesVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [lesFreePreview, setLesFreePreview] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setSubtitle(course.subtitle);
      setDescription(course.description);
      setSubject(course.subject);
      setLevel(course.level);
      setPrice(course.price);
      setOriginalPrice(course.originalPrice);
      setBadge(course.badge || '');
      setFeatures(course.features.join('\n'));
      setIsPublished(course.is_published);
    } else {
      setTitle('New Master Class Pass');
      setSubtitle('Complete SAT Course');
      setDescription('Detailed masterclass covering core SAT strategies, video breakdown, and diagnostic quizzes.');
      setSubject('math');
      setLevel('All Levels');
      setPrice(2900);
      setOriginalPrice(4900);
      setBadge('New');
      setFeatures('Full HD Video Lessons\nKaTeX Practice Quizzes\nFormula Sheets');
      setIsPublished(true);
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSubmitCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const featList = features.split('\n').map((f) => f.trim()).filter(Boolean);

    onSaveCourse({
      id: course?.id,
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
    });
    onClose();
  };

  const handleSaveLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (editingLesson) {
      onUpdateLesson(course.id, editingLesson.id, {
        title: lesTitle.trim(),
        description: lesDesc.trim(),
        durationMinutes: Number(lesDuration),
        videoUrl: lesVideoUrl.trim(),
        isFreePreview: lesFreePreview,
      });
    } else {
      onAddLesson(course.id, {
        title: lesTitle.trim(),
        description: lesDesc.trim(),
        durationMinutes: Number(lesDuration),
        videoUrl: lesVideoUrl.trim(),
        isFreePreview: lesFreePreview,
        order: course.lessons.length + 1,
      });
    }
    setIsLessonSubModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D918A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {course ? `Edit Course (${course.title})` : 'Create New Course'}
              </h3>
              <p className="text-[10px] text-teal-100">Course & Video Lesson Hierarchy Manager</p>
            </div>
          </div>

          <button onClick={onClose} className="text-teal-100 hover:text-white cursor-pointer font-bold">
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex gap-4 border-b border-slate-200 text-xs font-bold bg-slate-50">
          <button
            onClick={() => setTab('info')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              tab === 'info'
                ? 'border-[#0D918A] text-[#0D918A] font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Course Metadata & Pricing
          </button>

          {course && (
            <button
              onClick={() => setTab('lessons')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'lessons'
                  ? 'border-[#0D918A] text-[#0D918A] font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Curriculum & Lessons ({course.lessons.length})</span>
            </button>
          )}
        </div>

        {/* Body */}
        {tab === 'info' ? (
          <form onSubmit={handleSubmitCourse} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Course Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Scope</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
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
                  className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
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
                className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="cPublish"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded text-[#0D918A]"
              />
              <label htmlFor="cPublish" className="font-bold text-slate-700">
                Publish Course to Student Catalog
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
                {course ? 'Update Course Metadata' : 'Create Course'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-sm">
                Curriculum Hierarchy ({course?.lessons.length} Lessons)
              </div>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setLesTitle(`Lesson ${(course?.lessons.length || 0) + 1}: Key Strategy`);
                  setLesDesc('Diagnostic breakdown of SAT concepts');
                  setLesDuration(15);
                  setLesVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
                  setLesFreePreview(false);
                  setIsLessonSubModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video Lesson</span>
              </button>
            </div>

            <div className="space-y-2">
              {course?.lessons.map((les) => (
                <div
                  key={les.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>#{les.order}</span>
                      <span>{les.title}</span>
                      {les.isFreePreview && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">
                          Free Preview
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">{les.description}</div>
                    <div className="text-[10px] font-mono text-slate-400">{les.durationMinutes} mins • Embed: {les.videoUrl}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingLesson(les);
                        setLesTitle(les.title);
                        setLesDesc(les.description);
                        setLesDuration(les.durationMinutes);
                        setLesVideoUrl(les.videoUrl || '');
                        setLesFreePreview(les.isFreePreview);
                        setIsLessonSubModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-[#0D918A] cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete lesson "${les.title}"?`) && course) {
                          onDeleteLesson(course.id, les.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lesson Sub-Modal */}
        {isLessonSubModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  {editingLesson ? 'Edit Video Lesson' : 'Add New Video Lesson'}
                </h4>
                <button onClick={() => setIsLessonSubModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveLessonSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={lesTitle}
                    onChange={(e) => setLesTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={lesDesc}
                    onChange={(e) => setLesDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={lesDuration}
                      onChange={(e) => setLesDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Video Stream URL</label>
                    <input
                      type="text"
                      required
                      value={lesVideoUrl}
                      onChange={(e) => setLesVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="freePreviewCheckSub"
                    checked={lesFreePreview}
                    onChange={(e) => setLesFreePreview(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D918A]"
                  />
                  <label htmlFor="freePreviewCheckSub" className="font-bold text-slate-700">
                    Free Preview Lesson
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLessonSubModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0D918A] hover:bg-[#087C76] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {editingLesson ? 'Update Lesson' : 'Add Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
