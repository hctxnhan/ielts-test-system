"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { WritingTask1Question } from "@/lib/types"
import FilePicker from "@/components/file-picker"
import type { FileObject } from "@/lib/supabase-storage"

interface WritingTask1EditorProps {
  question: WritingTask1Question
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function WritingTask1Editor({ question, sectionId, onUpdateQuestion }: WritingTask1EditorProps) {
  const handleImageSelect = (file: FileObject) => {
    onUpdateQuestion(sectionId, question.id, { imageUrl: file.url })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`prompt-${question.id}`}>Task Prompt</Label>
        <Textarea
          id={`prompt-${question.id}`}
          value={question.prompt}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, { prompt: e.target.value })
          }}
          placeholder="Enter the task prompt (e.g., 'The chart below shows the number of books read by men and women at Burnaby Public Library from 2011 to 2014. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.')"
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`image-url-${question.id}`}>Chart/Graph Image</Label>
        <FilePicker fileType="image" onFileSelect={handleImageSelect} currentFileUrl={question.imageUrl} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`word-limit-${question.id}`}>Word Limit</Label>
        <Input
          id={`word-limit-${question.id}`}
          type="number"
          value={question.wordLimit}
          onChange={(e) => {
            onUpdateQuestion(sectionId, question.id, {
              wordLimit: Number.parseInt(e.target.value) || 150,
            })
          }}
          min="50"
          max="300"
        />
        <p className="text-sm text-muted-foreground">Recommended: 150 words for Academic Task 1</p>
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
          Customize how the AI evaluates essays. If left empty, standard IELTS Task 1 criteria will be used.
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
          rows={8}
        />
      </div>
    </div>
  )
}

