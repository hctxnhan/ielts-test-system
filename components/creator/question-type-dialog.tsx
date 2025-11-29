"use client";
import React from "react";
import { Button } from "@testComponents/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@testComponents/components/ui/dialog";
import type { TestType, QuestionType } from "@testComponents/lib/types";
import { Badge } from "@testComponents/components/ui/badge";

interface QuestionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testType: TestType;
  onSelectQuestionType: (type: QuestionType) => void;
}

export default function QuestionTypeDialog({
  open,
  onOpenChange,
  testType,
  onSelectQuestionType,
}: QuestionTypeDialogProps) {
  // Common question types for all test types
  const commonQuestionTypes = [
    {
      type: "multiple-choice" as QuestionType,
      title: "Multiple Choice",
      description: "Select one correct answer",
      icon: "◯",
    },
    {
      type: "completion" as QuestionType,
      title: "Completion",
      description: "Fill in the blanks",
      icon: "▭",
    },
    {
      type: "matching" as QuestionType,
      title: "Matching",
      description: "Match items with options",
      icon: "⇄",
    },
    {
      type: "pick-from-a-list" as QuestionType,
      title: "Pick from List",
      description: "Select options from a list",
      icon: "≡",
    },
  ];

  // Listening-specific question types
  const listeningQuestionTypes = [
    {
      type: "labeling" as QuestionType,
      title: "Labeling",
      description: "Label diagrams or maps",
      icon: "🏷️",
    },
  ];

  // Reading-specific question types
  const readingQuestionTypes = [
    {
      type: "true-false-not-given" as QuestionType,
      title: "True/False/Not Given",
      description: "Evaluate statements",
      icon: "✓",
    },
     {
      type: "yes-no-not-given" as QuestionType,
      title: "Yes/No/Not Given",
      description: "Evaluate statements",
      icon: "✓",
    },
    {
      type: "matching-headings" as QuestionType,
      title: "Matching Headings",
      description: "Match paragraphs with headings",
      icon: "¶",
    },
    {
      type: "short-answer" as QuestionType,
      title: "Short Answer",
      description: "Brief written responses",
      icon: "✎",
    },
  ];

  // Add writing-specific question types
  const writingQuestionTypes = [
    {
      type: "writing-task1" as QuestionType,
      title: "Writing Task 1",
      description: "Describe visual information (graph, chart, diagram, etc.)",
      icon: "📊",
    },
    {
      type: "writing-task2" as QuestionType,
      title: "Writing Task 2",
      description: "Write an essay on a given topic",
      icon: "📝",
    },
  ];

  // Grammar-specific question types
  const grammarQuestionTypes = [
    {
      type: "sentence-translation" as QuestionType,
      title: "Sentence Translation",
      description: "Translate sentences between languages",
      icon: "🌐",
    },
    {
      type: "word-form" as QuestionType,
      title: "Word Form Transformation",
      description: "Change words to correct grammatical forms",
      icon: "📝",
    },
  ];

  // Update the questionTypes array to include writing types
  let questionTypes = [...commonQuestionTypes];

  if (testType === "listening") {
    questionTypes = [...questionTypes, ...listeningQuestionTypes];
  } else if (testType === "reading") {
    questionTypes = [...questionTypes, ...readingQuestionTypes];
  } else if (testType === "writing") {
    questionTypes = [...writingQuestionTypes];
  } else if (testType === "grammar") {
    questionTypes = [...grammarQuestionTypes];
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Add Question</DialogTitle>
          <DialogDescription className="text-xs">
            Select the type of question to add
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 py-2 max-h-[60vh] overflow-y-auto">
          {questionTypes.map((questionType) => (
            <Button
              key={questionType.type}
              variant="outline"
              className="h-auto py-2.5 px-3 flex items-start justify-start text-left hover:bg-muted/20 border-muted group"
              onClick={() => onSelectQuestionType(questionType.type)}
            >
              <div className="mr-2.5 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-lg group-hover:bg-primary/20 shrink-0">
                <span>{questionType.icon}</span>
              </div>
              <div className="flex flex-col items-start w-full">
                <span className="text-sm font-medium mb-0.5">
                  {questionType.title}
                </span>
                <span className="text-xs text-muted-foreground break-words whitespace-normal">
                  {questionType.description}
                </span>
                {(testType === "listening" &&
                  listeningQuestionTypes.some(
                    (q) => q.type === questionType.type,
                  )) ||
                (testType === "reading" &&
                  readingQuestionTypes.some(
                    (q) => q.type === questionType.type,
                  )) ||
                (testType === "writing" &&
                  writingQuestionTypes.some(
                    (q) => q.type === questionType.type,
                  )) ? (
                  <Badge
                    variant="outline"
                    className="mt-1.5 px-1.5 py-0 h-4 text-[10px] bg-muted/30 capitalize"
                  >
                    {testType} only
                  </Badge>
                ) : null}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
