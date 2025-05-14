"use client";
import React, { useEffect, useState } from "react";
import type { MatchingQuestion } from "@testComponents/lib/types";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import { cn } from "@testComponents/lib/utils";

interface MatchingQuestionProps {
  question: MatchingQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

const ITEM_TYPE = "OPTION";

export default function MatchingQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: MatchingQuestionProps) {
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
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-2 w-fit">
        <p className="font-medium">Options</p>
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

      <div className="space-y-2">
        <p className="font-medium">Items</p>
        {question.items.map((item, index) => {
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === item.id,
          );

          if (!subQuestion) {
            console.error("No subQuestion found for item:", item.id);
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
            (!matchedOption || matchedOption.id !== subQuestion.correctAnswer);

          const correctOption = question.options.find(
            (opt) => opt.id === subQuestion.correctAnswer,
          );

          return (
            <div key={item.id} className="flex gap-2 items-center">
              <Label className="w-[200px]">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Question ${question.index + index + 1}.`
                  : `${index + 1}.`}{" "}
                {item.text}
              </Label>
              <div className="relative flex gap-6">
                <div
                  className={cn(
                    "rounded",
                    isCorrect && "border-green-500 bg-green-50",
                    isIncorrect && "border-red-500 bg-red-50",
                  )}
                >
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
                      readOnly ? "Not answered" : "Drag an option here"
                    }
                    disabled={readOnly}
                    className={cn(
                      "border",
                      isCorrect && "border-green-500",
                      isIncorrect && "border-red-500",
                    )}
                  />
                </div>
                {isIncorrect && showCorrectAnswer && correctOption && (
                  <div className="text-sm flex items-center space-x-2 mt-1">
                    <span className="text-green-600">
                      ✓{" "}
                      {String.fromCharCode(
                        65 +
                          question.options.findIndex(
                            (o) => o.id === correctOption.id,
                          ),
                      )}
                      . {correctOption.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
