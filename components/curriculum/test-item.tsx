"use client";

import React, { useRef } from "react";
import { Button } from "@testComponents/components/ui/button";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import type { CurriculumTest } from "@testComponents/lib/curriculum-types";
import { GripVertical, Trash2, Clock, BarChart3 } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

const TEST_ITEM_DRAG_TYPE = "curriculum-test-item";

interface TestItemProps {
  test: CurriculumTest;
  sessionId: string;
  index: number;
}

interface TestItemDragData {
  type: string;
  testId: number;
  sessionId: string;
  index: number;
}

export function TestItem({ test, sessionId, index }: TestItemProps) {
  const { removeTestFromSession, reorderTestsInSession, moveTestBetweenSessions } = useCurriculumStore();
  const ref = useRef<HTMLDivElement>(null);

  // Drag logic
  const [{ isDragging }, dragRef, previewRef] = useDrag<
    TestItemDragData,
    unknown,
    { isDragging: boolean }
  >({
    type: TEST_ITEM_DRAG_TYPE,
    item: { type: TEST_ITEM_DRAG_TYPE, testId: test.id, sessionId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Drop logic
  const [{ isOver }, dropRef] = useDrop<
    TestItemDragData,
    unknown,
    { isOver: boolean }
  >({
    accept: TEST_ITEM_DRAG_TYPE,
    hover: (draggedItem) => {
      if (draggedItem.sessionId === sessionId && draggedItem.index === index) return;

      if (draggedItem.sessionId === sessionId) {
        // Reorder within same session
        reorderTestsInSession(sessionId, draggedItem.index, index);
        draggedItem.index = index;
      } else {
        // Move between sessions
        moveTestBetweenSessions(draggedItem.testId, draggedItem.sessionId, sessionId, index);
        draggedItem.sessionId = sessionId;
        draggedItem.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine refs
  previewRef(dropRef(ref));

  const handleRemove = () => {
    if (confirm(`Remove "${test.title}" from this session?`)) {
      removeTestFromSession(sessionId, test.id);
    }
  };

  const getTestTypeColor = (type: string) => {
    const colors = {
      listening: "bg-blue-100 text-blue-800",
      reading: "bg-green-100 text-green-800",
      writing: "bg-purple-100 text-purple-800",
      speaking: "bg-orange-100 text-orange-800",
      grammar: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (difficulty?: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-700",
      intermediate: "bg-yellow-100 text-yellow-700",
      advanced: "bg-red-100 text-red-700",
    };
    return difficulty ? colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700";
  };

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className={`test-item flex items-center gap-2 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-all ${isOver ? "border-primary border-t-2" : ""}`}
    >
      {/* Drag Handle */}
      <div
        ref={dragRef as unknown as React.RefCallback<HTMLDivElement>}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Test Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{test.title}</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getTestTypeColor(test.skill || test.type || '')}`}>
            {test.skill || test.type || 'Unknown'}
          </span>
          {(test.level || test.difficulty) && (
            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(test.level || test.difficulty)}`}>
              {test.level || test.difficulty}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>ID: {test.id}</span>
          {test.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{test.duration}m</span>
            </div>
          )}
          {test.skills && test.skills.length > 0 && (
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{test.skills.join(", ")}</span>
            </div>
          )}
        </div>
        
        {test.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {test.description}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
