"use client";

import React from "react";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import { SessionItem } from "./session-item";
import { Button } from "@testComponents/components/ui/button";
import { Plus, BookOpen } from "lucide-react";

export function SessionList() {
  const {
    currentCurriculum,
    addSession,
  } = useCurriculumStore();

  const handleAddSession = () => {
    const sessionCount = currentCurriculum?.content.sessions.length || 0;
    addSession(`Session ${sessionCount + 1}`);
  };

  if (!currentCurriculum?.content.sessions.length) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground mb-2">No sessions yet</p>
        <p className="text-sm text-muted-foreground mb-4">
          Add your first session to start building the curriculum
        </p>
        <Button onClick={handleAddSession} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add First Session
        </Button>
      </div>
    );
  }

  const sortedSessions = currentCurriculum.content.sessions
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {sortedSessions.map((session, index) => (
        <SessionItem
          key={session.id}
          session={session}
          index={index}
        />
      ))}
      
      <Button
        onClick={handleAddSession}
        variant="outline"
        size="sm"
        className="w-full gap-2 mt-4"
      >
        <Plus className="h-4 w-4" />
        Add Session
      </Button>
    </div>
  );
}