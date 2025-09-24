"use client";

import React from "react";
import { useDrop } from "react-dnd";
import { cn } from "@testComponents/lib/utils";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import type { CurriculumSession, CurriculumTest } from "@testComponents/lib/curriculum-types";
import type { RefCallback } from "react";

interface DroppableSessionProps {
  session: CurriculumSession;
  children: React.ReactNode;
  className?: string;
}

interface TestDropItem {
  type: string;
  test: CurriculumTest;
}

export function DroppableSession({ session, children, className = "" }: DroppableSessionProps) {
  const { addTestToSession } = useCurriculumStore();

  const [{ isOver, canDrop }, dropRef] = useDrop<
    TestDropItem,
    unknown,
    { isOver: boolean; canDrop: boolean }
  >(() => ({
    accept: "curriculum-test",
    drop: (item) => {
      addTestToSession(session.id, item.test.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={dropRef as unknown as RefCallback<HTMLDivElement>}
      className={cn(
        "transition-colors duration-200",
        {
          "bg-blue-50 border-blue-200": isOver && canDrop,
          "bg-red-50 border-red-200": isOver && !canDrop,
        },
        className
      )}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 bg-blue-100/50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
          <span className="text-blue-700 font-medium text-sm">
            Drop test here
          </span>
        </div>
      )}
    </div>
  );
}