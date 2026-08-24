'use client';

import React, { useState } from 'react';
import { MockTest, Difficulty } from '../../../types';
import { Award } from 'lucide-react';
import { Modal, Button } from './ui';
import { Field, inputClass, textareaClass } from './EditorShell';

interface MockTestEditorModalProps {
  /** null creates a new mock test. The parent remounts this via `key`, so state
   *  initialises straight from props — no effect syncing props into state. */
  mockTest: MockTest | null;
  onClose: () => void;
  onSave: (mockData: Record<string, unknown>) => void;
}

// Real Digital SAT length — a sensible default, not placeholder content.
const DEFAULT_QUESTIONS = 98;
const DEFAULT_MINUTES = 134;

export const MockTestEditorModal: React.FC<MockTestEditorModalProps> = ({
  mockTest,
  onClose,
  onSave,
}) => {
  // New mock tests start blank so nothing placeholder can be saved by accident.
  const [title, setTitle] = useState(mockTest?.title ?? '');
  const [description, setDescription] = useState(mockTest?.description ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>(mockTest?.difficulty ?? 'medium');
  const [totalQuestions, setTotalQuestions] = useState(mockTest?.totalQuestions ?? DEFAULT_QUESTIONS);
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(
    mockTest?.totalTimeMinutes ?? DEFAULT_MINUTES
  );
  const [isFree, setIsFree] = useState(mockTest?.is_free ?? false);

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
    <Modal
      title={mockTest ? 'Edit mock test' : 'New mock test'}
      subtitle={mockTest ? mockTest.title : 'Timed, module-based Digital SAT exam'}
      icon={Award}
      onClose={onClose}
      footer={
        <>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="mock-test-form" variant="primary">
            {mockTest ? 'Save changes' : 'Save mock test'}
          </Button>
        </>
      }
    >
      <form id="mock-test-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Title">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digital SAT Practice Test 2"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who this mock is for and what it covers."
            className={textareaClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Difficulty">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={inputClass}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </Field>

          <Field label="Questions">
            <input
              type="number"
              required
              min={1}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Field label="Time (minutes)">
            <input
              type="number"
              required
              min={1}
              value={totalTimeMinutes}
              onChange={(e) => setTotalTimeMinutes(Number(e.target.value))}
              className={`${inputClass} font-mono`}
            />
          </Field>
        </div>

        <Field label="Access tier">
          <select
            value={isFree ? 'free' : 'premium'}
            onChange={(e) => setIsFree(e.target.value === 'free')}
            className={inputClass}
          >
            <option value="premium">Premium — paid pass only</option>
            <option value="free">Free diagnostic — any student</option>
          </select>
        </Field>

        {mockTest && mockTest.modules.length === 0 && (
          <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
            This mock has no question modules configured yet, so students cannot sit it.
          </p>
        )}
      </form>
    </Modal>
  );
};
