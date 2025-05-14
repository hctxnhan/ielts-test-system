"use client";
import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { Checkbox } from "@testComponents/components/ui/checkbox";
import { List, X, PlusCircle } from "lucide-react";
import { PickFromAListQuestion } from "@testComponents/lib/types";

interface PickFromListEditorProps {
  question: PickFromAListQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Record<string, unknown>,
  ) => void;
}

export default function PickFromListEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: PickFromListEditorProps) {
  // Helper to check if an item is in the list of correct answers
  const isItemCorrect = (itemId: string): boolean => {
    return (question.subQuestions || []).some((sq) => sq.item === itemId);
  };

  // Toggle an item's correct status
  const toggleItemCorrect = (itemId: string, isChecked: boolean) => {
    const newSubQuestions = [...(question.subQuestions || [])];
    const existingIndex = newSubQuestions.findIndex((sq) => sq.item === itemId);

    if (isChecked) {
      // Add to correct answers if checked
      if (existingIndex === -1) {
        newSubQuestions.push({
          subId: crypto.randomUUID(),
          item: itemId,
          correctAnswer: "true",
          points: 1,
          subIndex: newSubQuestions.length,
        });
      }
    } else {
      // Remove from correct answers if unchecked
      if (existingIndex !== -1) {
        newSubQuestions.splice(existingIndex, 1);
      }
    }

    onUpdateQuestion(sectionId, question.id, {
      subQuestions: newSubQuestions,
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <List className="w-3 h-3" />
          List Items
        </Label>
        <div className="space-y-1.5">
          {(question.items || []).map((item, itemIndex) => (
            <div key={item.id} className="flex gap-2 items-center">
              <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
                {itemIndex + 1}
              </div>
              <Input
                value={item.text}
                onChange={(e) => {
                  const newItems = [...(question.items || [])];
                  newItems[itemIndex] = { ...item, text: e.target.value };
                  onUpdateQuestion(sectionId, question.id, {
                    items: newItems,
                  });
                }}
                placeholder={`Item ${itemIndex + 1}`}
                className="h-7 text-sm flex-1"
              />
              <Checkbox
                id={`correct-${item.id}`}
                checked={isItemCorrect(item.id)}
                onCheckedChange={(checked) => {
                  toggleItemCorrect(item.id, checked === true);
                }}
              />
              <Label
                htmlFor={`correct-${item.id}`}
                className="text-xs whitespace-nowrap cursor-pointer"
              >
                Correct
              </Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newItems = (question.items || []).filter(
                    (_, i) => i !== itemIndex,
                  );
                  onUpdateQuestion(sectionId, question.id, {
                    items: newItems,
                  });
                }}
                disabled={(question.items || []).length <= 2}
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newItems = [
              ...(question.items || []),
              { id: crypto.randomUUID(), text: "" },
            ];
            onUpdateQuestion(sectionId, question.id, { items: newItems });
          }}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
        >
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Add Item
        </Button>
      </div>
    </div>
  );
}
