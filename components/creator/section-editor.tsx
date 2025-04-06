"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import type { Section, Test } from "@/lib/types";
import QuestionList from "./question-list";
import QuestionTypeDialog from "./question-type-dialog";
import FilePicker from "@/components/file-picker";
import type { FileObject } from "@/lib/supabase-storage";

interface SectionEditorProps {
  section: Section;
  index: number;
  testType: Test["type"];
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onRemoveSection: (sectionId: string) => void;
  onAddQuestion: (sectionId: string, type: string) => void;
  onUpdateQuestion: (
    sectionId: string,
    questionId: string,
    updates: any
  ) => void;
  onRemoveQuestion: (sectionId: string, questionId: string) => void;
}

export default function SectionEditor({
  section,
  index,
  testType,
  onUpdateSection,
  onRemoveSection,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
}: SectionEditorProps) {
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleAudioSelect = (file: FileObject) => {
    onUpdateSection(section.id, { audioUrl: file.url });
  };

  const handleImageSelect = (file: FileObject) => {
    if (section.readingPassage) {
      const updatedPassage = {
        ...section.readingPassage,
        imageUrls: [...(section.readingPassage.imageUrls || []), file.url],
      };
      onUpdateSection(section.id, { readingPassage: updatedPassage });
    }
  };

  return (
    <Card className="mb-4 shadow-sm border overflow-hidden">
      <CardHeader
        className="cursor-pointer py-3 px-4 hover:bg-muted/20 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <CardTitle className="flex justify-between items-center text-base">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 bg-primary rounded-full"></div>
            <span>{section.title || "Untitled Section"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              {collapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSection(section.id);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-xs flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1">
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
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {Math.floor(section.duration / 60)} min
          </span>
          <span className="flex items-center gap-1">
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
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            {section.questions.length} questions
          </span>
        </CardDescription>
      </CardHeader>
      {!collapsed && (
        <CardContent className="px-4 py-3 space-y-3 border-t bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor={`section-title-${index}`}
                className="text-xs font-medium"
              >
                Section Title
              </Label>
              <Input
                id={`section-title-${index}`}
                value={section.title}
                onChange={(e) =>
                  onUpdateSection(section.id, { title: e.target.value })
                }
                className="h-8"
                placeholder="Enter section title"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor={`section-duration-${index}`}
                className="text-xs font-medium"
              >
                Duration (minutes)
              </Label>
              <Input
                id={`section-duration-${index}`}
                type="number"
                value={Math.floor(section.duration / 60)}
                onChange={(e) => {
                  const minutes = Number.parseInt(e.target.value) || 0;
                  onUpdateSection(section.id, { duration: minutes * 60 });
                }}
                min="1"
                max="60"
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`section-description-${index}`}
              className="text-xs font-medium"
            >
              Description
            </Label>
            <Textarea
              id={`section-description-${index}`}
              value={section.description}
              onChange={(e) =>
                onUpdateSection(section.id, { description: e.target.value })
              }
              rows={2}
              placeholder="Brief description of this section"
              className="resize-none"
            />
          </div>

          {testType === "reading" && (
            <div className="space-y-1.5">
              <Label
                htmlFor={`section-reading-passage-${index}`}
                className="text-xs font-medium"
              >
                Reading Passage
              </Label>
              <div className="space-y-3 border rounded-md p-3 bg-background text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`passage-title-${index}`}
                      className="text-xs font-medium"
                    >
                      Passage Title
                    </Label>
                    <Input
                      id={`passage-title-${index}`}
                      value={section.readingPassage?.title || ""}
                      onChange={(e) => {
                        const updatedPassage = {
                          ...(section.readingPassage || {
                            id: uuidv4(),
                            title: "",
                            content: "",
                            hasImages: false,
                            imageUrls: [],
                          }),
                          title: e.target.value,
                        };
                        onUpdateSection(section.id, {
                          readingPassage: updatedPassage,
                        });
                      }}
                      placeholder="Enter passage title"
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor={`passage-source-${index}`}
                      className="text-xs font-medium"
                    >
                      Source (Optional)
                    </Label>
                    <Input
                      id={`passage-source-${index}`}
                      value={section.readingPassage?.source || ""}
                      onChange={(e) => {
                        const updatedPassage = {
                          ...(section.readingPassage || {
                            id: uuidv4(),
                            title: "",
                            content: "",
                            hasImages: false,
                            imageUrls: [],
                          }),
                          source: e.target.value,
                        };
                        onUpdateSection(section.id, {
                          readingPassage: updatedPassage,
                        });
                      }}
                      placeholder="Enter source information"
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={`passage-content-${index}`}
                    className="text-xs font-medium"
                  >
                    Passage Content
                  </Label>
                  <Textarea
                    id={`passage-content-${index}`}
                    value={section.readingPassage?.content || ""}
                    onChange={(e) => {
                      const updatedPassage = {
                        ...(section.readingPassage || {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        }),
                        content: e.target.value,
                      };
                      onUpdateSection(section.id, {
                        readingPassage: updatedPassage,
                      });
                    }}
                    placeholder="Enter passage content"
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`passage-has-images-${index}`}
                    checked={section.readingPassage?.hasImages || false}
                    onCheckedChange={(checked) => {
                      const updatedPassage = {
                        ...(section.readingPassage || {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        }),
                        hasImages: !!checked,
                      };
                      onUpdateSection(section.id, {
                        readingPassage: updatedPassage,
                      });
                    }}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor={`passage-has-images-${index}`}
                    className="text-xs font-medium"
                  >
                    Includes images
                  </Label>
                </div>

                {section.readingPassage?.hasImages && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Images</Label>
                    <div className="space-y-2">
                      {(section.readingPassage?.imageUrls || []).map(
                        (url, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="flex gap-2 items-center bg-muted/30 rounded-md"
                          >
                            <div className="flex-1 p-1.5 flex items-center gap-2 text-xs truncate">
                              <img
                                src={url || "/placeholder.svg"}
                                alt="Preview"
                                className="h-6 w-6 object-cover rounded"
                              />
                              <span className="truncate">
                                {url.split("/").pop()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-1"
                              onClick={() => {
                                const newUrls = (
                                  section.readingPassage?.imageUrls || []
                                ).filter((_, i) => i !== imgIndex);
                                const updatedPassage = {
                                  ...section.readingPassage,
                                  imageUrls: newUrls,
                                };
                                onUpdateSection(section.id, {
                                  readingPassage: updatedPassage,
                                });
                              }}
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
                        )
                      )}
                      <FilePicker
                        fileType="image"
                        onFileSelect={handleImageSelect}
                        currentFileUrl=""
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {testType === "listening" && (
            <div className="space-y-1.5">
              <Label
                htmlFor={`section-audio-${index}`}
                className="text-xs font-medium"
              >
                Audio File
              </Label>
              <FilePicker
                fileType="audio"
                onFileSelect={handleAudioSelect}
                currentFileUrl={section.audioUrl || ""}
              />
            </div>
          )}

          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
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
                  <path d="M8 3v4a2 2 0 0 1-2 2H2"></path>
                  <path d="M16 3v4a2 2 0 0 0 2 2h4"></path>
                  <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                </svg>
                Questions
                <span className="text-xs text-muted-foreground">
                  ({section.questions.length})
                </span>
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setShowQuestionTypeDialog(true)}
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Question
              </Button>
            </div>

            <QuestionTypeDialog
              open={showQuestionTypeDialog}
              onOpenChange={setShowQuestionTypeDialog}
              testType={testType}
              onSelectQuestionType={(type) => {
                onAddQuestion(section.id, type);
                setShowQuestionTypeDialog(false);
              }}
            />

            <QuestionList
              questions={section.questions}
              sectionId={section.id}
              onUpdateQuestion={onUpdateQuestion}
              onRemoveQuestion={onRemoveQuestion}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
