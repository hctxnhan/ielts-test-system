"use client";
import React from "react";
import { Label } from "@testComponents/components/ui/label";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import {
  RadioGroup,
  RadioGroupItem,
} from "@testComponents/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@testComponents/components/ui/card";
import type { Question, ScoringStrategy } from "@testComponents/lib/types";
import type { FileObject } from "@testComponents/lib/supabase-storage";
import { BarChart2, MessageSquare, Image } from "lucide-react";
import FilePicker from "@testComponents/components/file-picker";
import { QuestionPluginRegistry } from "@testComponents/lib/question-plugin-system";

interface PluginBasedQuestionEditorProps {
  question: Question;
  sectionId: string;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => void;
}

export default function PluginBasedQuestionEditor({
  question,
  sectionId,
  onUpdateQuestion,
}: PluginBasedQuestionEditorProps) {
  // Get the plugin for this question type
  const plugin = QuestionPluginRegistry.getPlugin(question.type);
  
  if (!plugin) {
    return (
      <Card className="mt-2">
        <CardHeader className="py-3">
          <CardTitle className="text-base text-red-600">
            Unsupported Question Type
          </CardTitle>
          <CardDescription className="text-xs">
            No plugin registered for question type: {question.type}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const supportsPartialScoring = plugin.config.supportsPartialScoring;

  // Get the editor component from the plugin
  const EditorComponent = plugin.createEditor();

  return (
    <Card className="mt-2">
      <CardHeader className="py-3">
        <CardTitle className="text-base">Question Details</CardTitle>
        <CardDescription className="text-xs">
          Configure the question settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-3">
        <div className="space-y-1.5">
          <Label
            htmlFor={`question-text-${question.id}`}
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Question Text
          </Label>
          <RichTextEditor
            id={`question-text-${question.id}`}
            value={question.text || ""}
            onChange={(content) =>
              onUpdateQuestion(sectionId, question.id, { text: content })
            }
            placeholder="Enter your question text here..."
            className="text-sm"
            minHeight={40}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor={`question-points-${question.id}`}
              className="text-xs font-medium flex items-center gap-1.5"
            >
              <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
              Points
            </Label>
            <input
              id={`question-points-${question.id}`}
              type="number"
              min="0"
              step="0.5"
              value={question.points}
              onChange={(e) =>
                onUpdateQuestion(sectionId, question.id, {
                  points: parseFloat(e.target.value) || 0,
                })
              }
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {supportsPartialScoring && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Scoring Strategy</Label>
              <RadioGroup
                value={question.scoringStrategy}
                onValueChange={(value: ScoringStrategy) =>
                  onUpdateQuestion(sectionId, question.id, {
                    scoringStrategy: value,
                  })
                }
                className="flex flex-row gap-4"
              >
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem
                    value="partial"
                    id={`partial-${question.id}`}
                    className="h-3.5 w-3.5"
                  />
                  <Label
                    htmlFor={`partial-${question.id}`}
                    className="text-xs font-normal"
                  >
                    Partial
                  </Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem
                    value="all-or-nothing"
                    id={`all-or-nothing-${question.id}`}
                    className="h-3.5 w-3.5"
                  />
                  <Label
                    htmlFor={`all-or-nothing-${question.id}`}
                    className="text-xs font-normal"
                  >
                    All or Nothing
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5 text-muted-foreground" />
            Question Image (Optional)
          </Label>
          <FilePicker
            fileType="image"
            onFileSelect={(file: FileObject) =>
              onUpdateQuestion(sectionId, question.id, {
                imageUrl: file.url,
              })
            }
            currentFileUrl={question.imageUrl}
          />
        </div>

        <div className="border-t pt-3">
          {/* Question type specific editor */}
          <EditorComponent
            question={question}
            sectionId={sectionId}
            onUpdateQuestion={onUpdateQuestion}
          />
        </div>
      </CardContent>
    </Card>
  );
}
