"use client";

import React, { useEffect } from "react";
import { CurriculumEditor } from "@testComponents/components/curriculum/curriculum-editor";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import type { CurriculumTest } from "@testComponents/lib/curriculum-types";

// Sample test data for demonstration
const sampleTests: CurriculumTest[] = [
  {
    id: 1,
    title: "IELTS Reading Practice - Academic Module",
    skill: "reading",
    level: "B2",
    updated_at: "2025-09-20T10:00:00.000Z",
    description: "Academic reading passages with multiple choice and completion questions",
    duration: 60,
    // Legacy fields for backward compatibility
    type: "reading",
    difficulty: "intermediate",
    skills: ["reading comprehension", "vocabulary", "academic English"],
  },
  {
    id: 2,
    title: "Basic Listening Skills",
    skill: "listening",
    level: "A2",
    updated_at: "2025-09-19T14:30:00.000Z",
    description: "Fundamental listening exercises for beginners",
    duration: 30,
    // Legacy fields for backward compatibility
    type: "listening",
    difficulty: "beginner",
    skills: ["listening comprehension", "note-taking"],
  },
  {
    id: 3,
    title: "IELTS Writing Task 1 - Data Description",
    skill: "writing",
    level: "B1",
    updated_at: "2025-09-18T16:45:00.000Z",
    description: "Practice describing charts, graphs, and diagrams",
    duration: 20,
    // Legacy fields for backward compatibility
    type: "writing",
    difficulty: "intermediate",
    skills: ["data analysis", "formal writing", "vocabulary"],
  },
  {
    id: 4,
    title: "Advanced Grammar Assessment",
    skill: "grammar",
    level: "C1",
    updated_at: "2025-09-17T09:15:00.000Z",
    description: "Comprehensive grammar test covering complex structures",
    duration: 45,
    // Legacy fields for backward compatibility
    type: "grammar",
    difficulty: "advanced",
    skills: ["grammar", "sentence structure", "advanced vocabulary"],
  },
  {
    id: 5,
    title: "Speaking Fluency Practice",
    skill: "speaking",
    level: "B1",
    updated_at: "2025-09-16T11:20:00.000Z",
    description: "Conversational speaking practice for fluency development",
    duration: 15,
    // Legacy fields for backward compatibility
    type: "speaking",
    difficulty: "intermediate",
    skills: ["speaking fluency", "pronunciation", "conversation"],
  },
  {
    id: 6,
    title: "IELTS Reading Practice - General Training",
    skill: "reading",
    level: "A2",
    updated_at: "2025-09-15T13:00:00.000Z",
    description: "General Training reading passages for practical scenarios",
    duration: 60,
    // Legacy fields for backward compatibility
    type: "reading",
    difficulty: "beginner",
    skills: ["practical reading", "everyday English"],
  },
  {
    id: 7,
    title: "Advanced Listening Comprehension",
    skill: "listening",
    level: "C1",
    updated_at: "2025-09-14T15:30:00.000Z",
    description: "Complex listening scenarios with academic and professional contexts",
    duration: 40,
    // Legacy fields for backward compatibility
    type: "listening",
    difficulty: "advanced",
    skills: ["listening comprehension", "academic listening", "note-taking"],
  },
  {
    id: 8,
    title: "IELTS Writing Task 2 - Essay Writing",
    skill: "writing",
    level: "C1",
    updated_at: "2025-09-13T08:45:00.000Z",
    description: "Argumentative and opinion essay practice",
    duration: 40,
    // Legacy fields for backward compatibility
    type: "writing",
    difficulty: "advanced",
    skills: ["essay writing", "argumentation", "formal writing"],
  },
];

export default function CurriculumPage() {
  const { createNewCurriculum, setAvailableTests, currentCurriculum } = useCurriculumStore();

  // Initialize the page with sample data
  useEffect(() => {
    // Set available tests
    setAvailableTests(sampleTests);
    
    // Create a sample curriculum if none exists
    if (!currentCurriculum) {
      createNewCurriculum(
        "IELTS Comprehensive Course",
        "A complete IELTS preparation curriculum covering all skills"
      );
    }
  }, [createNewCurriculum, setAvailableTests, currentCurriculum]);

  return (
    <div className="h-screen">
      <CurriculumEditor 
        courseId={1}
        courseName="IELTS Comprehensive Course"
      />
    </div>
  );
}