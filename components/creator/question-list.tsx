"use client";
import React, { useState } from "react";
import { Button } from "@testComponents/components/ui/button";
import { Badge } from "@testComponents/components/ui/badge";
import type { Question } from "@testComponents/lib/types";
import QuestionEditorInline from "./question-editor-inline";
import { X, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";

interface QuestionListProps {
  questions: Question[];
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Record<string, unknown>,
  ) => void;
  onRemoveQuestion: (sectionId: string, questionId: string) => void;
  onReorderQuestion: (sectionId: string, questionId: string, direction: 'up' | 'down') => void;
}

export default function QuestionList({
  questions,
  sectionId,
  onUpdateQuestion,
  onRemoveQuestion,
  onReorderQuestion,
}: QuestionListProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );

  const toggleQuestionExpand = (questionId: string) => {
    setExpandedQuestionId(
      expandedQuestionId === questionId ? null : questionId,
    );
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-3 px-2 border border-dashed rounded bg-muted/20">
        <p className="text-muted-foreground text-sm">No questions added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, qIndex) => (
        <div
          key={question.id}
          className="border-l-2 border-l-primary/70 border-t border-r border-b rounded hover:bg-muted/30 transition-colors"
        >
          <div
            className="flex justify-between items-center gap-2 pl-2 pr-1 py-1.5 cursor-pointer"
            onClick={() => toggleQuestionExpand(question.id)}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Badge
                variant="outline"
                className="h-5 px-1.5 font-medium text-xs"
              >
                Q{qIndex + 1}
              </Badge>
              <Badge
                variant="secondary"
                className="h-5 text-[10px] px-1.5 capitalize"
              >
                {question.type?.replace(/-/g, " ") || "unknown"}
              </Badge>
              {/* <span className="text-xs truncate">
                {question.text || "No question text yet"}
              </span> */}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onReorderQuestion(sectionId, question.id, 'up');
                }}
                disabled={qIndex === 0}
                title="Move up"
              >
                <ArrowUp size={12} className="text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onReorderQuestion(sectionId, question.id, 'down');
                }}
                disabled={qIndex === questions.length - 1}
                title="Move down"
              >
                <ArrowDown size={12} className="text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleQuestionExpand(question.id);
                }}
              >
                {expandedQuestionId === question.id ? (
                  <ChevronUp size={14} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={14} className="text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveQuestion(sectionId, question.id);
                }}
              >
                <X
                  size={14}
                  className="text-muted-foreground hover:text-destructive"
                />
              </Button>
            </div>
          </div>

          {expandedQuestionId === question.id && (
            <div className="px-3 pb-3">
              <QuestionEditorInline
                question={question}
                sectionId={sectionId}
                onUpdateQuestion={onUpdateQuestion}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
