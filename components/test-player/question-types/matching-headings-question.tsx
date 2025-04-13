"use client";

import { useState, useEffect } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@/components/ui/label";
import type { MatchingHeadingsQuestion } from "@/lib/types";

interface MatchingHeadingsQuestionProps {
  question: MatchingHeadingsQuestion;
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
          {question.headings.map((heading, headingIndex) => (
            <DraggableItem
              key={heading.id}
              text={heading.text}
              index={heading.id}
              itemType={ITEM_TYPE}
              prefix={String.fromCharCode(65 + headingIndex) + "."}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm">Paragraphs:</Label>
        {question.paragraphs.map((paragraph, paraIndex) => {
          // Find the corresponding subQuestion
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === paragraph.id
          );

          if (!subQuestion) {
            console.error("No subQuestion found for paragraph:", paragraph.id);
            return null;
          }

          const matchedHeading = question.headings.find(
            (h) => h.id === matches[subQuestion.subId]
          );

          return (
            <div key={paragraph.id} className="space-y-2 w-fit min-w-[300px]">
              <p className="text-xs text-gray-600 whitespace-pre-line">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Question ${question.index + paraIndex + 1}.`
                  : `Paragraph ${paraIndex + 1}.`}{" "}
                {paragraph.text}
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
                          question.headings.findIndex(
                            (h) => h.id === matchedHeading.id
                          )
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
