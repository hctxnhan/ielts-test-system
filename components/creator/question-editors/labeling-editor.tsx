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
import {
  Image,
  BookOpen,
  List,
  X,
  PlusCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import FilePicker from "@/components/file-picker";
import type { FileObject } from "@/lib/supabase-storage";

interface LabelingEditorProps {
  question: LabelingQuestion;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<LabelingQuestion>
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

  const handleLabelAdd = () => {
    const newLabels = [
      ...(question.labels || []),
      { id: crypto.randomUUID(), text: "" },
    ];
    onUpdateQuestion(sectionId, question.id, { labels: newLabels });
  };

  const handleLabelRemove = (labelId: string) => {
    const newLabels = question.labels.filter((label) => label.id !== labelId);
    onUpdateQuestion(sectionId, question.id, { labels: newLabels });
  };

  const handleLabelTextChange = (labelId: string, text: string) => {
    const newLabels = question.labels.map((label) =>
      label.id === labelId ? { ...label, text } : label
    );
    onUpdateQuestion(sectionId, question.id, { labels: newLabels });
  };

  const handleOptionAdd = () => {
    const newOptions = [
      ...(question.options || []),
      { id: crypto.randomUUID(), text: "" },
    ];
    onUpdateQuestion(sectionId, question.id, { options: newOptions });
  };

  const handleOptionRemove = (optionId: string) => {
    const newOptions = question.options.filter(
      (option) => option.id !== optionId
    );
    onUpdateQuestion(sectionId, question.id, { options: newOptions });
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    const newOptions = question.options.map((option) =>
      option.id === optionId ? { ...option, text } : option
    );
    onUpdateQuestion(sectionId, question.id, { options: newOptions });
  };

  const handleAnswerSelect = (labelId: string, optionId: string) => {
    const newSubQuestions = [...(question.subQuestions || [])];
    const existingIndex = newSubQuestions.findIndex(
      (sq) => sq.item === labelId
    );

    if (existingIndex === -1) {
      newSubQuestions.push({
        subId: crypto.randomUUID(),
        item: labelId,
        correctAnswer: optionId,
        points: 1,
        subIndex: newSubQuestions.length,
      });
    } else {
      newSubQuestions[existingIndex] = {
        ...newSubQuestions[existingIndex],
        correctAnswer: optionId,
        subIndex: existingIndex,
      };
    }

    onUpdateQuestion(sectionId, question.id, { subQuestions: newSubQuestions });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Image className="w-3 h-3" />
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
            <BookOpen className="w-3 h-3" />
            Labels (on image)
          </Label>
          <div className="space-y-1">
            {(question.labels || []).map((label, index) => (
              <div key={label.id} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {index + 1}
                </div>
                <Input
                  value={label.text}
                  onChange={(e) =>
                    handleLabelTextChange(label.id, e.target.value)
                  }
                  placeholder={`Label ${index + 1}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleLabelRemove(label.id)}
                  disabled={(question.labels || []).length <= 2}
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
            onClick={handleLabelAdd}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Label
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <List className="w-3 h-3" />
            Options
          </Label>
          <div className="space-y-1">
            {(question.options || []).map((option, index) => (
              <div key={option.id} className="flex gap-1.5 items-center">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted/50 text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </div>
                <Input
                  value={option.text}
                  onChange={(e) =>
                    handleOptionTextChange(option.id, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="h-7 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOptionRemove(option.id)}
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
            onClick={handleOptionAdd}
            className="h-7 text-xs w-full justify-start bg-muted/30 hover:bg-muted/50 mt-1"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3" />
          Correct Answers
        </Label>
        <div className="space-y-1 bg-muted/20 p-2 rounded-md">
          {(question.labels || []).map((label, index) => (
            <div key={label.id} className="flex items-center gap-1.5 text-sm">
              <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-muted/50 text-xs font-medium">
                {index + 1}
              </div>
              <span className="w-1/3 text-xs truncate">
                {label.text || `Label ${index + 1}`}
              </span>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <Select
                value={
                  question.subQuestions?.find((sq) => sq.item === label.id)
                    ?.correctAnswer || ""
                }
                onValueChange={(optionId) =>
                  handleAnswerSelect(label.id, optionId)
                }
              >
                <SelectTrigger className="flex-1 h-7 text-xs">
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {(question.options || []).map((option, optIndex) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
