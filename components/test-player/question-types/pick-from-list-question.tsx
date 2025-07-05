"use client";
import { Checkbox } from "@testComponents/components/ui/checkbox";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { PickFromAListQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import { useEffect, useState } from "react";

interface PickFromListQuestionProps {
  question: PickFromAListQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (questionId: string, content: string) => void;
}

export default function PickFromListQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => {},
}: PickFromListQuestionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    if (value) {
      setSelectedAnswers(value);
    }
  }, [value]);

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (readOnly) return;

    setSelectedAnswers((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[itemId] = itemId;
      } else {
        delete updated[itemId];
      }
      
      if (question.scoringStrategy === "partial") {
        onChange(updated, itemId);
      } else {
        onChange(updated);
      }
      return updated;
    });
  };

  const subQuestions = question.subQuestions || [];
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
      />
      
      <div className="space-y-4">
        <p className="text-base font-semibold text-gray-700">
          Which TWO options describe what the writer is doing in section two?
        </p>
        
        <div className="space-y-3">
          {question.items.map((item, index) => {
            const isSelected = !!selectedAnswers[item.id];
            const letter = String.fromCharCode(65 + index);
            
            // Check if this item is correct
            const isCorrectItem = question.subQuestions.some((sq) => sq.item === item.id);
            const isCorrect = showCorrectAnswer && isSelected && isCorrectItem;
            const isIncorrect = showCorrectAnswer && isSelected && !isCorrectItem;
            const shouldShowAsCorrect = showCorrectAnswer && isCorrectItem && !isSelected;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors duration-200",
                  isCorrect && "border-green-500 bg-green-50",
                  isIncorrect && "border-red-500 bg-red-50",
                  shouldShowAsCorrect && "border-green-500 bg-green-50",
                  !isCorrect && !isIncorrect && !shouldShowAsCorrect && "border-gray-200 hover:border-gray-300"
                )}
              >
                <Checkbox
                  id={item.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleItemSelection(item.id, checked as boolean)
                  }
                  disabled={readOnly}
                  className={cn(
                    "mt-0.5",
                    isCorrect && "border-green-500 data-[state=checked]:bg-green-500",
                    isIncorrect && "border-red-500 data-[state=checked]:bg-red-500",
                    shouldShowAsCorrect && "border-green-500"
                  )}
                />
                <Label
                  htmlFor={item.id}
                  className={cn(
                    "flex-1 cursor-pointer text-sm leading-relaxed",
                    isCorrect && "text-green-800",
                    isIncorrect && "text-red-800",
                    shouldShowAsCorrect && "text-green-800"
                  )}
                >
                  <span className="font-medium mr-2">{letter}.</span>
                  {item.text}
                  {shouldShowAsCorrect && (
                    <span className="ml-2 text-green-600 font-medium">✓ Correct answer</span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
