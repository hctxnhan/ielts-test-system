"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LabelingQuestion } from "@/lib/types"
import FilePicker from "@/components/file-picker"
import type { FileObject } from "@/lib/supabase-storage"

interface LabelingEditorProps {
  question: LabelingQuestion
  sectionId: string
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
}

export default function LabelingEditor({ question, sectionId, onUpdateQuestion }: LabelingEditorProps) {
  const handleImageSelect = (file: FileObject) => {
    onUpdateQuestion(sectionId, question.id, { imageUrl: file.url })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`image-url-${question.id}`}>Image</Label>
        <FilePicker fileType="image" onFileSelect={handleImageSelect} currentFileUrl={question.imageUrl} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Labels (already on the image)</Label>
          {question.labels.map((label, labelIndex) => (
            <div key={labelIndex} className="flex gap-2">
              <Input
                value={label}
                onChange={(e) => {
                  const newLabels = [...question.labels]
                  newLabels[labelIndex] = e.target.value
                  onUpdateQuestion(sectionId, question.id, { labels: newLabels })
                }}
                placeholder={`Label ${labelIndex + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newLabels = question.labels.filter((_, i) => i !== labelIndex)
                  onUpdateQuestion(sectionId, question.id, { labels: newLabels })
                }}
                disabled={question.labels.length <= 2}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newLabels = [...question.labels, ""]
              onUpdateQuestion(sectionId, question.id, { labels: newLabels })
            }}
          >
            Add Label
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Options (to choose from)</Label>
          {(question.options || []).map((option, optIndex) => (
            <div key={optIndex} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])]
                  newOptions[optIndex] = e.target.value
                  onUpdateQuestion(sectionId, question.id, { options: newOptions })
                }}
                placeholder={`Option ${optIndex + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newOptions = (question.options || []).filter((_, i) => i !== optIndex)
                  onUpdateQuestion(sectionId, question.id, { options: newOptions })
                }}
                disabled={(question.options || []).length <= 2}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newOptions = [...(question.options || []), ""]
              onUpdateQuestion(sectionId, question.id, { options: newOptions })
            }}
          >
            Add Option
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Correct Answers</Label>
        {question.labels.map((label, labelIndex) => (
          <div key={labelIndex} className="flex items-center gap-2">
            <span>{label || `Label ${labelIndex + 1}`}:</span>
            <Select
              value={(question.correctLabels[labelIndex] || 0).toString()}
              onValueChange={(value) => {
                const newCorrectLabels = { ...question.correctLabels }
                newCorrectLabels[labelIndex] = Number.parseInt(value)
                onUpdateQuestion(sectionId, question.id, {
                  correctLabels: newCorrectLabels,
                })
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {(question.options || []).map((option, optIndex) => (
                  <SelectItem key={optIndex} value={optIndex.toString()}>
                    {option || `Option ${optIndex + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  )
}

