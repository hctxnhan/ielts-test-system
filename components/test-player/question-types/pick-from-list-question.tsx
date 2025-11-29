"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { Checkbox } from "@testComponents/components/ui/checkbox";
import { RichTextContent } from "@testComponents/components/ui/rich-text-content";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { PickFromAListQuestion } from "@testComponents/lib/types";
import { cn } from "@testComponents/lib/utils";
import _ from "lodash";

interface PickFromListQuestionProps {
  question: PickFromAListQuestion;
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>, subQuestionId?: string) => void;
  readOnly?: boolean;
  showCorrectAnswer?: boolean;
  onQuestionHighlighted?: (
    questionId: string,
    content: string,
    field: "text" | string
  ) => void;
}

export default function PickFromListQuestionRenderer({
  question,
  value,
  onChange,
  readOnly = false,
  showCorrectAnswer = false,
  onQuestionHighlighted = () => { },
}: PickFromListQuestionProps) {
  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (readOnly) return;

    const currentValues = value || {};
    let selectedItems = Object.values(currentValues);

    if (checked) {
      if (!selectedItems.includes(itemId)) {
        selectedItems.push(itemId);
      }
    } else {
      selectedItems = selectedItems.filter((item) => item !== itemId);
    }

    const updated: Record<string, string> = {};

    selectedItems.forEach((item, index) => {
      if (index < question.subQuestions.length) {
        const subQuestionId = question.subQuestions[index].subId;
        updated[subQuestionId] = item;
      }
    });

    if (question.scoringStrategy === "partial") {
      const affectedSubQuestionIndex = selectedItems.indexOf(itemId);
      const affectedSubQuestionId =
        affectedSubQuestionIndex >= 0 &&
          affectedSubQuestionIndex < question.subQuestions.length
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
        onChange={(content) => onQuestionHighlighted(question.id, content, "text")}
        readonly={true}
        className={cn("leading-relaxed w-full h-full", "cursor-default")}
        minHeight={20}
      />

      <div className="space-y-4">
        <div className="space-y-3">
          {question.items.map((item, index) => {
            const isSelected = value
              ? Object.values(value).includes(item.id)
              : false;
            const letter = String.fromCharCode(65 + index);
            const labelId = `${item.id}-label`;
            const isCorrectItem = question.subQuestions.some(
              (sq) => sq.item === item.id,
            );
            const isCorrect = showCorrectAnswer && isSelected && isCorrectItem;
            const isIncorrect =
              showCorrectAnswer && isSelected && !isCorrectItem;
            const shouldShowAsCorrect =
              showCorrectAnswer && isCorrectItem && !isSelected;

            const isGreyedOut =
              isMaxSelected && !isSelected && !readOnly && !showCorrectAnswer;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors duration-200",
                  isCorrect && "border-green-500 bg-green-50",
                  isIncorrect && "border-red-500 bg-red-50",
                  shouldShowAsCorrect && "border-green-500 bg-green-50",
                  isGreyedOut && "border-gray-100 bg-gray-50",
                  !isCorrect &&
                  !isIncorrect &&
                  !shouldShowAsCorrect &&
                  !isGreyedOut &&
                  "border-gray-200 hover:border-gray-300",
                )}
              >
                <Checkbox
                  id={item.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleItemSelection(item.id, checked as boolean)
                  }
                  disabled={readOnly || isGreyedOut}
                  aria-labelledby={labelId}
                  className={cn(
                    "mt-0.5",
                    isCorrect &&
                    "border-green-500 data-[state=checked]:bg-green-500",
                    isIncorrect &&
                    "border-red-500 data-[state=checked]:bg-red-500",
                    shouldShowAsCorrect && "border-green-500",
                    isGreyedOut && "border-gray-300 opacity-50",
                  )}
                />

                <div
                  id={labelId}
                  className={cn(
                    "flex-1 flex items-start space-x-1.5 text-sm leading-relaxed",
                    isCorrect && "text-green-800",
                    isIncorrect && "text-red-800",
                    shouldShowAsCorrect && "text-green-800",
                    isGreyedOut && "text-gray-400",
                  )}
                >
                  <span className="font-medium">{letter}.</span>
                  <RichTextEditor
                    value={item.text}
                    onChange={(content) =>
                      onQuestionHighlighted(question.id, content, item.id)
                    }
                    readonly={true}
                    className={cn(
                      "w-full h-full",
                      "cursor-default",
                      "pfl-item-editor",
                    )}
                    minHeight={20}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!_.isEmpty(question.explanation) && readOnly && (
        <Accordion type="single" collapsible className="mt-4 border-0">
          <AccordionItem value="transcript">
            <AccordionTrigger className={cn(
              "text-sm font-bold underline flex items-center gap-2 py-2",
              "hover:no-underline outline-none border-0 text-blue-600"
            )}>
              Giải thích đáp án
            </AccordionTrigger>
            <AccordionContent className="p-0 border-0">

              <RichTextContent content={question.explanation} />

            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <style jsx global>{`
        .pfl-item-editor .ProseMirror {
          padding: 0 !important;
        }
        .pfl-item-editor .ProseMirror p {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
