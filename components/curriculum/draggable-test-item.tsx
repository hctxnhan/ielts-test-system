"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { cn } from "@testComponents/lib/utils";
import type { CurriculumTest } from "@testComponents/lib/curriculum-types";
import type { RefCallback } from "react";
import { Clock, BarChart3 } from "lucide-react";

interface DraggableTestItemProps {
  test: CurriculumTest;
  className?: string;
}

interface TestDragItem {
  type: string;
  test: CurriculumTest;
}

export function DraggableTestItem({ test, className = "" }: DraggableTestItemProps) {
  const [{ isDragging }, dragRef] = useDrag<TestDragItem, unknown, { isDragging: boolean }>(() => ({
    type: "curriculum-test",
    item: { type: "curriculum-test", test },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getTestTypeColor = (skill: string) => {
    const colors = {
      listening: "bg-blue-100 text-blue-800",
      reading: "bg-green-100 text-green-800",
      writing: "bg-purple-100 text-purple-800",
      speaking: "bg-orange-100 text-orange-800",
      grammar: "bg-gray-100 text-gray-800",
    };
    return colors[skill as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getLevelColor = (level?: string) => {
    const colors = {
      A1: "bg-green-100 text-green-700",
      A2: "bg-green-100 text-green-700",
      B1: "bg-yellow-100 text-yellow-700", 
      B2: "bg-yellow-100 text-yellow-700",
      C1: "bg-red-100 text-red-700",
      C2: "bg-red-100 text-red-700",
    };
    return level ? colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700";
  };

  return (
    <div
      ref={dragRef as unknown as RefCallback<HTMLDivElement>}
      className={cn(
        "p-3 border rounded-lg bg-card transition-colors cursor-grab active:cursor-grabbing",
        {
          "opacity-50 scale-95": isDragging,
          "hover:bg-accent/50": !isDragging,
        },
        className
      )}
    >
      <div className="space-y-2">
        {/* Title and Tags */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight">{test.title}</h4>
          <div className="flex flex-wrap gap-1 shrink-0">
            <span className={`px-2 py-1 text-xs rounded-full ${getTestTypeColor(test.skill || test.type || '')}`}>
              {test.skill || test.type || 'Unknown'}
            </span>
            {(test.level || test.difficulty) && (
              <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(test.level || test.difficulty)}`}>
                {test.level || test.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>ID: {test.id}</span>
          {test.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{test.duration}m</span>
            </div>
          )}
          {test.updated_at && (
            <span>Updated: {new Date(test.updated_at).toLocaleDateString()}</span>
          )}
        </div>

        {/* Skills */}
        {test.skills && test.skills.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            <span>{test.skills.join(", ")}</span>
          </div>
        )}

        {/* Description */}
        {test.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {test.description}
          </p>
        )}
      </div>
    </div>
  );
}