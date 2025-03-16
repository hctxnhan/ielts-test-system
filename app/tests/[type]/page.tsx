"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TestPlayer from "@/components/test-player/test-player"
import { sampleListeningTest, sampleWritingTest } from "@/lib/sample-data"
import type { Test } from "@/lib/types"

interface TestPageProps {
  params: {
    type: string
  }
}

export default function TestPage({ params }: TestPageProps) {
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // In a real app, you would fetch the test data from an API
    // For now, we'll use the sample data
    const loadTest = () => {
      setLoading(true)

      // Check if the test type is valid
      if (params.type === "listening") {
        setTest(sampleListeningTest)
      } else if (params.type === "reading") {
        // Redirect to reading variants page
        router.push("/tests")
      } else if (params.type === "writing") {
        setTest(sampleWritingTest)
      } else {
        // Redirect to tests page if test type is not available
        router.push("/tests")
      }

      setLoading(false)
    }

    loadTest()
  }, [params.type, router])

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[60vh]">
        <p>Loading test...</p>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center items-center min-h-[60vh]">
        <p>Test not found or not available yet.</p>
      </div>
    )
  }

  return <TestPlayer test={test} />
}

