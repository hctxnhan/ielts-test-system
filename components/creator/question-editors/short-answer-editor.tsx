"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import type { ShortAnswerQuestion } from "@/lib/types";

interface ShortAnswerEditorProps {
  question: ShortAnswerQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function ShortAnswerEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: ShortAnswerEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label
          htmlFor={`word-limit-${question.id}`}
          className="text-xs font-medium"
        >
          Word Limit (Optional)
        </Label>
        <Input
          id={`word-limit-${question.id}`}
          type="number"
          value={question.wordLimit || ""}
          onChange={(e) => {
            const wordLimit = e.target.value
              ? Number.parseInt(e.target.value)
              : undefined;
            onUpdateQuestion(sectionId, question.id, { wordLimit });
          }}
          placeholder="Maximum words per answer"
          min="1"
          className="h-8"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Questions</Label>
        {question.questions?.map((q, qIndex) => (
          <div
            key={qIndex}
            className="space-y-1.5 border border-muted/70 p-2 rounded bg-muted/10"
          >
            <div className="flex gap-1.5 items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                {qIndex + 1}
              </div>
              <Input
                value={q}
                onChange={(e) => {
                  const newQuestions = [...(question.questions || [])];
                  newQuestions[qIndex] = e.target.value;
                  onUpdateQuestion(sectionId, question.id, {
                    questions: newQuestions,
                  });
                }}
                placeholder={`Question ${qIndex + 1}`}
                className="h-7 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => {
                  const newQuestions = question.questions.filter(
                    (_, i) => i !== qIndex
                  );
                  const newCorrectAnswers = [
                    ...(question.correctAnswers || []),
                  ];
                  newCorrectAnswers.splice(qIndex, 1);
                  onUpdateQuestion(sectionId, question.id, {
                    questions: newQuestions,
                    correctAnswers: newCorrectAnswers,
                  });
                }}
                disabled={question.questions.length <= 1}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="pl-6 space-y-1 mt-1">
              <Label className="text-xs text-muted-foreground">
                Acceptable Answers
              </Label>

              {(question.correctAnswers?.[qIndex] || [""]).map(
                (answer, ansIndex) => (
                  <div key={ansIndex} className="flex gap-1.5 items-center">
                    <Input
                      value={answer}
                      onChange={(e) => {
                        const newCorrectAnswers = [
                          ...(question.correctAnswers || []),
                        ];
                        if (!newCorrectAnswers[qIndex]) {
                          newCorrectAnswers[qIndex] = [];
                        }
                        newCorrectAnswers[qIndex][ansIndex] = e.target.value;
                        onUpdateQuestion(sectionId, question.id, {
                          correctAnswers: newCorrectAnswers,
                        });
                      }}
                      placeholder={`Acceptable answer ${ansIndex + 1}`}
                      className="h-7 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => {
                        const newCorrectAnswers = [
                          ...(question.correctAnswers || []),
                        ];
                        newCorrectAnswers[qIndex] = newCorrectAnswers[
                          qIndex
                        ].filter((_, i) => i !== ansIndex);
                        onUpdateQuestion(sectionId, question.id, {
                          correctAnswers: newCorrectAnswers,
                        });
                      }}
                      disabled={question.correctAnswers?.[qIndex]?.length <= 1}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50"
                onClick={() => {
                  const newCorrectAnswers = [
                    ...(question.correctAnswers || []),
                  ];
                  if (!newCorrectAnswers[qIndex]) {
                    newCorrectAnswers[qIndex] = [""];
                  } else {
                    newCorrectAnswers[qIndex].push("");
                  }
                  onUpdateQuestion(sectionId, question.id, {
                    correctAnswers: newCorrectAnswers,
                  });
                }}
              >
                <PlusCircle className="mr-1.5 h-3 w-3" /> Add Alternative Answer
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newQuestions = [...(question.questions || []), ""];
            const newCorrectAnswers = [
              ...(question.correctAnswers || []),
              [""],
            ];
            onUpdateQuestion(sectionId, question.id, {
              questions: newQuestions,
              correctAnswers: newCorrectAnswers,
            });
          }}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50"
        >
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Question
        </Button>
      </div>
    </div>
  );
}
