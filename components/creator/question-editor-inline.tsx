"use client";
import React from "react";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@testComponents/components/ui/card";
import type { Question, ScoringStrategy } from "@testComponents/lib/types";
import type { FileObject } from "@testComponents/lib/supabase-storage";
import { BarChart2, MessageSquare, Image } from "lucide-react";
import FilePicker from "@testComponents/components/file-picker";
import MultipleChoiceEditor from "./question-editors/multiple-choice-editor";
import CompletionEditor from "./question-editors/completion-editor";
import MatchingEditor from "./question-editors/matching-editor";
import PickFromListEditor from "./question-editors/pick-from-list-editor";
import TrueFalseNotGivenEditor from "./question-editors/true-false-not-given-editor";
import MatchingHeadingsEditor from "./question-editors/matching-headings-editor";
import ShortAnswerEditor from "./question-editors/short-answer-editor";
import LabelingEditor from "./question-editors/labeling-editor";
import WritingTask1Editor from "./question-editors/writing-task1-editor";
import WritingTask2Editor from "./question-editors/writing-task2-editor";
import SentenceTranslationEditor from "./question-editors/sentence-translation-editor";
import WordFormEditor from "./question-editors/word-form-editor";
import YesNoNotGivenEditor from "./question-editors/yes-no-not-given-editor";

interface QuestionEditorInlineProps {
  question: Question;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => void;
}

export default function QuestionEditorInline({
  question,
  sectionId,
  onUpdateQuestion,
}: QuestionEditorInlineProps) {
  const supportsPartialScoring = [
    "completion",
    "matching",
    "labeling",
    "pick-from-a-list",
    "true-false-not-given",
    "matching-headings",
    "short-answer",
    "sentence-translation",
    "word-form",
  ].includes(question.type);

  return (
    <Card className="mt-2">
      <CardHeader className="py-3">
        <CardTitle className="text-base">Question Details</CardTitle>
        <CardDescription className="text-xs">
          Configure the question settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-3">        <div className="space-y-1.5">
          <Label
            htmlFor={`question-text-${question.id}`}
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <MessageSquare className="h-3 w-3" />
            Question Text
          </Label>
          <RichTextEditor
            id={`question-text-${question.id}`}
            value={question.text}
            onChange={(content) =>
              onUpdateQuestion(sectionId, question.id, { text: content })
            }
            placeholder="Enter your question text here..."
            minHeight={120}
            maxHeight={400}
            className="text-sm"
          />
        </div>

        {/* Optional Image Field */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Image className="h-3 w-3" />
            Question Image (Optional)
          </Label>
          <FilePicker
            fileType="image"
            currentFileUrl={question.imageUrl}
            onFileSelect={(file: FileObject) =>
              onUpdateQuestion(sectionId, question.id, { 
                imageUrl: file.url || undefined 
              })
            }
          />
        </div>

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

          {question.type === "pick-from-a-list" && (
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

          {question.type === "yes-no-not-given" && (
            <YesNoNotGivenEditor
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

          {/* Writing task editors */}
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

          {question.type === "sentence-translation" && (
            <SentenceTranslationEditor
              question={question}
              sectionId={sectionId}
              onUpdateQuestion={onUpdateQuestion}
            />
          )}

          {question.type === "word-form" && (
            <WordFormEditor
              value={question}
              onChange={(value) => onUpdateQuestion(sectionId, question.id, value)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
