"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MultipleChoiceQuestion } from "@/lib/types";
import { PlusCircle } from "lucide-react";

interface MultipleChoiceEditorProps {
  question: MultipleChoiceQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function MultipleChoiceEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: MultipleChoiceEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Options
        </Label>
        <div className="space-y-1">
          {question.options.map((option, optIndex) => (
            <div key={optIndex} className="flex gap-1.5 items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                {optIndex + 1}
              </div>
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[optIndex] = e.target.value;
                  onUpdateQuestion(sectionId, question.id, {
                    options: newOptions,
                  });
                }}
                placeholder={`Option ${optIndex + 1}`}
                className="h-7 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newOptions = question.options.filter(
                    (_, i) => i !== optIndex
                  );
                  onUpdateQuestion(sectionId, question.id, {
                    options: newOptions,
                  });
                }}
                disabled={question.options.length <= 2}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newOptions = [...question.options, ""];
            onUpdateQuestion(sectionId, question.id, { options: newOptions });
          }}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
        >
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Add Option
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={`correct-answer-${question.id}`}
          className="text-xs font-medium flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Correct Answer
        </Label>
        <Select
          value={question.correctAnswer.toString()}
          onValueChange={(value) =>
            onUpdateQuestion(sectionId, question.id, {
              correctAnswer: Number.parseInt(value),
            })
          }
        >
          <SelectTrigger
            id={`correct-answer-${question.id}`}
            className="h-7 text-sm"
          >
            <SelectValue placeholder="Select correct option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option, optIndex) => (
              <SelectItem
                key={optIndex}
                value={optIndex.toString()}
                className="text-sm py-1 px-2"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center justify-center h-4 w-4 rounded-full bg-muted/50 text-xs font-medium">
                    {optIndex + 1}
                  </div>
                  <span>
                    {option.substring(0, 25)}
                    {option.length > 25 ? "..." : ""}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
