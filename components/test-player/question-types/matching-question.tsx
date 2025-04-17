"use client";
import type { MatchingQuestion } from "@testComponents/lib/types";
import { useEffect, useState } from "react";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";
import { Label } from "@testComponents/components/ui/label";

interface MatchingQuestionProps {
  question: MatchingQuestion;
  value: Record<number, string> | null;
  onChange: (value: Record<number, string>, subId?: string) => void;
}

const ITEM_TYPE = "OPTION";

export default function MatchingQuestionRenderer({
  question,
  value,
  onChange,
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    if (value) {
      setMatches(value);
    }
  }, [value]);

  const handleDrop = (optionId: string, subQuestionId: string) => {
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
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="font-medium">Items</p>
        {question.items.map((item, index) => {
          // Find the corresponding subQuestion
          const subQuestion = question.subQuestions?.find(
            (sq) => sq.item === item.id
          );

          if (!subQuestion) {
            console.error("No subQuestion found for item:", item.id);
            return null;
          }

          const matchedOption = question.options.find(
            (opt) => opt.id === matches[subQuestion.subId]
          );

          return (
            <div key={item.id} className="flex items-center gap-2">
              <Label className="w-[200px]">
                {question.scoringStrategy === "partial" && subQuestion
                  ? `Question ${question.index + index + 1}.`
                  : `${index + 1}.`}{" "}
                {item.text}
              </Label>
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
                            (o) => o.id === matchedOption.id
                          )
                      ) + "."
                    : ""
                }
                onDrop={handleDrop}
                itemType={ITEM_TYPE}
                placeholder="Drag an option here"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
