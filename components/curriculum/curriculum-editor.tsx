"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@testComponents/components/ui/card";
import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import { Save, Plus, BookOpen } from "lucide-react";
import { SessionList } from "./session-list";
import { TestLibrary } from "./test-library";
import { DragDropProvider } from "./drag-drop-provider";

interface CurriculumEditorProps {
  courseId?: number;
  courseName?: string;
  onSave?: () => void;
}

export function CurriculumEditor({ courseId: _courseId, courseName, onSave }: CurriculumEditorProps) {
  const {
    currentCurriculum,
    isModified,
    updateCurriculumDetails,
    addSession,
  } = useCurriculumStore();

  const handleSave = () => {
    if (isModified && onSave) {
      onSave();
    }
  };

  const handleAddSession = () => {
    const sessionCount = currentCurriculum?.content.sessions.length || 0;
    addSession(`Session ${sessionCount + 1}`);
  };

  if (!currentCurriculum) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No curriculum loaded</p>
          <p className="text-xs text-muted-foreground">Create or load a curriculum to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropProvider>
      <div className="mx-auto py-4 px-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5" />
              Curriculum Editor
            </h1>
            <p className="text-xs text-muted-foreground">
              {courseName ? `Course: ${courseName}` : "Create and manage curriculum structure"}
            </p>
          </div>

          <div className="flex gap-1.5">
            <Button
              onClick={handleAddSession}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Session
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isModified}
              size="sm"
              className="h-7 text-xs"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Curriculum Details Card */}
          <Card className="shadow-sm">
            <CardHeader className="py-2.5 px-4 border-b">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-primary/70 rounded-full"></div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    Curriculum Details
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Basic information about your curriculum
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-3 bg-card/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="curriculum-title" className="text-xs font-medium">
                    Curriculum Title
                  </Label>
                  <Input
                    id="curriculum-title"
                    value={currentCurriculum.content.title}
                    onChange={(e) => updateCurriculumDetails({ title: e.target.value })}
                    placeholder="Enter curriculum title"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="curriculum-description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Input
                    id="curriculum-description"
                    value={currentCurriculum.content.description || ""}
                    onChange={(e) => updateCurriculumDetails({ description: e.target.value })}
                    placeholder="Enter curriculum description"
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left Panel - Curriculum Structure */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm h-full">
                <CardHeader className="py-2.5 px-4 border-b flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-primary/70 rounded-full"></div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Curriculum Structure
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Organize your sessions and tests
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-4 min-h-96">
                  <SessionList />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Test Library */}
            <div className="lg:col-span-1">
              <Card className="shadow-sm h-full">
                <CardHeader className="py-2.5 px-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-primary/70 rounded-full"></div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Test Library
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Available tests to add
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <TestLibrary />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DragDropProvider>
  );
}