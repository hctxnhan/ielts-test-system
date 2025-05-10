"use client";

import React from "react";
import { useState, useEffect } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import { cn } from "@testComponents/lib/utils";
import type { StandardMatchingHeadingsQuestion } from "@testComponents/lib/standardized-types";

interface MatchingHeadingsQuestionProps {
  question: StandardMatchingHeadingsQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
}

const ITEM_TYPE = "HEADING";

export default function MatchingHeadingsQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
}: MatchingHeadingsQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (headingId: string, subQuestionId: string) => {
    if (readOnly) return;

    setMatches((prevMatches) => {
      const updatedMatches = { ...prevMatches };
      updatedMatches[subQuestionId] = headingId;

      if (question.scoringStrategy === "partial") {
        onChange(updatedMatches, subQuestionId);
      } else {
        onChange(updatedMatches);
      }

      return updatedMatches;
    });
  };

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{question.text}</p>
      <div className="space-y-1.5 w-fit">
        <Label className="text-xs font-medium text-muted-foreground">
          Headings:
        </Label>
        <div className="flex flex-col gap-1.5 text-sm">
          {question.items.map((option, optionIndex) => (
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

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Paragraphs:
        </Label>
        {question.options.map((item, itemIndex) => {
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === item.id,
          );

          if (!subQuestion) {
            console.error("No subQuestion found for paragraph:", item.id);
            return null;
          }

          const matchedHeading = question.items.find(
            (h) => h.id === matches[subQuestion.subId],
          );

          const isCorrect =
            showCorrectAnswer &&
            subQuestion.correctAnswer === matches[subQuestion.subId];
          const isIncorrect = showCorrectAnswer && !isCorrect;

          return (
            <div
              key={item.id}
              className="flex gap-6 items-center w-fit min-w-[300px]"
            >
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Q${question.index + itemIndex + 1}.`
                  : `#${itemIndex + 1}.`}{" "}
                {item.text}
              </p>
              <DroppableZone
                key={subQuestion.subId}
                subQuestionId={subQuestion.subId}
                matchedId={matches[subQuestion.subId]}
                matchedText={matchedHeading?.text}
                prefix={
                  matchedHeading
                    ? String.fromCharCode(
                        65 +
                          question.items.findIndex(
                            (h) => h.id === matchedHeading.id,
                          ),
                      ) + "."
                    : ""
                }
                onDrop={handleDrop}
                itemType={ITEM_TYPE}
                placeholder={
                  showCorrectAnswer ? "Not answered" : "Drag heading here"
                }
                disabled={readOnly}
                className={cn(
                  isCorrect && "border-green-500 bg-green-50",
                  isIncorrect && "border-red-500 bg-red-50",
                )}
              />
              {showCorrectAnswer && isIncorrect && (
                <div className="text-sm text-green-600">
                  ✓{" "}
                  {String.fromCharCode(
                    65 +
                      question.items.findIndex(
                        (h) => h.id === subQuestion.correctAnswer,
                      ),
                  ) +
                    ". " +
                    question.items.find(
                      (h) => h.id === subQuestion.correctAnswer,
                    )?.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
