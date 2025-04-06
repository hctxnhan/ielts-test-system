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
import type { LabelingQuestion } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import FilePicker from "@/components/file-picker";
import type { FileObject } from "@/lib/supabase-storage";

interface LabelingEditorProps {
  question: LabelingQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
}

export default function LabelingEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: LabelingEditorProps) {
  const handleImageSelect = (file: FileObject) => {
    onUpdateQuestion(sectionId, question.id, { imageUrl: file.url });
  };

  return (
    <div className="space-y-3">
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Image
        </Label>
        <FilePicker
          fileType="image"
          onFileSelect={handleImageSelect}
          currentFileUrl={question.imageUrl}
        />
      </div>

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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Labels (on image)
          </Label>
          <div className="space-y-1">
            {question.labels.map((label, labelIndex) => (
              <div key={labelIndex} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {labelIndex + 1}
                </div>
                <Input
                  value={label}
                  onChange={(e) => {
                    const newLabels = [...question.labels];
                    newLabels[labelIndex] = e.target.value;
                    onUpdateQuestion(sectionId, question.id, {
                      labels: newLabels,
                    });
                  }}
                  placeholder={`Label ${labelIndex + 1}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newLabels = question.labels.filter(
                      (_, i) => i !== labelIndex
                    );
                    onUpdateQuestion(sectionId, question.id, {
                      labels: newLabels,
                    });
                  }}
                  disabled={question.labels.length <= 2}
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
              const newLabels = [...question.labels, ""];
              onUpdateQuestion(sectionId, question.id, { labels: newLabels });
            }}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Label
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
            {(question.options || []).map((option, optIndex) => (
              <div key={optIndex} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {String.fromCharCode(65 + optIndex)}
                </div>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
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
              const newOptions = [...(question.options || []), ""];
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
          Correct Answers
        </Label>
        <div className="space-y-1 bg-muted/20 p-2 rounded-md">
          {question.labels.map((label, labelIndex) => (
            <div key={labelIndex} className="flex items-center gap-1.5 text-sm">
              <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
                {labelIndex + 1}
              </div>
              <span className="w-1/3 text-xs truncate">
                {label || `Label ${labelIndex + 1}`}
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
                value={(question.correctLabels[labelIndex] || 0).toString()}
                onValueChange={(value) => {
                  const newCorrectLabels = { ...question.correctLabels };
                  newCorrectLabels[labelIndex] = Number.parseInt(value);
                  onUpdateQuestion(sectionId, question.id, {
                    correctLabels: newCorrectLabels,
                  });
                }}
              >
                <SelectTrigger className="flex-1 h-7 text-xs">
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {(question.options || []).map((option, optIndex) => (
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
