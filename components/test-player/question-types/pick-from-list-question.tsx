"use client";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Label } from "@testComponents/components/ui/label";
import type { PickFromListQuestion } from "@testComponents/lib/types";
import { DraggableItem, DroppableZone } from "./shared/dnd-components";

interface PickFromListQuestionProps {
  question: PickFromListQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
}

const ITEM_TYPE = "OPTION";

export default function PickFromListQuestionRenderer({
  question,
  value,
  onChange,
}: PickFromListQuestionProps) {
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
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <p className="font-medium">{question.text}</p>
        <div className="space-y-2 w-fit">
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
          {question.items.map((item, index) => {
            // Find the corresponding subQuestion
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
                              (o) => o.id === matchedOption.id,
                            ),
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
    </DndProvider>
  );
}
