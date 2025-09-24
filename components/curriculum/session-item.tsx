"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@testComponents/components/ui/card";
import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import type { CurriculumSession } from "@testComponents/lib/curriculum-types";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  GripVertical,
  FileText,
} from "lucide-react";
import { DroppableSession } from "./droppable-session";
import { TestItem } from "./test-item";

interface SessionItemProps {
  session: CurriculumSession;
  index: number;
}

export function SessionItem({ session, index }: SessionItemProps) {
  const {
    expandedSessions,
    toggleSessionExpanded,
    updateSession,
    removeSession,
    availableTests,
  } = useCurriculumStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [editDescription, setEditDescription] = useState(session.description || "");

  const isExpanded = expandedSessions.has(session.id);

  const handleToggleExpanded = () => {
    toggleSessionExpanded(session.id);
  };

  const handleEditSave = () => {
    updateSession(session.id, {
      title: editTitle,
      description: editDescription || undefined,
    });
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditTitle(session.title);
    setEditDescription(session.description || "");
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove "${session.title}"? This will also remove all tests in this session.`)) {
      removeSession(session.id);
    }
  };

  const getTestById = (testId: number) => {
    return availableTests.find(test => test.id === testId);
  };

  return (
    <DroppableSession session={session} className="relative">
      <Card className="session-item">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Session Title and Description */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  id={`session-title-${session.id}`}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Session title"
                  className="h-8"
                  autoFocus
                />
                <Input
                  id={`session-description-${session.id}`}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Session description (optional)"
                  className="h-8"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEditSave}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleEditCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {index + 1}. {session.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    ({session.testIds.length} tests)
                  </span>
                </div>
                {session.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {session.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Expanded Content - Tests */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="ml-6 space-y-2">
            {session.testIds.length === 0 ? (
              <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tests in this session</p>
                <p className="text-xs text-muted-foreground">
                  Drag tests from the library to add them here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {session.testIds.map((testId, testIndex) => {
                  const test = getTestById(testId);
                  return test ? (
                    <TestItem
                      key={testId}
                      test={test}
                      sessionId={session.id}
                      index={testIndex}
                    />
                  ) : (
                    <div
                      key={testId}
                      className="p-2 border rounded bg-destructive/10 text-destructive text-sm"
                    >
                      Test not found: {testId}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
    </DroppableSession>
  );
}