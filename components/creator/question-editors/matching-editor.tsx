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
import { PlusCircle } from "lucide-react";
import type { MatchingQuestion } from "@/lib/types";

interface MatchingEditorProps {
  question: MatchingQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function MatchingEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: MatchingEditorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Items
          </Label>
          <div className="space-y-1">
            {question.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {itemIndex + 1}
                </div>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...question.items];
                    newItems[itemIndex] = e.target.value;
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
                    const newItems = question.items.filter(
                      (_, i) => i !== itemIndex
                    );
                    // Also update correctMatches
                    const newMatches = { ...question.correctMatches };
                    delete newMatches[itemIndex];
                    // Renumber keys
                    const updatedMatches: Record<number, number> = {};
                    Object.entries(newMatches).forEach(([key, value]) => {
                      const keyNum = Number.parseInt(key);
                      if (keyNum > itemIndex) {
                        updatedMatches[keyNum - 1] = value;
                      } else {
                        updatedMatches[keyNum] = value;
                      }
                    });

                    onUpdateQuestion(sectionId, question.id, {
                      items: newItems,
                      correctMatches: updatedMatches,
                    });
                  }}
                  disabled={question.items.length <= 2}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newItems = [...question.items, ""];
              const newIndex = question.items.length;
              const newMatches = { ...question.correctMatches, [newIndex]: 0 };
              onUpdateQuestion(sectionId, question.id, {
                items: newItems,
                correctMatches: newMatches,
              });
            }}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Options
          </Label>
          <div className="space-y-1">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {String.fromCharCode(65 + optIndex)}
                </div>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[optIndex] = e.target.value;
                    onUpdateQuestion(sectionId, question.id, {
                      options: newOptions,
                    });
                  }}
                  placeholder={`Option ${optIndex + 1}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newOptions = question.options.filter(
                      (_, i) => i !== optIndex
                    );
                    onUpdateQuestion(sectionId, question.id, {
                      options: newOptions,
                    });
                  }}
                  disabled={question.options.length <= 2}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const newOptions = [...question.options, ""];
              onUpdateQuestion(sectionId, question.id, { options: newOptions });
            }}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Correct Matches
        </Label>
        <div className="space-y-1 bg-muted/20 p-2 rounded-md">
          {question.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-1.5 text-sm">
              <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
                {itemIndex + 1}
              </div>
              <span className="w-1/3 text-xs truncate">
                {item || `Item ${itemIndex + 1}`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
              <Select
                value={(question.correctMatches[itemIndex] || 0).toString()}
                onValueChange={(value) => {
                  const newMatches = { ...question.correctMatches };
                  newMatches[itemIndex] = Number.parseInt(value);
                  onUpdateQuestion(sectionId, question.id, {
                    correctMatches: newMatches,
                  });
                }}
              >
                <SelectTrigger className="flex-1 h-7 text-xs">
                  <SelectValue placeholder="Select matching option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((option, optIndex) => (
                    <SelectItem
                      key={optIndex}
                      value={optIndex.toString()}
                      className="text-sm py-1.5 px-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center h-4 w-4 rounded-full bg-muted/50 text-xs font-medium">
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span>{option || `Option ${optIndex + 1}`}</span>
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
