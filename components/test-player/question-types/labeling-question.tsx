"use client";
import React from "react";
import type { LabelingQuestion } from "@testComponents/lib/types";
import { useEffect, useState } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import { cn } from "@testComponents/lib/utils";

interface LabelingQuestionProps {
  question: LabelingQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

const ITEM_TYPE = "OPTION";

export default function LabelingQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: LabelingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionId: string, subQuestionId: string) => {
    if (readOnly) return;

    setMatches((prevMatches) => {
      const updatedMatches = { ...prevMatches };
      updatedMatches[subQuestionId] = optionId;

      if (question.scoringStrategy === "partial") {
        onChange(updatedMatches, subQuestionId);
      } else {
        onChange(updatedMatches);
      }

      return updatedMatches;
    });
  };

  return (
    <div className="space-y-3">
      <p className="font-medium text-sm">{question.text}</p>
      <div
        className="relative border rounded-lg overflow-hidden"
        style={{ height: "200px" }}
      >
        <img
          src={question.imageUrl || "/placeholder.svg"}
          alt="Diagram to label"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">Options</p>
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((option, optionIndex) => (
            <DraggableItem
              key={option.id}
              text={option.text}
              index={option.id}
              itemType={ITEM_TYPE}
              prefix={String.fromCharCode(65 + optionIndex) + "."}
              disabled={readOnly}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <p className="font-medium text-sm">Labels</p>
          {question.labels.map((label, labelIndex) => {
            const subQuestion = question.subQuestions?.find(
              (sq) => sq.item === label.id,
            );

            if (!subQuestion) {
              console.error("No subQuestion found for item:", label.id);
              return null;
            }

            const matchedOption = question.options.find(
              (opt) => opt.id === matches[subQuestion.subId],
            );

            const isCorrect =
              showCorrectAnswer &&
              matchedOption?.id === subQuestion.correctAnswer;

            const isIncorrect =
              showCorrectAnswer &&
              (!matchedOption ||
                matchedOption.id !== subQuestion.correctAnswer);

            const correctOption = question.options.find(
              (opt) => opt.id === subQuestion.correctAnswer,
            );

            return (
              <div key={label.id} className="flex items-center gap-6">
                <Label className="min-w-[200px]">
                  {question.scoringStrategy === "partial" && subQuestion
                    ? `Question ${question.index + labelIndex + 1}.`
                    : `${labelIndex + 1}.`}{" "}
                  {label.text}
                </Label>
                <div className="relative flex gap-6 items-center">
                  <DroppableZone
                    key={subQuestion.subId}
                    subQuestionId={subQuestion.subId}
                    matchedId={matches[subQuestion.subId]}
                    matchedText={matchedOption?.text}
                    prefix={
                      matchedOption
                        ? String.fromCharCode(
                            65 +
                              question.options.findIndex(
                                (o) => o.id === matchedOption.id,
                              ),
                          ) + "."
                        : ""
                    }
                    onDrop={handleDrop}
                    itemType={ITEM_TYPE}
                    placeholder={
                      showCorrectAnswer ? "Not answered" : "Drag an option here"
                    }
                    disabled={readOnly}
                    className={cn(
                      isCorrect && "border-green-500 bg-green-50",
                      isIncorrect && "border-red-500 bg-red-50",
                    )}
                  />
                  {isIncorrect && showCorrectAnswer && correctOption && (
                    <div className="text-sm text-green-600">
                      ✓{" "}
                      {String.fromCharCode(
                        65 +
                          question.options.findIndex(
                            (o) => o.id === correctOption.id,
                          ),
                      )}
                      . {correctOption.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
