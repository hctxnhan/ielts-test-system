"use client";
import React from "react";
import FilePicker from "@testComponents/components/file-picker";
import { Button } from "@testComponents/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import { Checkbox } from "@testComponents/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@testComponents/components/ui/dialog";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { AutoResizeTextarea } from "@testComponents/components/ui/auto-resize-textarea";
import { RichTextEditor } from "@testComponents/components/ui/rich-text-editor";
import type { FileObject } from "@testComponents/lib/supabase-storage";
import type { ReadingPassage, Section, Test } from "@testComponents/lib/types";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  FilePlus,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import QuestionList from "./question-list";
import QuestionTypeDialog from "./question-type-dialog";

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
    updates: any,
  ) => void;
  onRemoveQuestion: (sectionId: string, questionId: string) => void;
  onReorderQuestion: (sectionId: string, questionId: string, direction: 'up' | 'down') => void;
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
  onReorderQuestion,
}: SectionEditorProps) {
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleAudioSelect = (file: FileObject) => {
    onUpdateSection(section.id, { audioUrl: file.url });
  };
  const handleImageSelect = (file: FileObject) => {
    if (section.readingPassage) {
      const updatedPassage: ReadingPassage = {
        ...section.readingPassage,
        imageUrls: [...(section.readingPassage.imageUrls || []), file.url],
      };
      onUpdateSection(section.id, { readingPassage: updatedPassage });
    }
  };

  const openImagePreview = (url: string) => {
    setPreviewImage(url);
  };

  return (
    <>
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
                  <ChevronDown size={16} />
                ) : (
                  <ChevronUp size={16} />
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
                <Trash2 size={16} />
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-xs flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {Math.floor(section.duration / 60)} min
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList size={12} />
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
              <AutoResizeTextarea
                id={`section-description-${index}`}
                value={section.description}
                onChange={(e) =>
                  onUpdateSection(section.id, { description: e.target.value })
                }
                minRows={2}
                maxRows={6}
                placeholder="Brief description of this section"
                className="text-sm"
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
                        value={section.readingPassage?.title || ""}                        onChange={(e) => {
                          // Create default passage if none exists
                          const defaultPassage: ReadingPassage = {
                            id: uuidv4(),
                            title: "",
                            content: "",
                            hasImages: false,
                            imageUrls: [],
                          };
                          
                          const updatedPassage: ReadingPassage = {
                            ...(section.readingPassage || defaultPassage),
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
                        value={section.readingPassage?.source || ""}                        onChange={(e) => {
                          // Create default passage if none exists
                          const defaultPassage: ReadingPassage = {
                            id: uuidv4(),
                            title: "",
                            content: "",
                            hasImages: false,
                            imageUrls: [],
                          };
                          
                          const updatedPassage: ReadingPassage = {
                            ...(section.readingPassage || defaultPassage),
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
                  <div className="space-y-2">
                    <Label
                      htmlFor={`passage-content-${index}`}
                      className="text-xs font-medium"
                    >
                      Passage Content
                    </Label>
                    <RichTextEditor
                      id={`passage-content-${index}`}
                      value={section.readingPassage?.content || ""}                      onChange={(content) => {
                        // Create default passage if none exists
                        const defaultPassage: ReadingPassage = {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        };
                        
                        const updatedPassage: ReadingPassage = {
                          ...(section.readingPassage || defaultPassage),
                          content: content,
                        };
                        
                        onUpdateSection(section.id, {
                          readingPassage: updatedPassage,
                        });
                      }}
                      placeholder="Enter passage content"
                      minHeight={200}
                      maxHeight={400}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`passage-has-images-${index}`}
                      checked={section.readingPassage?.hasImages || false}                      onCheckedChange={(checked) => {
                        // Create default passage if none exists
                        const defaultPassage: ReadingPassage = {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        };
                        
                        const updatedPassage: ReadingPassage = {
                          ...(section.readingPassage || defaultPassage),
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openImagePreview(url);
                              }}
                              key={imgIndex}
                              className="flex gap-2 items-center bg-muted/30 rounded-md *:hover:bg-muted/50 transition-all cursor-pointer border-2 border-transparent hover:border-primary"
                            >
                              <div className="flex-1 p-1.5 flex items-center gap-2 text-xs truncate">
                                <div className="cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded overflow-hidden">
                                  <img
                                    src={url || "/placeholder.svg"}
                                    alt="Preview"
                                    className="h-6 w-6 object-cover rounded"
                                  />
                                </div>
                                <span className="truncate">
                                  {url.split("/").pop()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mr-1"
                                onClick={() => {                                  const newUrls = (
                                    section.readingPassage?.imageUrls || []
                                  ).filter((_, i) => i !== imgIndex);
                                  
                                  if (section.readingPassage) {
                                    const updatedPassage: ReadingPassage = {
                                      ...section.readingPassage,
                                      imageUrls: newUrls,
                                    };
                                    onUpdateSection(section.id, {
                                      readingPassage: updatedPassage,
                                    });
                                  }
                                }}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          ),
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
                  <FilePlus size={14} />
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
                onReorderQuestion={onReorderQuestion}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Image Preview Dialog */}
      <Dialog
        open={previewImage !== null}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-auto p-1">
          <div className="relative">
            <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1 hover:bg-background">
              <X className="h-5 w-5" />
            </DialogClose>
            {previewImage && (
              <img
                src={previewImage}
                alt="Image preview"
                className="w-full object-contain max-h-[80vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
