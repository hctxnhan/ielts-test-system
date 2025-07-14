"use client";

import React from "react";
import { useState, useEffect } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import { cn } from "@testComponents/lib/utils";
import type { StandardMatchingHeadingsQuestion } from "@testComponents/lib/standardized-types";

interface MatchingHeadingsQuestionProps {
  question: StandardMatchingHeadingsQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
}

const ITEM_TYPE = "HEADING";

export default function MatchingHeadingsQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
}: MatchingHeadingsQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  console.log("==> question", question)
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
    <div className="mx-auto space-y-6">
      <RichTextEditor
        value={question.text || ""}
        onChange={(content) => onQuestionHighlighted(question.id, content)}
        readonly={true}
        className={cn(
          "leading-relaxed w-full h-full",
        )}
        minHeight={20}
      />{" "}
      <div className={cn(
        "grid gap-6",
        showCorrectAnswer 
          ? "grid-cols-1" 
          : "grid-cols-1 md:grid-cols-[minmax(200px,1fr)_minmax(200px,1fr)]"
      )}>
        {!showCorrectAnswer && (
          <div className="space-y-3">
            <p className="text-base font-semibold text-gray-700">Headings</p>
            <div className="space-y-2">
              {question.items.map((option, optionIndex) => (
                <DraggableItem
                  key={option.id}
                  text={option.text}
                  index={option.id}
                  itemType={ITEM_TYPE}
                  // prefix={String.fromCharCode(65 + optionIndex) + "."}
                  disabled={readOnly}
                  className="hover:shadow-md transition-shadow duration-200"
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-base font-semibold text-gray-700">Paragraphs</p>
          <div className="space-y-4">
            {question.options.map((item, index) => {
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
                matchedHeading?.id === subQuestion.correctAnswer;

              const isIncorrect =
                showCorrectAnswer &&
                (!matchedHeading ||
                  matchedHeading.id !== subQuestion.correctAnswer);

              const correctHeading = question.items.find(
                (h) => h.id === subQuestion.correctAnswer,
              );

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-center gap-3"
                >
                  <Label className="min-w-[180px] text-gray-700">
                    {question.scoringStrategy === "partial" && subQuestion
                      ? `Question ${question.index + index + 1}.`
                      : `${index + 1}.`}{" "}
                    {item.text}
                  </Label>
                  <div className="flex-1 flex flex-col gap-4">
                    <div
                      className={cn(
                        "flex-1 rounded-lg transition-colors duration-200",
                        isCorrect && "border-green-500 bg-green-50",
                        isIncorrect && "border-red-500 bg-red-50",
                      )}
                    >
                      <DroppableZone
                        key={subQuestion.subId}
                        subQuestionId={subQuestion.subId}
                        matchedId={matches[subQuestion.subId]}
                        matchedText={matchedHeading?.text}
                        // prefix={
                        //   matchedHeading
                        //     ? String.fromCharCode(
                        //         65 +
                        //           question.items.findIndex(
                        //             (h) => h.id === matchedHeading.id,
                        //           ),
                        //       ) + "."
                        //     : ""
                        // }
                        onDrop={handleDrop}
                        itemType={ITEM_TYPE}
                        placeholder={
                          readOnly ? "Not answered" : "Drag heading here"
                        }
                        disabled={readOnly}
                        className={cn(
                          "border shadow-sm hover:shadow transition-shadow duration-200",
                          isCorrect && "border-green-500",
                          isIncorrect && "border-red-500",
                        )}
                      />
                    </div>
                    {isIncorrect && showCorrectAnswer && correctHeading && (
                      <div className="text-sm flex items-start space-x-2">
                        <span className="text-green-600 break-words">
                          ✓{" "}
                          {String.fromCharCode(
                            65 +
                              question.items.findIndex(
                                (h) => h.id === correctHeading.id,
                              ),
                          )}
                          . {correctHeading.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
