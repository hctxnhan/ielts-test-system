'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Question, ScoringStrategy } from '@/lib/types';
import MultipleChoiceEditor from './question-editors/multiple-choice-editor';
import CompletionEditor from './question-editors/completion-editor';
import MatchingEditor from './question-editors/matching-editor';
import PickFromListEditor from './question-editors/pick-from-list-editor';
import TrueFalseNotGivenEditor from './question-editors/true-false-not-given-editor';
import MatchingHeadingsEditor from './question-editors/matching-headings-editor';
import ShortAnswerEditor from './question-editors/short-answer-editor';
import LabelingEditor from './question-editors/labeling-editor';

// Add imports for writing task editors
import WritingTask1Editor from './question-editors/writing-task1-editor';
import WritingTask2Editor from './question-editors/writing-task2-editor';

interface QuestionEditorProps {
  question: Question;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function QuestionEditor({
  question,
  sectionId,
  onUpdateQuestion
}: QuestionEditorProps) {
  // Determine if the question type supports partial scoring
  const supportsPartialScoring = [
    'completion',
    'matching',
    'labeling',
    'pick-from-list',
    'true-false-not-given',
    'matching-headings',
    'short-answer'
  ].includes(question.type);

  console.log({ question, sectionId, onUpdateQuestion });

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Edit Question</DialogTitle>
        <DialogDescription>Configure the question details.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
          <Textarea
            id={`question-text-${question.id}`}
            value={question.text}
            onChange={(e) =>
              onUpdateQuestion(sectionId, question.id, { text: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`question-points-${question.id}`}>Points</Label>
          <Input
            id={`question-points-${question.id}`}
            type="number"
            value={question.points}
            onChange={(e) =>
              onUpdateQuestion(sectionId, question.id, {
                points: Number.parseInt(e.target.value) || 1
              })
            }
            min="1"
            max="10"
          />
        </div>

        {/* Scoring Strategy Selection - only show for question types that support partial scoring */}
        {supportsPartialScoring && (
          <div className="space-y-2">
            <Label>Scoring Strategy</Label>
            <RadioGroup
              value={question.scoringStrategy || 'partial'}
              onValueChange={(value: ScoringStrategy) =>
                onUpdateQuestion(sectionId, question.id, {
                  scoringStrategy: value
                })
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="partial"
                  id={`scoring-partial-${question.id}`}
                />
                <Label
                  htmlFor={`scoring-partial-${question.id}`}
                  className="cursor-pointer"
                >
                  Partial credit (score based on number of correct answers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="all-or-nothing"
                  id={`scoring-all-${question.id}`}
                />
                <Label
                  htmlFor={`scoring-all-${question.id}`}
                  className="cursor-pointer"
                >
                  All-or-nothing (must be fully correct to get any points)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Question type specific editors */}
        {question.type === 'multiple-choice' && (
          <MultipleChoiceEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'completion' && (
          <CompletionEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'matching' && (
          <MatchingEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'pick-from-list' && (
          <PickFromListEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'true-false-not-given' && (
          <TrueFalseNotGivenEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'matching-headings' && (
          <MatchingHeadingsEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'short-answer' && (
          <ShortAnswerEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'labeling' && (
          <LabelingEditor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {/* Add writing task editors to the component */}
        {question.type === 'writing-task1' && (
          <WritingTask1Editor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        {question.type === 'writing-task2' && (
          <WritingTask2Editor
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}
      </div>
    </DialogContent>
  );
}
