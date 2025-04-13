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
import type {
  MatchingItem,
  MatchingOption,
  MatchingQuestion,
} from "@/lib/types";
import { ArrowRight, Check, Globe, List, PlusCircle, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

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
  const [isUsingStructuredFormat, setIsUsingStructuredFormat] = useState(
    () =>
      Array.isArray(question.items) &&
      question.items.length > 0 &&
      typeof question.items[0] !== "string"
  );

  const initializeItems = useCallback(() => {
    if (
      !question.items ||
      !Array.isArray(question.items) ||
      question.items.length === 0
    ) {
      return [
        { id: "item_1", text: "" },
        { id: "item_2", text: "" },
      ];
    }
    return question.items as MatchingItem[];
  }, [question.items]);

  const initializeOptions = useCallback(() => {
    if (
      !question.options ||
      !Array.isArray(question.options) ||
      question.options.length === 0
    ) {
      return [
        { id: "opt_1", text: "" },
        { id: "opt_2", text: "" },
      ];
    }
    return question.options as MatchingOption[];
  }, [question.options]);

  const initializeSubQuestions = useCallback(() => {
    return initializeItems().map((item, index) => {
      const existingSubQuestion = question.subQuestions?.find(
        (sq) => sq.item === item.id
      );

      return {
        subId: existingSubQuestion?.subId || `${question.id}_${index + 1}`,
        subIndex: index,
        item: item.id,
        correctAnswer:
          existingSubQuestion?.correctAnswer ||
          initializeOptions()[0]?.id ||
          "",
        points: 1,
      };
    });
  }, [initializeItems, initializeOptions, question.id, question.subQuestions]);

  const [items, setItems] = useState<MatchingItem[]>(initializeItems);
  const [options, setOptions] = useState<MatchingOption[]>(initializeOptions);
  const [subQuestions, setSubQuestions] = useState<
    MatchingQuestion["subQuestions"]
  >(initializeSubQuestions);

  useEffect(() => {
    const formattedSubQuestions = items.map((item, index) => {
      const existingSubQuestion = subQuestions.find(
        (sq) => sq.item === item.id
      );

      return {
        subId: existingSubQuestion?.subId || `${question.id}_${index + 1}`,
        subIndex: index + 1,
        item: item.id,
        correctAnswer:
          existingSubQuestion?.correctAnswer || options[0]?.id || "",
        points: existingSubQuestion?.points || 1,
      };
    });

    onUpdateQuestion(sectionId, question.id, {
      items,
      options,
      subQuestions: formattedSubQuestions,
    });
  }, [items, options, subQuestions, sectionId, question.id, onUpdateQuestion]);

  const addItem = useCallback(() => {
    const newItemId = `item_${items.length + 1}`;
    const newItem: MatchingItem = { id: newItemId, text: "" };
    setItems((prevItems) => [...prevItems, newItem]);

    setSubQuestions((prevSubQuestions) => [
      ...prevSubQuestions,
      {
        subId: `${question.id}_${items.length + 1}`,
        subIndex: items.length + 1,
        item: newItemId,
        correctAnswer: options[0]?.id || "",
        points: 1,
      },
    ]);
  }, [items.length, options, question.id]);

  const removeItem = useCallback((itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    setSubQuestions((prevSubQuestions) => {
      const filteredSubQuestions = prevSubQuestions.filter(
        (sq) => sq.item !== itemId
      );
      return filteredSubQuestions.map((sq, idx) => ({
        ...sq,
        subIndex: idx + 1,
      }));
    });
  }, []);

  const updateItemText = useCallback((itemId: string, newText: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      )
    );
    setSubQuestions((prevSubQuestions) =>
      prevSubQuestions.map((sq) =>
        sq.item === itemId ? { ...sq, itemContent: newText } : sq
      )
    );
  }, []);

  const addOption = useCallback(() => {
    const newOptionId = `opt_${options.length + 1}`;
    const newOption: MatchingOption = { id: newOptionId, text: "" };
    setOptions((prevOptions) => [...prevOptions, newOption]);
  }, [options.length]);

  const removeOption = useCallback(
    (optionId: string) => {
      setOptions((prevOptions) =>
        prevOptions.filter((option) => option.id !== optionId)
      );
      setSubQuestions((prevSubQuestions) =>
        prevSubQuestions.map((sq) => {
          if (sq.correctAnswer === optionId) {
            return { ...sq, correctAnswer: options[0]?.id || "" };
          }
          return sq;
        })
      );
    },
    [options]
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <List className="h-3 w-3" />
            Items
          </Label>
          <div className="space-y-1">
            {items.map((item, itemIndex) => (
              <div key={item.id} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {itemIndex + 1}
                </div>
                <Input
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  placeholder={`Item ${itemIndex + 1}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length <= 2}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            Options
          </Label>
          <div className="space-y-1">
            {options.map((option, optIndex) => (
              <div key={option.id} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {String.fromCharCode(65 + optIndex)}
                </div>
                <Input
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[optIndex].text = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`Option ${optIndex + 1}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= 2}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={addOption}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Check className="h-3 w-3" />
          Correct Matches
        </Label>
        <div className="space-y-1 bg-muted/20 p-2 rounded-md">
          {items.map((item, itemIndex) => {
            // Find corresponding subQuestion for this item
            const subQuestion = subQuestions.find((sq) => sq.item === item.id);
            const correctOptionId =
              subQuestion?.correctAnswer || options[0]?.id || "";

            return (
              <div key={item.id} className="flex items-center gap-1.5 text-sm">
                <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
                  {itemIndex + 1}
                </div>
                <span className="w-1/3 text-xs truncate">
                  {item.text || `Item ${itemIndex + 1}`}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <Select
                  value={correctOptionId}
                  onValueChange={(optionId) => {
                    const newSubQuestions = [...subQuestions];
                    const subQuestionIndex = newSubQuestions.findIndex(
                      (sq) => sq.item === item.id
                    );

                    if (subQuestionIndex >= 0) {
                      newSubQuestions[subQuestionIndex] = {
                        ...newSubQuestions[subQuestionIndex],
                        correctAnswer: optionId,
                      };
                    } else {
                      // Create new subQuestion if it doesn't exist
                      newSubQuestions.push({
                        subId: `${question.id}_${itemIndex + 1}`,
                        item: item.id,
                        correctAnswer: optionId,
                        points: 1,
                      });
                    }

                    setSubQuestions(newSubQuestions);
                  }}
                >
                  <SelectTrigger className="flex-1 h-7 text-xs">
                    <SelectValue placeholder="Select matching option" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option, optIndex) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="text-sm py-1.5 px-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center justify-center h-4 w-4 rounded-full bg-muted/50 text-xs font-medium">
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <span>{option.text || `Option ${optIndex + 1}`}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
