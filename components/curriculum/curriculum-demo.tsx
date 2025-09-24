"use client";

import React from "react";
import { Button } from "@testComponents/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@testComponents/components/ui/card";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import { BookOpen, Plus, FileText } from "lucide-react";

export function CurriculumDemo() {
  const {
    currentCurriculum,
    createNewCurriculum,
    addSession,
    resetEditor,
    isModified,
  } = useCurriculumStore();

  const handleCreateNewCurriculum = () => {
    createNewCurriculum("Sample IELTS Course", "A comprehensive IELTS preparation course");
  };

  const handleAddSampleSession = () => {
    if (currentCurriculum) {
      addSession("Introduction to IELTS");
    }
  };

  const handleReset = () => {
    resetEditor();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Curriculum Creation Demo
          </CardTitle>
          <CardDescription>
            This is a demonstration of the curriculum creation component system.
            The components are designed to be modular and reusable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateNewCurriculum} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Curriculum
            </Button>
            
            {currentCurriculum && (
              <Button onClick={handleAddSampleSession} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Add Sample Session
              </Button>
            )}
            
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>

          {currentCurriculum && (
            <div className="space-y-2">
              <h3 className="font-medium">Current Curriculum Status:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Title: {currentCurriculum.content.title}</div>
                <div>Description: {currentCurriculum.content.description || "No description"}</div>
                <div>Sessions: {currentCurriculum.content.sessions.length}</div>
                <div>Modified: {isModified ? "Yes" : "No"}</div>
                <div>Version: {currentCurriculum.version}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!currentCurriculum && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No curriculum loaded</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new curriculum to see the editor in action
            </p>
            <Button onClick={handleCreateNewCurriculum} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Curriculum
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}