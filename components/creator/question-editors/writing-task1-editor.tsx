"use client";
import React from "react";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { Textarea } from "@testComponents/components/ui/textarea";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { WritingTask1Question } from "@testComponents/lib/types";
import FilePicker from "@testComponents/components/file-picker";
import type { FileObject } from "@testComponents/lib/supabase-storage";

interface WritingTask1EditorProps {
  question: WritingTask1Question;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function WritingTask1Editor({
  question,
  sectionId,
  onUpdateQuestion,
}: WritingTask1EditorProps) {
  const handleImageSelect = (file: FileObject) => {
    onUpdateQuestion(sectionId, question.id, { imageUrl: file.url });
  };

  return (
    <div className="grid gap-3">
      {/* <div className="hidden gap-1.5">
        <Label
          htmlFor={`prompt-${question.id}`}
          className="text-sm font-medium"
        >
          Task Prompt
        </Label>
        <Textarea
          id={`prompt-${question.id}`}
          value={question.prompt}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, {
              prompt: e.target.value,
            });
          }}
          placeholder="Enter the task prompt..."
          className="resize-none min-h-[80px] text-sm"
        />
      </div> */}

      <div className="grid gap-1.5">
        <Label
          htmlFor={`image-url-${question.id}`}
          className="text-sm font-medium"
        >
          Chart/Graph Image
        </Label>
        <FilePicker
          fileType="image"
          onFileSelect={handleImageSelect}
          currentFileUrl={question.imageUrl}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label
            htmlFor={`word-limit-${question.id}`}
            className="text-sm font-medium"
          >
            Word Limit
          </Label>
          <Input
            id={`word-limit-${question.id}`}
            type="number"
            value={question.wordLimit}
            onChange={(e) => {
              onUpdateQuestion(sectionId, question.id, {
                wordLimit: Number.parseInt(e.target.value) || 150,
              });
            }}
            min="50"
            max="300"
            className="h-8 text-sm"
          />
        </div>
        <div className="self-end text-xs text-muted-foreground mt-1">
          Recommended: 150 words
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor={`scoring-prompt-${question.id}`}
          className="text-sm font-medium"
        >
          AI Scoring Prompt{" "}
          <span className="font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id={`scoring-prompt-${question.id}`}
          value={question.scoringPrompt || ""}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, {
              scoringPrompt: e.target.value,
            });
          }}
          placeholder="Custom AI scoring instructions..."
          className="resize-none min-h-[60px] text-sm"
        />
        <p className="text-xs text-muted-foreground -mt-0.5">
          Leave empty for standard IELTS Task 1 criteria
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label
          htmlFor={`suggested-answer-${question.id}`}
          className="text-sm font-medium"
        >
          Suggested Answer{" "}
          <span className="font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <RichTextEditor
          id={`suggested-answer-${question.id}`}
          value={question.suggestedAnswer || ""}
          onChange={(content) => {
            onUpdateQuestion(sectionId, question.id, {
              suggestedAnswer: content,
            });
          }}
          placeholder="Provide a suggested answer..."
          minHeight={120}
          className="text-sm"
        />
      </div>
      <div className="grid gap-1.5">
        <Label
          htmlFor={`sample-answer-${question.id}`}
          className="text-sm font-medium"
        >
          Sample Answer{" "}
          <span className="font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <RichTextEditor
          id={`sample-answer-${question.id}`}
          value={question.sampleAnswer || ""}
          onChange={(content) => {
            onUpdateQuestion(sectionId, question.id, {
              sampleAnswer: content,
            });
          }}
          placeholder="Provide a sample answer..."
          minHeight={120}
          className="text-sm"
        />
      </div>
    </div>
  );
}
