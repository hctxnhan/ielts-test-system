"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import TestPlayer from "@/components/test-player/test-player"
import { useCreatorStore } from "@/store/creator-store"
import type { Test } from "@/lib/types"

interface TestPlayerPageProps {
  params: {
    id: string
  }
}

export default function TestPlayerPage({ params }: TestPlayerPageProps) {
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { savedTests } = useCreatorStore()

  useEffect(() => {
    // Load the test from the creator store
    const loadTest = () => {
      setLoading(true)

      // Find the test with the matching ID
      const foundTest = savedTests.find((test) => test.id === params.id)

      if (foundTest) {
        setTest(foundTest)
      } else {
        // Redirect to tests page if test is not found
        router.push("/tests")
      }

      setLoading(false)
    }

    loadTest()
  }, [params.id, router, savedTests])

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

