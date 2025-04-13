"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  List,
  X,
  Globe,
  CheckCircle,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import type { PickFromListQuestion } from "@/lib/types";

interface PickFromListEditorProps {
  question: PickFromListQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function PickFromListEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: PickFromListEditorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <List className="w-3 h-3" />
            Options
          </Label>
          <div className="space-y-1">
            {(question.options || []).map((option, optIndex) => (
              <div key={option.id} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {String.fromCharCode(65 + optIndex)}
                </div>
                <Input
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[optIndex] = { ...option, text: e.target.value };
                    onUpdateQuestion(sectionId, question.id, {
                      options: newOptions,
                    });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newOptions = (question.options || []).filter(
                      (_, i) => i !== optIndex
                    );

                    onUpdateQuestion(sectionId, question.id, {
                      options: newOptions,
                    });
                  }}
                  disabled={(question.options || []).length <= 2}
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
              const newOptions = [
                ...(question.options || []),
                { id: crypto.randomUUID(), text: "" },
              ];
              onUpdateQuestion(sectionId, question.id, { options: newOptions });
            }}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            Items
          </Label>
          <div className="space-y-1">
            {(question.items || []).map((item, itemIndex) => (
              <div key={item.id} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
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
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newItems = (question.items || []).filter(
                      (_, i) => i !== itemIndex
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3" />
          Correct Answers
        </Label>
        <div className="space-y-1 bg-muted/20 p-2 rounded-md">
          {(question.items || []).map((item, itemIndex) => (
            <div key={item.id} className="flex items-center gap-1.5 text-sm">
              <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
                {itemIndex + 1}
              </div>
              <span className="w-1/3 text-xs truncate">
                {item.text || `Item ${itemIndex + 1}`}
              </span>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <Select
                value={
                  question.subQuestions?.find((sq) => sq.item === item.id)
                    ?.correctAnswer || ""
                }
                onValueChange={(value) => {
                  const newSubQuestions = [...(question.subQuestions || [])];
                  const existingIndex = newSubQuestions.findIndex(
                    (sq) => sq.item === item.id
                  );

                  if (existingIndex === -1) {
                    newSubQuestions.push({
                      subId: crypto.randomUUID(),
                      item: item.id,
                      correctAnswer: value,
                      points: 1,
                      subIndex: newSubQuestions.length,
                    });
                  } else {
                    newSubQuestions[existingIndex] = {
                      ...newSubQuestions[existingIndex],
                      correctAnswer: value,
                      subIndex: existingIndex,
                    };
                  }
                  onUpdateQuestion(sectionId, question.id, {
                    subQuestions: newSubQuestions,
                  });
                }}
              >
                <SelectTrigger className="flex-1 h-7 text-xs">
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {(question.options || []).map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      className="text-sm py-1.5 px-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center h-4 w-4 rounded-full bg-muted/50 text-xs font-medium">
                          {String.fromCharCode(
                            65 +
                              question.options.findIndex(
                                (o) => o.id === option.id
                              )
                          )}
                        </div>
                        <span>
                          {option.text ||
                            `Option ${
                              question.options.findIndex(
                                (o) => o.id === option.id
                              ) + 1
                            }`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
