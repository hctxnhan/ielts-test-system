"use client";

import React, { useRef, useState } from "react";
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
import { useDrag, useDrop } from "react-dnd";
import { DroppableSession } from "./droppable-session";
import { TestItem } from "./test-item";

const SESSION_DRAG_TYPE = "curriculum-session";

interface SessionItemProps {
  session: CurriculumSession;
  index: number;
}

interface SessionDragItem {
  type: string;
  index: number;
  sessionId: string;
}

export function SessionItem({ session, index }: SessionItemProps) {
  const {
    expandedSessions,
    toggleSessionExpanded,
    updateSession,
    removeSession,
    reorderSessions,
    availableTests,
  } = useCurriculumStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);
  const [editDescription, setEditDescription] = useState(session.description || "");

  const ref = useRef<HTMLDivElement>(null);

  const isExpanded = expandedSessions.has(session.id);

  // Drag logic for session reordering
  const [{ isDragging }, dragRef, previewRef] = useDrag<
    SessionDragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: SESSION_DRAG_TYPE,
    item: { type: SESSION_DRAG_TYPE, index, sessionId: session.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop logic for session reordering
  const [{ isOver }, dropRef] = useDrop<
    SessionDragItem,
    unknown,
    { isOver: boolean }
  >({
    accept: SESSION_DRAG_TYPE,
    hover: (draggedItem) => {
      if (draggedItem.index === index) return;
      reorderSessions(draggedItem.index, index);
      draggedItem.index = index;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine refs
  previewRef(dropRef(ref));

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
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className={`transition-opacity ${isOver ? "border-t-2 border-primary" : ""}`}
    >
      <DroppableSession session={session} className="relative">
        <Card className="session-item">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              {/* Drag Handle */}
              <div
                ref={dragRef as unknown as React.RefCallback<HTMLDivElement>}
                className="cursor-grab active:cursor-grabbing mt-0.5 shrink-0"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Expand/Collapse */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpanded}
                className="h-6 w-6 p-0 shrink-0 mt-0.5"
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
                          key={`${testId}-${testIndex}`}
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
    </div>
  );
}
