"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TestType } from "@/lib/types"

interface TestCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTest: (title: string, type: TestType) => void
}

export default function TestCreationDialog({ open, onOpenChange, onCreateTest }: TestCreationDialogProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<TestType>("listening")

  const handleCreateTest = () => {
    if (title.trim()) {
      onCreateTest(title, type)
      setTitle("")
      setType("listening")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
          <DialogDescription>Enter the details for your new test module.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-title">Test Title</Label>
            <Input
              id="test-title"
              placeholder="e.g., IELTS Listening Practice Test 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-type">Test Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TestType)}>
              <SelectTrigger id="test-type">
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="listening">Listening</SelectItem>
                <SelectItem value="reading">Reading (Academic)</SelectItem>
                <SelectItem value="reading-general">Reading (General Training)</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="speaking">Speaking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateTest}>Create Test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

