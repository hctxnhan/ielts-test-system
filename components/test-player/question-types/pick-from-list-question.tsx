"use client";
import { Checkbox } from "@testComponents/components/ui/checkbox";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { PickFromAListQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";

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
  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (readOnly) return;

    const currentValues = value || {};
    let selectedItems = Object.values(currentValues);
    
    if (checked) {
      // Add the item if not already selected
      if (!selectedItems.includes(itemId)) {
        selectedItems.push(itemId);
      }
    } else {
      // Remove the item
      selectedItems = selectedItems.filter(item => item !== itemId);
    }
    
    // Map selected items to subquestion IDs in order
    const updated: Record<string, string> = {};

    selectedItems.forEach((item, index) => {
      if (index < question.subQuestions.length) {
        const subQuestionId = question.subQuestions[index].subId;
        updated[subQuestionId] = item;
      }
    });
    
    if (question.scoringStrategy === "partial") {
      // Find which subquestionId this change affects
      const affectedSubQuestionIndex = selectedItems.indexOf(itemId);
      const affectedSubQuestionId = affectedSubQuestionIndex >= 0 && affectedSubQuestionIndex < question.subQuestions.length
        ? question.subQuestions[affectedSubQuestionIndex].subId
        : undefined;
      onChange(updated, affectedSubQuestionId);
    } else {
      onChange(updated);
    }
  };

  const selectedCount = value ? Object.values(value).length : 0;
  const maxSelections = question.subQuestions.length;
  const isMaxSelected = selectedCount >= maxSelections;

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
        {/* <p className="text-base font-semibold text-gray-700">
          Which TWO options describe what the writer is doing in section two?
        </p> */}
        
        <div className="space-y-3">
          {question.items.map((item, index) => {
            const isSelected = value ? Object.values(value).includes(item.id) : false;
            const letter = String.fromCharCode(65 + index);
            
            // Check if this item is correct
            const isCorrectItem = question.subQuestions.some((sq) => sq.item === item.id);
            const isCorrect = showCorrectAnswer && isSelected && isCorrectItem;
            const isIncorrect = showCorrectAnswer && isSelected && !isCorrectItem;
            const shouldShowAsCorrect = showCorrectAnswer && isCorrectItem && !isSelected;
            
            // Check if this item should be grayed out (max selections reached and this item is not selected)
            const isGreyedOut = isMaxSelected && !isSelected && !readOnly && !showCorrectAnswer;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors duration-200",
                  isCorrect && "border-green-500 bg-green-50",
                  isIncorrect && "border-red-500 bg-red-50",
                  shouldShowAsCorrect && "border-green-500 bg-green-50",
                  isGreyedOut && "border-gray-100 bg-gray-50",
                  !isCorrect && !isIncorrect && !shouldShowAsCorrect && !isGreyedOut && "border-gray-200 hover:border-gray-300"
                )}
              >
                <Checkbox
                  id={item.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleItemSelection(item.id, checked as boolean)
                  }
                  disabled={readOnly || isGreyedOut}
                  className={cn(
                    "mt-0.5",
                    isCorrect && "border-green-500 data-[state=checked]:bg-green-500",
                    isIncorrect && "border-red-500 data-[state=checked]:bg-red-500",
                    shouldShowAsCorrect && "border-green-500",
                    isGreyedOut && "border-gray-300 opacity-50"
                  )}
                />
                <Label
                  htmlFor={item.id}
                  className={cn(
                    "flex-1 cursor-pointer text-sm leading-relaxed",
                    isCorrect && "text-green-800",
                    isIncorrect && "text-red-800",
                    shouldShowAsCorrect && "text-green-800",
                    isGreyedOut && "text-gray-400 cursor-not-allowed"
                  )}
                >
                  <span className="font-medium mr-2">{letter}.</span>
                  {item.text}
                  
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
