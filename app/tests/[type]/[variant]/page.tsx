"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TestPlayer from "@/components/test-player/test-player"
import { sampleAcademicReadingTest, sampleGeneralReadingTest, sampleWritingTest } from "@/lib/sample-data"
import type { Test } from "@/lib/types"

interface TestPageProps {
  params: {
    type: string
    variant: string
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

      // Check if the test type and variant are valid
      if (params.type === "reading") {
        if (params.variant === "academic") {
          setTest(sampleAcademicReadingTest)
        } else if (params.variant === "general") {
          setTest(sampleGeneralReadingTest)
        } else {
          // Redirect to tests page if variant is not available
          router.push("/tests")
        }
      } else if (params.type === "writing") {
        // Handle writing test variants
        if (params.variant === "academic" || params.variant === "general") {
          // For now, we'll use the same sample writing test for both variants
          // In a real app, you would have different tests for each variant
          setTest({
            ...sampleWritingTest,
            title: `IELTS ${params.variant === "academic" ? "Academic" : "General Training"} Writing Practice Test`,
            readingVariant: params.variant,
          })
        } else {
          router.push("/tests")
        }
      } else {
        // Redirect to tests page if test type is not available
        router.push("/tests")
      }

      setLoading(false)
    }

    loadTest()
  }, [params.type, params.variant, router])

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

