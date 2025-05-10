"use client";

import React from "react";
import { useState, useEffect } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";
import type { StandardMatchingHeadingsQuestion } from "@testComponents/lib/standardized-types";

interface MatchingHeadingsQuestionProps {
  question: StandardMatchingHeadingsQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
}

const ITEM_TYPE = "HEADING";

export default function MatchingHeadingsQuestionRenderer({
  question,
  value,
  onChange,
}: MatchingHeadingsQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (headingId: string, subQuestionId: string) => {
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
    <div className="space-y-4">
      <p className="font-medium">{question.text}</p>
      <div className="space-y-2 w-fit">
        <Label className="text-sm">Headings:</Label>
        <div className="flex flex-col space-y-2">
          {question.options.map((option, optionIndex) => (
            <DraggableItem
              key={option.id}
              text={option.text}
              index={option.id}
              itemType={ITEM_TYPE}
              prefix={String.fromCharCode(65 + optionIndex) + "."}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm">Paragraphs:</Label>
        {question.items.map((item, itemIndex) => {
          // Find the corresponding subQuestion
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === item.id,
          );

          if (!subQuestion) {
            console.error("No subQuestion found for paragraph:", item.id);
            return null;
          }

          const matchedHeading = question.options.find(
            (h) => h.id === matches[subQuestion.subId],
          );

          return (
            <div key={item.id} className="space-y-2 w-fit min-w-[300px]">
              <p className="text-sm text-gray-600 whitespace-pre-line font-medium">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Question ${question.index + itemIndex + 1}.`
                  : `Paragraph ${itemIndex + 1}.`}{" "}
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
                          question.options.findIndex(
                            (h) => h.id === matchedHeading.id,
                          ),
                      ) + "."
                    : ""
                }
                onDrop={handleDrop}
                itemType={ITEM_TYPE}
                placeholder="Drag heading here"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
