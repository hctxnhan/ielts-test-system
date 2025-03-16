"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Test } from "@/lib/types"
import { Clock, FileText, HelpCircle } from "lucide-react"

interface TestInstructionsProps {
  test: Test
  onStart: () => void
}

export default function TestInstructions({ test, onStart }: TestInstructionsProps) {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{test.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Duration</h3>
              <p>{Math.floor(test.totalDuration / 60)} minutes</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Questions</h3>
              <p>{test.totalQuestions} questions</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <HelpCircle className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Test Type</h3>
              <p className="capitalize">{test.type}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p>{test.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Instructions</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-line">{test.instructions}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Test Structure</h3>
            <div className="space-y-2">
              {test.sections.map((section, index) => (
                <div key={section.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{section.title}</h4>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>{section.questions.length} questions</span>
                    <span>{Math.floor(section.duration / 60)} minutes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-amber-800 dark:text-amber-300">Important Notes</h3>
            <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
              <li>Once you start the test, the timer will begin and cannot be paused.</li>
              <li>For listening sections, you will only hear each recording once.</li>
              <li>Answer all questions to the best of your ability.</li>
              <li>You can navigate between questions using the Previous and Next buttons.</li>
              <li>Your progress is saved automatically.</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={onStart} className="w-full">
            Start Test
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

