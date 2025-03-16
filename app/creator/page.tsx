"use client"

import { useState } from "react"
import { useCreatorStore } from "@/store/creator-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Save, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { TestType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import TestCreationDialog from "@/components/creator/test-creation-dialog"
import SectionEditor from "@/components/creator/section-editor"
import { useToast } from "@/components/ui/use-toast"

export default function CreatorPage() {
  const [activeTab, setActiveTab] = useState("tests")
  const [showNewTestDialog, setShowNewTestDialog] = useState(false)
  const [testDetailsCollapsed, setTestDetailsCollapsed] = useState(false)

  const { toast } = useToast()

  const {
    currentTest,
    savedTests,
    createNewTest,
    updateTestDetails,
    saveTest,
    loadTest,
    deleteTest,
    addSection,
    removeSection,
    updateSection,
    addQuestion,
    removeQuestion,
    updateQuestion,
  } = useCreatorStore()

  // Create a new test
  const handleCreateTest = (title: string, type: TestType) => {
    // Handle reading variants
    if (type === "reading-general") {
      createNewTest("reading", title, "general")
    } else if (type === "reading") {
      createNewTest("reading", title, "academic")
    } else {
      createNewTest(type, title)
    }
    setActiveTab("editor")
  }

  // Save the current test
  const handleSaveTest = () => {
    saveTest()
    toast({
      title: "Test saved",
      description: "Your test has been saved successfully.",
    })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Test Creator</h1>
          <p className="text-muted-foreground">Create and manage IELTS test modules</p>
        </div>

        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>

          {currentTest && (
            <Button onClick={handleSaveTest}>
              <Save className="mr-2 h-4 w-4" /> Save Test
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="tests">My Tests</TabsTrigger>
          <TabsTrigger value="editor" disabled={!currentTest}>
            Test Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Test Card */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="text-center">
                <CardTitle>Create New Test</CardTitle>
                <CardDescription>Start building a new IELTS test module</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center py-8">
                <Button variant="ghost" className="h-20 w-20 rounded-full" onClick={() => setShowNewTestDialog(true)}>
                  <PlusCircle className="h-10 w-10" />
                </Button>
              </CardContent>
            </Card>

            <TestCreationDialog
              open={showNewTestDialog}
              onOpenChange={setShowNewTestDialog}
              onCreateTest={handleCreateTest}
            />

            {/* Saved Tests */}
            {savedTests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {test.title}
                  </CardTitle>
                  <CardDescription>
                    <span className="capitalize">{test.type}</span> • {test.totalQuestions} questions •{" "}
                    {Math.floor(test.totalDuration / 60)} minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">{test.description || "No description provided."}</p>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">{test.sections.length} sections</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this test?")) {
                        deleteTest(test.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      loadTest(test.id)
                      setActiveTab("editor")
                    }}
                  >
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor">
          {currentTest ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setTestDetailsCollapsed(!testDetailsCollapsed)}>
                  <CardTitle className="flex justify-between items-center">
                    <span>Test Details</span>
                    <Button variant="ghost" size="sm">
                      {testDetailsCollapsed ? "Expand" : "Collapse"}
                    </Button>
                  </CardTitle>
                  <CardDescription>Basic information about your test</CardDescription>
                </CardHeader>
                {!testDetailsCollapsed && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={currentTest.title}
                        onChange={(e) => updateTestDetails({ title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={currentTest.description}
                        onChange={(e) => updateTestDetails({ description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-instructions">Instructions</Label>
                      <Textarea
                        id="edit-instructions"
                        value={currentTest.instructions}
                        onChange={(e) => updateTestDetails({ instructions: e.target.value })}
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Test Type</Label>
                        <p className="mt-1 capitalize">{currentTest.type}</p>
                      </div>
                      <div>
                        <Label>Total Duration</Label>
                        <p className="mt-1">{Math.floor(currentTest.totalDuration / 60)} minutes</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Sections</h2>
                <Button onClick={() => addSection()}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Section
                </Button>
              </div>

              {currentTest.sections.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No sections added yet</p>
                  <Button onClick={() => addSection()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Section
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {currentTest.sections.map((section, index) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      index={index}
                      testType={currentTest.type}
                      onUpdateSection={updateSection}
                      onRemoveSection={removeSection}
                      onAddQuestion={addQuestion}
                      onUpdateQuestion={updateQuestion}
                      onRemoveQuestion={removeQuestion}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No test selected</p>
              <Button onClick={() => setActiveTab("tests")}>Go to My Tests</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

