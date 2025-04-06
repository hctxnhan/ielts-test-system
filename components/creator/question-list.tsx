"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/types";
import QuestionEditor from "./question-editor";
import { X, Edit } from "lucide-react";

interface QuestionListProps {
  questions: Question[];
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
  onRemoveQuestion: (sectionId: string, questionId: string) => void;
}

export default function QuestionList({
  questions,
  sectionId,
  onUpdateQuestion,
  onRemoveQuestion,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-3 px-2 border border-dashed rounded bg-muted/20">
        <p className="text-muted-foreground text-sm">No questions added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {questions.map((question, qIndex) => (
        <div
          key={question.id}
          className="border-l-2 border-l-primary/70 border-t border-r border-b pl-2 pr-1 py-1.5 rounded hover:bg-muted/30 transition-colors"
        >
          <div className="flex justify-between items-center gap-2">
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
                {question.type}
              </Badge>
              <span className="text-xs truncate">
                {question.text || "No question text yet"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit size={14} className="text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <QuestionEditor
                  question={question}
                  sectionId={sectionId}
                  onUpdateQuestion={onUpdateQuestion}
                />
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onRemoveQuestion(sectionId, question.id)}
              >
                <X
                  size={14}
                  className="text-muted-foreground hover:text-destructive"
                />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
