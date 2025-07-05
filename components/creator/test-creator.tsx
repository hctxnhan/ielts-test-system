"use client";
import React from "react";
import SectionEditor from "@testComponents/components/creator/section-editor";
import { Button } from "@testComponents/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@testComponents/components/ui/card";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { Textarea } from "@testComponents/components/ui/textarea";
import { useToast } from "@testComponents/components/ui/use-toast";
import type { Test, TestType } from "@testComponents/lib/types";
import { useCreatorStore } from "@testComponents/store/creator-store";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Package,
  PlusCircle,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import FilePicker from "@testComponents/components/file-picker";
import type { FileObject } from "@testComponents/lib/supabase-storage";

// Define Zod schema for test validation
const QuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.string(),
    text: z.string(),
    points: z.number().int().positive(),
    scoringStrategy: z.string(),
  })
  .passthrough();

const SectionSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1, "Section title is required"),
    description: z.string(),
    questions: z
      .array(QuestionSchema)
      .min(1, "Section must have at least one question"),
    duration: z.number().int().positive("Duration must be a positive number"),
  })
  .passthrough();

const TestSchema = z
  .object({
    title: z.string().min(1, "Test title is required"),
    type: z.enum(["listening", "reading", "writing", "speaking"]),
    description: z.string(),
    sections: z
      .array(SectionSchema)
      .min(1, "Test must have at least one section"),
    totalDuration: z
      .number()
      .int()
      .positive("Total duration must be a positive number"),
    totalQuestions: z.number().int().min(0),
    instructions: z.string(),
    skillLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  })
  .passthrough();

interface TestCreatorProps {
  defaultTest?: Test;
  onTestCreateSubmit?: (test: Test) => void;
  testType?: TestType;
}

