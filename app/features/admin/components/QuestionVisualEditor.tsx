'use client';

import React from 'react';
import { Question } from '../../../types';
import { Eye, Plus } from 'lucide-react';
import { EditorShell, EditorPanes } from './EditorShell';
import { Pill } from './ui';
import { useQuestionForm, QuestionFormFields, QuestionPreview } from './questionForm';

interface QuestionVisualEditorProps {
  initialQuestion?: Question | null;
  /** The rest of the bank — powers code suggestions, duplicate warnings, and datalists. */
  allQuestions: Question[];
  onSave: (questionData: Record<string, unknown>) => void;
  /** Save and reset the form for the next question — used when authoring in bulk. */
  onSaveAndNew?: (questionData: Record<string, unknown>) => void;
}

export const QuestionVisualEditor: React.FC<QuestionVisualEditorProps> = ({
  initialQuestion,
  allQuestions,
  onSave,
  onSaveAndNew,
}) => {
  const ctl = useQuestionForm({ initialQuestion, allQuestions, idScope: 'editor' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ctl.markSaved();
    onSave(ctl.buildPayload());
  };

  const handleSaveAndNew = () => {
    // The form owns validation; check it here too so this path cannot skip it.
    const formEl = document.getElementById('question-form') as HTMLFormElement | null;
    if (formEl && !formEl.reportValidity()) return;
    onSaveAndNew?.(ctl.buildPayload());
    ctl.reset(true);
  };

  return (
    <EditorShell
      eyebrow="Question bank"
      title={initialQuestion ? `Edit ${initialQuestion.code}` : 'New question'}
      backTab="questions"
      formId="question-form"
      saveLabel={initialQuestion ? 'Save changes' : 'Save question'}
      isDirty={ctl.isDirty}
      secondaryAction={
        !initialQuestion && onSaveAndNew
          ? { label: 'Save & add another', icon: Plus, onClick: handleSaveAndNew }
          : undefined
      }
    >
      <EditorPanes
        form={
          <form id="question-form" onSubmit={handleSubmit} className="space-y-4">
            <QuestionFormFields ctl={ctl} variant="full" />
          </form>
        }
        preview={
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#58708A]">
                <Eye className="w-4 h-4" />
                <span>Student preview</span>
              </div>
              {ctl.form.status !== 'published' && <Pill tone="warning">{ctl.form.status}</Pill>}
            </div>

            <QuestionPreview ctl={ctl} />
          </div>
        }
      />
    </EditorShell>
  );
};
