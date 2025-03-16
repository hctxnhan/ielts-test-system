"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Headphones, Book, Pencil, MessageCircle, Edit, Copy, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useCreatorStore } from "@/store/creator-store"
import {
  sampleListeningTest,
  sampleAcademicReadingTest,
  sampleGeneralReadingTest,
  sampleWritingTest,
} from "@/lib/sample-data"
import { v4 as uuidv4 } from "uuid"
import type { Test, Section } from "@/lib/types"
import { useCallback, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TestsPage() {
  const router = useRouter()
  const { createNewTest, updateTestDetails, savedTests, loadTest, deleteTest } = useCreatorStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<string | null>(null)
  const [testTemplate, setTestTemplate] = useState<Test | null>(null)

  const testModules = [
    {
      id: "listening",
      title: "Listening",
      description: "40 minutes, 40 questions across 4 sections",
      icon: Headphones,
      available: true,
      color: "bg-blue-500",
      sampleTest: sampleListeningTest,
    },
    {
      id: "reading",
      title: "Reading",
      description: "60 minutes, 40 questions across 3 passages",
      icon: Book,
      available: true,
      color: "bg-green-500",
      variants: [
        {
          id: "academic",
          title: "Academic",
          description: "Texts from academic sources like journals and textbooks",
          sampleTest: sampleAcademicReadingTest,
        },
        {
          id: "general",
          title: "General Training",
          description: "Texts from everyday sources like advertisements and brochures",
          sampleTest: sampleGeneralReadingTest,
        },
      ],
    },
    {
      id: "writing",
      title: "Writing",
      description: "60 minutes, 2 tasks",
      icon: Pencil,
      available: true,
      color: "bg-amber-500",
      sampleTest: sampleWritingTest,
      variants: [
        {
          id: "academic",
          title: "Academic",
          description: "Task 1: Describe visual information. Task 2: Essay writing",
          sampleTest: sampleWritingTest,
        },
        {
          id: "general",
          title: "General Training",
          description: "Task 1: Letter writing. Task 2: Essay writing",
          sampleTest: sampleWritingTest,
        },
      ],
    },
    {
      id: "speaking",
      title: "Speaking",
      description: "11-14 minutes, 3 parts",
      icon: MessageCircle,
      available: false,
      color: "bg-purple-500",
    },
  ]

  // Function to use a test as template and navigate to creator
  const useTestAsTemplate = useCallback(() => {
    if (!testTemplate) return

    const test = testTemplate
    // Create a duplicate with a new ID and modified title
    const newId = uuidv4()

    // First load the basic test structure
    createNewTest(test.type, `Copy of ${test.title}`, test.readingVariant)

    // Deep copy sections with new IDs
    const newSections: Section[] = test.sections.map((section) => {
      const newSectionId = uuidv4()

      // Copy questions with new IDs but preserve their content
      const newQuestions = section.questions.map((q) => ({
        ...q,
        id: uuidv4(),
        // Reset group information as we'll recreate groups
        isPartOfGroup: false,
        groupId: undefined,
        groupPosition: undefined,
      }))

      // Create a new section with the copied questions
      return {
        ...section,
        id: newSectionId,
        questions: newQuestions,
        // Reset question groups - we'll recreate them if needed
        questionGroups: undefined,
      }
    })

    // Update all the test details including sections
    updateTestDetails({
      description: test.description,
      instructions: test.instructions,
      sections: newSections,
    })

    // Navigate to the creator page
    router.push("/creator")
    setTestTemplate(null) // Reset the template after use
  }, [createNewTest, router, updateTestDetails, testTemplate])

  // useEffect to trigger the template creation
  // useEffect(() => {
  //   if (testTemplate) {
  //     useTestAsTemplate();
  //   }
  // }, [testTemplate, useTestAsTemplate]);

  const handleEditTest = useCallback(
    (testId: string) => {
      loadTest(testId)
      router.push("/creator")
    },
    [loadTest, router],
  )

  const confirmDeleteTest = useCallback((testId: string) => {
    setTestToDelete(testId)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteTest = useCallback(() => {
    if (testToDelete) {
      deleteTest(testToDelete)
      setDeleteDialogOpen(false)
      setTestToDelete(null)
    }
  }, [deleteTest, testToDelete])

  // Group tests by type
  const userTests = {
    listening: savedTests.filter((test) => test.type === "listening"),
    reading: {
      academic: savedTests.filter((test) => test.type === "reading" && test.readingVariant === "academic"),
      general: savedTests.filter((test) => test.type === "reading" && test.readingVariant === "general"),
    },
    writing: {
      academic: savedTests.filter((test) => test.type === "writing" && test.readingVariant === "academic"),
      general: savedTests.filter((test) => test.type === "writing" && test.readingVariant === "general"),
    },
    speaking: savedTests.filter((test) => test.type === "speaking"),
  }

  // Function to render a user test card
  const renderUserTestCard = (test: Test) => (
    <Card key={test.id} className="overflow-hidden">
      <div
        className={`h-2 ${
          test.type === "listening"
            ? "bg-blue-500"
            : test.type === "reading"
              ? "bg-green-500"
              : test.type === "writing"
                ? "bg-amber-500"
                : "bg-purple-500"
        }`}
      />
      <CardHeader>
        <CardTitle>{test.title}</CardTitle>
        <CardDescription>
          {test.description || `${test.totalQuestions} questions, ${Math.floor(test.totalDuration / 60)} minutes`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {test.sections.length} {test.sections.length === 1 ? "section" : "sections"} • Created by you
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Link href={`/test-player/${test.id}`} className="w-full">
          <Button className="w-full">Start Test</Button>
        </Link>
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="icon" onClick={() => handleEditTest(test.id)} title="Edit Test">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setTestTemplate(test)} title="Duplicate Test">
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => confirmDeleteTest(test.id)}
            className="text-destructive hover:bg-destructive/10"
            title="Delete Test"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Tests</h1>

      {/* My Tests Section */}
      {savedTests.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">My Tests</h2>
          <Tabs defaultValue="all" className="mb-12">
            <TabsList>
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="listening">Listening</TabsTrigger>
              <TabsTrigger value="reading">Reading</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{savedTests.map(renderUserTestCard)}</div>
            </TabsContent>

            <TabsContent value="listening" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userTests.listening.length > 0 ? (
                  userTests.listening.map(renderUserTestCard)
                ) : (
                  <p>You haven't created any listening tests yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reading" className="mt-4">
              <Tabs defaultValue="academic">
                <TabsList>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="general">General Training</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userTests.reading.academic.length > 0 ? (
                      userTests.reading.academic.map(renderUserTestCard)
                    ) : (
                      <p>You haven't created any academic reading tests yet.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="general" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userTests.reading.general.length > 0 ? (
                      userTests.reading.general.map(renderUserTestCard)
                    ) : (
                      <p>You haven't created any general training reading tests yet.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="writing" className="mt-4">
              <Tabs defaultValue="academic">
                <TabsList>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="general">General Training</TabsTrigger>
                </TabsList>

                <TabsContent value="academic" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userTests.writing.academic.length > 0 ? (
                      userTests.writing.academic.map(renderUserTestCard)
                    ) : (
                      <p>You haven't created any academic writing tests yet.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="general" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userTests.writing.general.length > 0 ? (
                      userTests.writing.general.map(renderUserTestCard)
                    ) : (
                      <p>You haven't created any general training writing tests yet.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Sample Tests Section */}
      <h2 className="text-2xl font-semibold mb-4">Sample Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {testModules.map((module) => (
          <Card key={module.id} className="overflow-hidden">
            <div className={`h-2 ${module.color}`} />
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-2 rounded-full ${module.color} bg-opacity-10`}>
                <module.icon className={`h-6 w-6 text-${module.color.split("-")[1]}-500`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {module.title}
                  {!module.available && (
                    <Badge variant="outline" className="ml-2">
                      Coming Soon
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {module.id === "listening"
                  ? "Listen to audio recordings and answer questions based on what you hear. Includes multiple choice, form completion, and matching exercises."
                  : module.id === "reading"
                    ? "Read passages and answer questions to test your comprehension. Includes multiple choice, true/false/not given, and matching exercises."
                    : module.id === "writing"
                      ? "Complete two writing tasks. Task 1 is worth 1/3 of the marks, Task 2 is worth 2/3 of the marks."
                      : "This module will be available soon."}
              </p>

              {module.variants && (
                <div className="mt-4">
                  <Tabs defaultValue={module.variants[0].id}>
                    <TabsList className="w-full">
                      {module.variants.map((variant) => (
                        <TabsTrigger key={variant.id} value={variant.id} className="flex-1">
                          {variant.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {module.variants.map((variant) => (
                      <TabsContent key={variant.id} value={variant.id} className="mt-2">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{variant.description}</p>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            {module.available && (
                              <Link href={`/tests/${module.id}/${variant.id}`} className="w-full">
                                <Button className="w-full" size="sm">
                                  Start {variant.title} Test
                                </Button>
                              </Link>
                            )}
                            {variant.sampleTest && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setTestTemplate(variant.sampleTest)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Use as Template
                              </Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {module.available && !module.variants ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Link href={`/tests/${module.id}`} className="w-full">
                    <Button className="w-full">Start Test</Button>
                  </Link>
                  {module.sampleTest && (
                    <Button variant="outline" className="w-full" onClick={() => setTestTemplate(module.sampleTest)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Use as Template
                    </Button>
                  )}
                </div>
              ) : !module.available ? (
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this test. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Template Confirmation Dialog */}
      <AlertDialog open={testTemplate !== null} onOpenChange={() => setTestTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use as Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to use this test as a template? This will create a copy of the test in the creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestTemplate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={useTestAsTemplate}>Use Template</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

