"use client";

import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import type {
  ShortAnswerQuestion,
  SubQuestionMeta,
} from "@testComponents/lib/types";
import { v4 as uuidv4 } from "uuid";

interface ShortAnswerEditorProps {
  question: ShortAnswerQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<ShortAnswerQuestion>
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
        {question.questions?.map((q, qIndex) => {
          const subQuestion = question.subQuestions?.[qIndex] || {
            subIndex: qIndex + 1,
            subId: uuidv4(),
            points: 1,
            acceptableAnswers: [],
          };

          return (
            <div
              key={qIndex}
              className="space-y-1.5 border border-muted/70 p-2 rounded bg-muted/10"
            >
              <div className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {qIndex + 1}
                </div>
                <Input
                  value={q.text}
                  onChange={(e) => {
                    const newQuestions = [...(question.questions || [])];
                    newQuestions[qIndex] = { ...q, text: e.target.value };
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
                    const newSubQuestions =
                      question.subQuestions?.filter((_, i) => i !== qIndex) ||
                      [];
                    onUpdateQuestion(sectionId, question.id, {
                      questions: newQuestions,
                      subQuestions: newSubQuestions,
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

                {(subQuestion.acceptableAnswers || [""]).map(
                  (answer, ansIndex) => (
                    <div key={ansIndex} className="flex gap-1.5 items-center">
                      <Input
                        value={answer}
                        onChange={(e) => {
                          const newSubQuestions = [
                            ...(question.subQuestions || []),
                          ];
                          if (!newSubQuestions[qIndex]) {
                            newSubQuestions[qIndex] = { ...subQuestion };
                          }
                          const answers = [
                            ...(newSubQuestions[qIndex].acceptableAnswers ||
                              []),
                          ];
                          answers[ansIndex] = e.target.value;
                          newSubQuestions[qIndex].acceptableAnswers = answers;
                          onUpdateQuestion(sectionId, question.id, {
                            subQuestions: newSubQuestions,
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
                          const newSubQuestions = [
                            ...(question.subQuestions || []),
                          ];
                          if (!newSubQuestions[qIndex]) {
                            newSubQuestions[qIndex] = { ...subQuestion };
                          }
                          const answers =
                            newSubQuestions[qIndex].acceptableAnswers?.filter(
                              (_, i) => i !== ansIndex
                            ) || [];
                          newSubQuestions[qIndex].acceptableAnswers = answers;
                          onUpdateQuestion(sectionId, question.id, {
                            subQuestions: newSubQuestions,
                          });
                        }}
                        disabled={subQuestion.acceptableAnswers?.length <= 1}
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
                    const newSubQuestions = [...(question.subQuestions || [])];
                    if (!newSubQuestions[qIndex]) {
                      newSubQuestions[qIndex] = { ...subQuestion };
                    }
                    const answers = [
                      ...(newSubQuestions[qIndex].acceptableAnswers || []),
                      "",
                    ];
                    newSubQuestions[qIndex].acceptableAnswers = answers;
                    onUpdateQuestion(sectionId, question.id, {
                      subQuestions: newSubQuestions,
                    });
                  }}
                >
                  <PlusCircle className="mr-1.5 h-3 w-3" /> Add Alternative
                  Answer
                </Button>
              </div>
            </div>
          );
        })}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newIndex = question.questions?.length || 0;
            const questionId = uuidv4();
            const newQuestions = [
              ...(question.questions || []),
              { id: questionId, text: "" },
            ];
            const newSubQuestions = [
              ...(question.subQuestions || []),
              {
                subIndex: newIndex + 1,
                subId: uuidv4(),
                item: questionId, 
                points: 1,
                acceptableAnswers: [""],
              },
            ];
            onUpdateQuestion(sectionId, question.id, {
              questions: newQuestions,
              subQuestions: newSubQuestions,
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
