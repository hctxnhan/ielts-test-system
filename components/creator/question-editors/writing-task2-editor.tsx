"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { WritingTask2Question } from "@/lib/types"

interface WritingTask2EditorProps {
  question: WritingTask2Question
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function WritingTask2Editor({ question, sectionId, onUpdateQuestion }: WritingTask2EditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`prompt-${question.id}`}>Essay Prompt</Label>
        <Textarea
          id={`prompt-${question.id}`}
          value={question.prompt}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, { prompt: e.target.value })
          }}
          placeholder="Enter the essay prompt (e.g., 'Some people believe that university students should pay all the cost of their studies. Others believe that university education should be free. Discuss both views and give your opinion.')"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`word-limit-${question.id}`}>Word Limit</Label>
        <Input
          id={`word-limit-${question.id}`}
          type="number"
          value={question.wordLimit}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, {
              wordLimit: Number.parseInt(e.target.value) || 250,
            })
          }}
          min="100"
          max="500"
        />
        <p className="text-sm text-muted-foreground">Recommended: 250 words for Task 2</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`scoring-prompt-${question.id}`}>AI Scoring Prompt (Optional)</Label>
        <Textarea
          id={`scoring-prompt-${question.id}`}
          value={question.scoringPrompt || ""}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, { scoringPrompt: e.target.value })
          }}
          placeholder="Custom instructions for AI scoring (leave empty for default IELTS scoring criteria)"
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Customize how the AI evaluates essays. If left empty, standard IELTS Task 2 criteria will be used.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`sample-answer-${question.id}`}>Sample Answer (Optional)</Label>
        <Textarea
          id={`sample-answer-${question.id}`}
          value={question.sampleAnswer || ""}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, { sampleAnswer: e.target.value })
          }}
          placeholder="Provide a sample answer for reference"
          rows={10}
        />
      </div>
    </div>
  )
}

