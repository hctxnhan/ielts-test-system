"use client";

import { useState, useEffect } from "react";
import { useCreatorStore } from "@/store/creator-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import type { TestType, Test } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SectionEditor from "@/components/creator/section-editor";
import { useToast } from "@/components/ui/use-toast";

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

  const {
    currentTest,
    createNewTest,
    updateTestDetails,
    saveTest,
    loadTest,
    addSection,
    removeSection,
    updateSection,
    addQuestion,
    removeQuestion,
    updateQuestion,
  } = useCreatorStore();

  // Set default test if provided
  useEffect(() => {
    if (defaultTest) {
      // Load the default test into the store
      loadTest(defaultTest.id);
    } else {
      // Create a default empty test
      createNewTest(testType, "New Test");
    }
  }, [defaultTest, testType, createNewTest, loadTest]);

  // Save the current test
  const handleSaveTest = () => {
    const savedTest = saveTest();

    if (onTestCreateSubmit && savedTest) {
      onTestCreateSubmit(savedTest);
    }

    toast({
      title: "Test saved",
      description: "Your test has been saved successfully.",
    });
  };

  return (
    <div className="container mx-auto py-4 px-3">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-1.5">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1-3-3h7z"></path>
            </svg>
            Test Creator
          </h1>
          <p className="text-xs text-muted-foreground">
            Create and manage IELTS test modules
          </p>
        </div>

        <div className="flex gap-1.5">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
            </Button>
          </Link>

          {currentTest && (
            <Button size="sm" className="h-7 text-xs" onClick={handleSaveTest}>
              <Save className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Test Type</Label>
                      <div className="flex items-center h-8 text-xs border rounded bg-muted/20 px-2.5 capitalize">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1.5"
                        >
                          <path d="M8 3v4a2 2 0 0 1-2 2H2"></path>
                          <path d="M16 3v4a2 2 0 0 0-2 2h4"></path>
                          <rect
                            x="4"
                            y="8"
                            width="16"
                            height="12"
                            rx="2"
                          ></rect>
                        </svg>
                        {currentTest.type}
                        {currentTest.readingVariant &&
                          ` (${currentTest.readingVariant})`}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Duration</Label>
                      <div className="flex items-center h-8 text-xs border rounded bg-muted/20 px-2.5">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1.5"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {Math.floor(currentTest.totalDuration / 60)} minutes
                      </div>
                    </div>
                  </div>

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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16.5 9.4 7.5 4.21"></path>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <circle cx="3.5" cy="9.5" r=".5"></circle>
                <circle cx="3.5" cy="14.5" r=".5"></circle>
                <path d="M3.5 9.5V14"></path>
              </svg>
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
                  onAddQuestion={addQuestion}
                  onUpdateQuestion={updateQuestion}
                  onRemoveQuestion={removeQuestion}
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
