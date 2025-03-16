"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Layers } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Section, Test, QuestionGroup } from "@/lib/types"
import QuestionList from "./question-list"
import QuestionTypeDialog from "./question-type-dialog"
import FilePicker from "@/components/file-picker"
import type { FileObject } from "@/lib/supabase-storage"
import QuestionGroupEditor from "./question-group-editor"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface SectionEditorProps {
  section: Section
  index: number
  testType: Test["type"]
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void
  onRemoveSection: (sectionId: string) => void
  onAddQuestion: (sectionId: string, type: string) => void
  onUpdateQuestion: (sectionId: string, questionId: string, updates: any) => void
  onRemoveQuestion: (sectionId: string, questionId: string) => void
}

export default function SectionEditor({
  section,
  index,
  testType,
  onUpdateSection,
  onRemoveSection,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
}: SectionEditorProps) {
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState(false)
  const [showGroupEditor, setShowGroupEditor] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<QuestionGroup | undefined>(undefined)
  const [collapsed, setCollapsed] = useState(false)

  const handleAudioSelect = (file: FileObject) => {
    onUpdateSection(section.id, { audioUrl: file.url })
  }

  const handleImageSelect = (file: FileObject) => {
    if (section.readingPassage) {
      const updatedPassage = {
        ...section.readingPassage,
        imageUrls: [...(section.readingPassage.imageUrls || []), file.url],
      }
      onUpdateSection(section.id, { readingPassage: updatedPassage })
    }
  }

  const handleAddGroup = () => {
    setCurrentGroup(undefined)
    setShowGroupEditor(true)
  }

  const handleEditGroup = (group: QuestionGroup) => {
    setCurrentGroup(group)
    setShowGroupEditor(true)
  }

  const handleSaveGroup = (sectionId: string, group: QuestionGroup) => {
    const existingGroups = section.questionGroups || []
    let updatedGroups: QuestionGroup[]

    if (currentGroup) {
      // Editing existing group
      updatedGroups = existingGroups.map((g) => (g.id === group.id ? group : g))
    } else {
      // Adding new group
      updatedGroups = [...existingGroups, group]
    }

    // Update the questions to mark them as part of a group
    const updatedQuestions = section.questions.map((question) => {
      if (group.questionIds.includes(question.id)) {
        return {
          ...question,
          isPartOfGroup: true,
          groupId: group.id,
          groupPosition: group.questionIds.indexOf(question.id) + 1,
        }
      } else if (question.groupId === group.id && !group.questionIds.includes(question.id)) {
        // Question was removed from the group
        return {
          ...question,
          isPartOfGroup: false,
          groupId: undefined,
          groupPosition: undefined,
        }
      }
      return question
    })

    onUpdateSection(sectionId, {
      questionGroups: updatedGroups,
      questions: updatedQuestions,
    })
    setShowGroupEditor(false)
  }

  const handleRemoveGroup = (groupId: string) => {
    if (!confirm("Are you sure you want to remove this question group?")) return

    const updatedGroups = (section.questionGroups || []).filter((g) => g.id !== groupId)

    // Update the questions to unmark them from the group
    const updatedQuestions = section.questions.map((question) => {
      if (question.groupId === groupId) {
        return {
          ...question,
          isPartOfGroup: false,
          groupId: undefined,
          groupPosition: undefined,
        }
      }
      return question
    })

    onUpdateSection(section.id, {
      questionGroups: updatedGroups.length > 0 ? updatedGroups : undefined,
      questions: updatedQuestions,
    })
  }

  return (
    <Card className="mb-6">
      <CardHeader className="cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <CardTitle className="flex justify-between items-center">
          <span>{section.title}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              {collapsed ? "Expand" : "Collapse"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering the collapse
                onRemoveSection(section.id)
              }}
            >
              Delete
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {Math.floor(section.duration / 60)} minutes • {section.questions.length} questions
        </CardDescription>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`section-title-${index}`}>Section Title</Label>
            <Input
              id={`section-title-${index}`}
              value={section.title}
              onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`section-description-${index}`}>Description</Label>
            <Textarea
              id={`section-description-${index}`}
              value={section.description}
              onChange={(e) => onUpdateSection(section.id, { description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`section-duration-${index}`}>Duration (minutes)</Label>
            <Input
              id={`section-duration-${index}`}
              type="number"
              value={Math.floor(section.duration / 60)}
              onChange={(e) => {
                const minutes = Number.parseInt(e.target.value) || 0
                onUpdateSection(section.id, { duration: minutes * 60 })
              }}
              min="1"
              max="60"
            />
          </div>

          {testType === "reading" && (
            <div className="space-y-2">
              <Label htmlFor={`section-reading-passage-${index}`}>Reading Passage</Label>
              <div className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label htmlFor={`passage-title-${index}`}>Passage Title</Label>
                  <Input
                    id={`passage-title-${index}`}
                    value={section.readingPassage?.title || ""}
                    onChange={(e) => {
                      const updatedPassage = {
                        ...(section.readingPassage || {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        }),
                        title: e.target.value,
                      }
                      onUpdateSection(section.id, { readingPassage: updatedPassage })
                    }}
                    placeholder="Enter passage title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`passage-content-${index}`}>Passage Content</Label>
                  <Textarea
                    id={`passage-content-${index}`}
                    value={section.readingPassage?.content || ""}
                    onChange={(e) => {
                      const updatedPassage = {
                        ...(section.readingPassage || {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        }),
                        content: e.target.value,
                      }
                      onUpdateSection(section.id, { readingPassage: updatedPassage })
                    }}
                    placeholder="Enter passage content"
                    rows={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`passage-source-${index}`}>Source (Optional)</Label>
                  <Input
                    id={`passage-source-${index}`}
                    value={section.readingPassage?.source || ""}
                    onChange={(e) => {
                      const updatedPassage = {
                        ...(section.readingPassage || {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        }),
                        source: e.target.value,
                      }
                      onUpdateSection(section.id, { readingPassage: updatedPassage })
                    }}
                    placeholder="Enter source information"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`passage-has-images-${index}`}
                    checked={section.readingPassage?.hasImages || false}
                    onCheckedChange={(checked) => {
                      const updatedPassage = {
                        ...(section.readingPassage || {
                          id: uuidv4(),
                          title: "",
                          content: "",
                          hasImages: false,
                          imageUrls: [],
                        }),
                        hasImages: !!checked,
                      }
                      onUpdateSection(section.id, { readingPassage: updatedPassage })
                    }}
                  />
                  <Label htmlFor={`passage-has-images-${index}`}>Includes images</Label>
                </div>

                {section.readingPassage?.hasImages && (
                  <div className="space-y-2">
                    <Label>Images</Label>
                    {(section.readingPassage?.imageUrls || []).map((url, imgIndex) => (
                      <div key={imgIndex} className="flex gap-2 items-center">
                        <div className="flex-1 border rounded-md p-2 flex items-center gap-2 text-sm truncate">
                          <img src={url || "/placeholder.svg"} alt="Preview" className="h-8 w-8 object-cover rounded" />
                          <span className="truncate">{url.split("/").pop()}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newUrls = (section.readingPassage?.imageUrls || []).filter((_, i) => i !== imgIndex)
                            const updatedPassage = {
                              ...section.readingPassage,
                              imageUrls: newUrls,
                            }
                            onUpdateSection(section.id, { readingPassage: updatedPassage })
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <FilePicker fileType="image" onFileSelect={handleImageSelect} currentFileUrl="" />
                  </div>
                )}
              </div>
            </div>
          )}

          {testType === "listening" && (
            <div className="space-y-2">
              <Label htmlFor={`section-audio-${index}`}>Audio File</Label>
              <FilePicker fileType="audio" onFileSelect={handleAudioSelect} currentFileUrl={section.audioUrl || ""} />
            </div>
          )}

          <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Questions ({section.questions.length})</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleAddGroup}>
                  <Layers className="mr-2 h-4 w-4" /> Group Questions
                </Button>
                <Button size="sm" onClick={() => setShowQuestionTypeDialog(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </div>
            </div>

            {/* Question Groups Section */}
            {section.questionGroups && section.questionGroups.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium mb-2">Question Groups</h4>
                <div className="space-y-3">
                  {section.questionGroups.map((group) => (
                    <Card key={group.id} className="p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{group.title}</h5>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditGroup(group)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveGroup(group.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{group.instructions}</p>
                      <div className="text-sm">
                        <span className="font-medium">Questions:</span> {group.questionIds.length} questions in this
                        group
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <QuestionTypeDialog
              open={showQuestionTypeDialog}
              onOpenChange={setShowQuestionTypeDialog}
              testType={testType}
              onSelectQuestionType={(type) => {
                onAddQuestion(section.id, type)
                setShowQuestionTypeDialog(false)
              }}
            />

            <Dialog open={showGroupEditor} onOpenChange={setShowGroupEditor}>
              <DialogContent className="max-w-3xl">
                <QuestionGroupEditor
                  group={currentGroup}
                  sectionId={section.id}
                  availableQuestions={section.questions}
                  onSave={handleSaveGroup}
                  onCancel={() => setShowGroupEditor(false)}
                />
              </DialogContent>
            </Dialog>

            <QuestionList
              questions={section.questions}
              questionGroups={section.questionGroups}
              sectionId={section.id}
              onUpdateQuestion={onUpdateQuestion}
              onRemoveQuestion={onRemoveQuestion}
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}

