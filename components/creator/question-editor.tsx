"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Question, ScoringStrategy } from "@/lib/types";
import { BarChart2, MessageSquare } from "lucide-react";
import MultipleChoiceEditor from "./question-editors/multiple-choice-editor";
import CompletionEditor from "./question-editors/completion-editor";
import MatchingEditor from "./question-editors/matching-editor";
import PickFromListEditor from "./question-editors/pick-from-list-editor";
import TrueFalseNotGivenEditor from "./question-editors/true-false-not-given-editor";
import MatchingHeadingsEditor from "./question-editors/matching-headings-editor";
import ShortAnswerEditor from "./question-editors/short-answer-editor";
import LabelingEditor from "./question-editors/labeling-editor";

// Add imports for writing task editors
import WritingTask1Editor from "./question-editors/writing-task1-editor";
import WritingTask2Editor from "./question-editors/writing-task2-editor";

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
  onUpdateQuestion,
}: QuestionEditorProps) {
  const supportsPartialScoring = [
    "completion",
    "matching",
    "labeling",
    "pick-from-list",
    "true-false-not-given",
    "matching-headings",
    "short-answer",
  ].includes(question.type);

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader className="">
        <DialogTitle className="text-base">Edit Question</DialogTitle>
        <DialogDescription className="text-xs mt-1">
          Configure the question details.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-3 max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <Label
            htmlFor={`question-text-${question.id}`}
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <MessageSquare className="h-3 w-3" />
            Question Text
          </Label>
          <Textarea
            id={`question-text-${question.id}`}
            value={question.text}
            onChange={(e) =>
              onUpdateQuestion(sectionId, question.id, { text: e.target.value })
            }
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        {/* Points field removed as it's always 1 */}

        {/* Scoring Strategy Selection - only show for question types that support partial scoring */}
        {supportsPartialScoring && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <BarChart2 className="h-3 w-3" />
              Scoring Strategy
            </Label>
            <RadioGroup
              value={question.scoringStrategy || "all-or-nothing"}
              onValueChange={(value: ScoringStrategy) =>
                onUpdateQuestion(sectionId, question.id, {
                  scoringStrategy: value,
                })
              }
              className="flex flex-col space-y-1.5"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="partial"
                  id={`scoring-partial-${question.id}`}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={`scoring-partial-${question.id}`}
                  className="cursor-pointer text-xs"
                >
                  Partial credit (score based on number of correct answers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="all-or-nothing"
                  id={`scoring-all-${question.id}`}
                  className="h-3.5 w-3.5"
                />
                <Label
                  htmlFor={`scoring-all-${question.id}`}
                  className="cursor-pointer text-xs"
                >
                  All-or-nothing (must be fully correct to get any points)
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="border-t my-2 pt-2">
          {/* Question type specific editors */}
          {question.type === "multiple-choice" && (
            <MultipleChoiceEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "completion" && (
            <CompletionEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "matching" && (
            <MatchingEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "pick-from-list" && (
            <PickFromListEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "true-false-not-given" && (
            <TrueFalseNotGivenEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "matching-headings" && (
            <MatchingHeadingsEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "short-answer" && (
            <ShortAnswerEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "labeling" && (
            <LabelingEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {/* Add writing task editors to the component */}
          {question.type === "writing-task1" && (
            <WritingTask1Editor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "writing-task2" && (
            <WritingTask2Editor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}
        </div>
      </div>
    </DialogContent>
  );
}
