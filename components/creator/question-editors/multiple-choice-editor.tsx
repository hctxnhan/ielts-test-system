"use client";

import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import { Switch } from "@testComponents/components/ui/switch";
import type { MultipleChoiceQuestion } from "@testComponents/lib/types";
import { List, X, PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface MultipleChoiceEditorProps {
  question: MultipleChoiceQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function MultipleChoiceEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: MultipleChoiceEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <List className="w-3 h-3" />
          Options
        </Label>
        <div className="space-y-1">
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex gap-1.5 items-center">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                {optIndex + 1}
              </div>
              <Input
                value={option.text}
                onChange={(e) => {
                  const newOptions = [...question.options];
                  newOptions[optIndex] = {
                    ...option,
                    text: e.target.value,
                  };
                  onUpdateQuestion(sectionId, question.id, {
                    options: newOptions,
                  });
                }}
                placeholder={`Option ${optIndex + 1}`}
                className="h-7 text-sm"
              />
              <Switch
                checked={option.isCorrect}
                onCheckedChange={(checked) => {
                  const newOptions = [...question.options];
                  // If this is being marked as correct, unmark others as we only allow one correct answer
                  if (checked) {
                    newOptions.forEach((opt) => {
                      opt.isCorrect = false;
                    });
                  }
                  newOptions[optIndex] = {
                    ...option,
                    isCorrect: checked,
                  };
                  onUpdateQuestion(sectionId, question.id, {
                    options: newOptions,
                  });
                }}
                className="data-[state=checked]:bg-green 500"
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
              ...question.options,
              {
                id: `opt_${question.options.length + 1}`,
                text: "",
                is_correct: false,
              },
            ];
            onUpdateQuestion(sectionId, question.id, { options: newOptions });
          }}
          className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
        >
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Add Option
        </Button>
      </div>
      <div className="space-y-1.5 pt-4">
        <Label className="text-xs font-medium">Explanation</Label>

        <RichTextEditor
          id={`question-explanation-${question.id}`}
          value={question.explanation || ""}
          onChange={(content) =>
            onUpdateQuestion(sectionId, question.id, {
              explanation: content,
            })
          }
          placeholder="Add explanation for this question"
          minHeight={150}
          maxHeight={200}
          className="text-sm"
          enableHighlight={false}
        />
      </div>
    </div>
  );
}
