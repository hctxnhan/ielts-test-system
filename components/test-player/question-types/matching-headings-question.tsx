"use client";

import React, { useState, useEffect } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
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
    <div className="mx-auto space-y-8">
      {/* Question Text */}
      <RichTextEditor
        value={question.text || ""}
        onChange={(content) => onQuestionHighlighted(question.id, content)}
        readonly={true}
        className="leading-relaxed w-full h-full font-semibold text-gray-800"
        minHeight={20}
      />

      {/* Matching Grid */}
      <div
        className={cn(
          "grid gap-10 items-start",
          showCorrectAnswer
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-[minmax(250px,1fr)_minmax(250px,1fr)]"
        )}
      >
        {/* Paragraphs Section */}
        <div className="space-y-4">
          <p className="text-lg font-bold text-gray-800 border-b pb-1">
            Paragraphs
          </p>
          <div className="space-y-5">
            {question.items.map((item, index) => {
              const subQuestion = question.subQuestions?.find(
                (sq) => sq.item === item.id
              );

              if (!subQuestion) {
                console.error("No subQuestion found for paragraph:", item.id);
                return null;
              }

              const matchedHeading = question.options.find(
                (h) => h.id === matches[subQuestion.subId]
              );

              const isCorrect =
                showCorrectAnswer &&
                matchedHeading?.id === subQuestion.correctAnswer;

              const isIncorrect =
                showCorrectAnswer &&
                (!matchedHeading ||
                  matchedHeading.id !== subQuestion.correctAnswer);

              const correctHeading = question.options.find(
                (h) => h.id === subQuestion.correctAnswer
              );

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-start gap-2"
                >
                  <Label className="min-w-[180px] text-gray-800 font-semibold">
                    {question.scoringStrategy === "partial" && subQuestion
                      ? `Question ${question.index + index + 1}.`
                      : `${index + 1}.`}{" "}
                    {item.text}
                  </Label>

                  <div className="flex flex-col gap-2">
                    <div
                      className={cn(
                        "flex-1 rounded-lg border transition-colors duration-200 bg-white",
                        isCorrect && "border-green-500 bg-green-50",
                        isIncorrect && "border-red-500 bg-red-50"
                      )}
                    >
                      <DroppableZone
                        key={subQuestion.subId}
                        subQuestionId={subQuestion.subId}
                        matchedId={matches[subQuestion.subId]}
                        matchedText={matchedHeading?.text}
                        onDrop={handleDrop}
                        itemType={ITEM_TYPE}
                        placeholder={
                          readOnly ? "Not answered" : "Drag heading here"
                        }
                        disabled={readOnly}
                        className="border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                      />
                    </div>

                    {isIncorrect && showCorrectAnswer && correctHeading && (
                      <div className="text-sm flex items-start space-x-2">
                        <span className="text-green-700 font-medium break-words">
                          ✓{" "}
                          {String.fromCharCode(
                            65 +
                              question.options.findIndex(
                                (h) => h.id === correctHeading.id
                              )
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

        {/* Headings Section */}
        {!showCorrectAnswer && (
          <div className="space-y-4">
            <p className="text-lg font-bold text-gray-800 border-b pb-1">
              Headings
            </p>
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <DraggableItem
                  key={option.id}
                  text={option.text}
                  index={option.id}
                  itemType={ITEM_TYPE}
                  prefix={String.fromCharCode(65 + optionIndex) + "."}
                  disabled={readOnly}
                  className="hover:shadow-md transition-shadow duration-200 border rounded-lg p-2 bg-white"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