export function TestCreator({
  defaultTest,
  onTestCreateSubmit,
  testType = "reading",
}: TestCreatorProps) {
  const [testDetailsCollapsed, setTestDetailsCollapsed] = useState(false);
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<
    Array<{ field: string; message: string }>
  >([]); // Changed to store field name with message

  const {
    currentTest,
    createNewTest,
    updateTestDetails,
    // saveTest,
    loadTest,
    addSection,
    removeSection,
    updateSection,
    addQuestion,
    removeQuestion,
    updateQuestion,
    reorderQuestion,
  } = useCreatorStore();

  // Set default test if provided
  useEffect(() => {
    if (defaultTest) {
      // Load the default test into the store
      loadTest(defaultTest);
    } else {
      // Create a default empty test
      createNewTest(testType, "New Test");
    }
  }, [defaultTest, testType, createNewTest, loadTest]);

  // Save the current test
  const handleSaveTest = () => {
    try {
      setValidationErrors([]);
      const validatedTest = TestSchema.parse(currentTest);
      // const savedTest = saveTest();

      if (onTestCreateSubmit && currentTest) {
        onTestCreateSubmit(currentTest);
      }

      toast({
        title: "Test saved",
        description: "Your test has been saved successfully.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format errors to include both field path and message
        const formattedErrors = error.errors.map((err) => {
          // Get the field path from error
          const fieldPath = err.path.join(".");

          // Map error paths to user-friendly field names
          let fieldName = fieldPath;
          if (fieldPath.startsWith("title")) {
            fieldName = "Test Title";
          } else if (fieldPath.startsWith("sections")) {
            // Extract section index if available
            const match = fieldPath.match(/sections\[(\d+)\]/);
            if (match) {
              const sectionIndex = parseInt(match[1]);

              if (fieldPath.includes("title")) {
                fieldName = `Section ${sectionIndex + 1} Title`;
              } else if (fieldPath.includes("duration")) {
                fieldName = `Section ${sectionIndex + 1} Duration`;
              } else if (fieldPath.includes("questions")) {
                fieldName = `Section ${sectionIndex + 1} Questions`;
              } else {
                fieldName = `Section ${sectionIndex + 1}`;
              }
            } else {
              fieldName = "Sections";
            }
          } else if (fieldPath.startsWith("totalDuration")) {
            fieldName = "Total Duration";
          }

          return {
            field: fieldName,
            message: err.message,
          };
        });

        setValidationErrors(formattedErrors);
      } else {
        setValidationErrors([
          {
            field: "General",
            message: "An unexpected error occurred while saving the test.",
          },
        ]);
      }
    }
  };

  return (
    <div className="mx-auto py-4 px-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-1.5">
            <BookOpen className="w-4.5 h-4.5" />
            Test Creator
          </h1>
          <p className="text-xs text-muted-foreground">
            Create and manage IELTS test modules
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex gap-1.5">
            {currentTest && (
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSaveTest}
              >
                <Save className="mr-1 h-3.5 w-3.5" /> Save
              </Button>
            )}
          </div>

          {validationErrors.length > 0 && (
            <div className="mt-1 text-xs text-destructive">
              <ul className="list-disc pl-4">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{error.field}:</span>{" "}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {currentTest ? (
        <div className="space-y-3">
          <Card className="shadow-sm">
            <CardHeader
              className="py-2.5 px-4 cursor-pointer border-b flex-row justify-between items-center hover:bg-muted/20 transition-colors"
              onClick={() => setTestDetailsCollapsed(!testDetailsCollapsed)}
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-primary/70 rounded-full"></div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    Test Details
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Basic information about your test
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                {testDetailsCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            {!testDetailsCollapsed && (
              <CardContent className="py-3 px-4 space-y-3 bg-card/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-title" className="text-xs font-medium">
                      Title
                    </Label>
                    <Input
                      id="edit-title"
                      value={currentTest.title}
                      onChange={(e) =>
                        updateTestDetails({ title: e.target.value })
                      }
                      className="h-8"
                      placeholder="Enter test title"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Test Type</Label>
                      <div className="flex items-center h-8 text-xs border rounded bg-muted/20 px-2.5 capitalize">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        {currentTest.type}
                        {currentTest.readingVariant &&
                          ` (${currentTest.readingVariant})`}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Duration</Label>
                      <div className="flex items-center h-8 text-xs border rounded bg-muted/20 px-2.5">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {Math.floor(currentTest.totalDuration / 60)} minutes
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="skill-level"
                        className="text-xs font-medium"
                      >
                        Skill Level
                      </Label>
                      <Select
                        value={currentTest.skillLevel || ""}
                        onValueChange={(value) =>
                          updateTestDetails({ skillLevel: value as Test["skillLevel"] })
                        }
                      >
                        <SelectTrigger id="skill-level" className="h-8 text-xs">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A1">A1 (Beginner)</SelectItem>
                          <SelectItem value="A2">A2 (Elementary)</SelectItem>
                          <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                          <SelectItem value="B2">
                            B2 (Upper Intermediate)
                          </SelectItem>
                          <SelectItem value="C1">C1 (Advanced)</SelectItem>
                          <SelectItem value="C2">C2 (Proficient)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Listening test: Audio file input at test level */}
                  {currentTest.type === "listening" && (
                    <div className="space-y-1.5 col-span-full">
                      <Label htmlFor="test-audio-file" className="text-xs font-medium">
                        Audio File
                      </Label>
                      <FilePicker
                        fileType="audio"
                        onFileSelect={(file: FileObject) => updateTestDetails({ audioUrl: file.url })}
                        currentFileUrl={currentTest.audioUrl || ""}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-description"
                      className="text-xs font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={currentTest.description}
                      onChange={(e) =>
                        updateTestDetails({ description: e.target.value })
                      }
                      className="resize-none text-sm"
                      placeholder="Brief description of this test"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-instructions"
                      className="text-xs font-medium"
                    >
                      Instructions
                    </Label>
                    <Textarea
                      id="edit-instructions"
                      value={currentTest.instructions}
                      onChange={(e) =>
                        updateTestDetails({ instructions: e.target.value })
                      }
                      className="resize-none text-sm"
                      placeholder="Instructions for test takers"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex justify-between items-center px-1">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              Sections{" "}
              <span className="text-xs text-muted-foreground ml-1">
                ({currentTest.sections.length})
              </span>
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => addSection()}
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Section
            </Button>
          </div>

          {currentTest.sections.length === 0 ? (
            <Card className="py-3 px-4 text-center border-dashed bg-muted/10">
              <p className="text-muted-foreground text-xs mb-2">
                No sections added yet
              </p>
              <Button
                onClick={() => addSection()}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Your First
                Section
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {currentTest.sections.map((section, index) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  index={index}
                  testType={currentTest.type}
                  onUpdateSection={updateSection}
                  onRemoveSection={removeSection}
                  onAddQuestion={addQuestion as (sectionId: string, type: string) => void}
                  onUpdateQuestion={updateQuestion}
                  onRemoveQuestion={removeQuestion}
                  onReorderQuestion={reorderQuestion}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground text-sm">
            Loading test editor...
          </p>
        </div>
      )}
    </div>
  );
}
