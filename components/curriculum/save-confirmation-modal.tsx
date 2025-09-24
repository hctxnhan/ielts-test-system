"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@testComponents/components/ui/dialog";
import { Button } from "@testComponents/components/ui/button";
import { Alert, AlertDescription } from "@testComponents/components/ui/alert";
import { useCurriculumStore } from "@testComponents/store/curriculum-store";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName?: string;
}

export function SaveConfirmationModal({
  isOpen,
  onClose,
  courseName,
}: SaveConfirmationModalProps) {
  const { currentCurriculum, setModified } = useCurriculumStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleConfirmSave = async () => {
    if (!currentCurriculum) return;

    setIsSaving(true);
    
    try {
      // Simulate API call - replace with actual save logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would:
      // 1. Save the curriculum to the database
      // 2. Create a new version
      // 3. Update the course-curriculum relationship
      // const result = await saveCurriculum(currentCurriculum);
      
      setSaveSuccess(true);
      setModified(false);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
        setIsSaving(false);
      }, 2000);
      
    } catch (error) {
      console.error("Failed to save curriculum:", error);
      setIsSaving(false);
      // You could show an error message here
    }
  };

  const handleCancel = () => {
    if (!isSaving) {
      onClose();
      setSaveSuccess(false);
      setIsSaving(false);
    }
  };

  if (!currentCurriculum) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {saveSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Curriculum Saved Successfully
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Save Curriculum Changes
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {saveSuccess ? (
              "The new curriculum version has been created and will be applied to future classes."
            ) : (
              <>
                You are about to save changes to the curriculum
                {courseName && (
                  <span className="font-medium"> for &ldquo;{courseName}&rdquo;</span>
                )}
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!saveSuccess && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> A new version of the curriculum will be created and applied to classes created in the future. Current ongoing classes will continue to use their existing curriculum version and will not be affected by these changes.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Curriculum Details:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Title: {currentCurriculum.content.title}</div>
                <div>Sessions: {currentCurriculum.content.sessions.length}</div>
                <div>
                  Total Tests: {currentCurriculum.content.sessions.reduce(
                    (total, session) => total + session.testIds.length,
                    0
                  )}
                </div>
                {currentCurriculum.content.description && (
                  <div>Description: {currentCurriculum.content.description}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Version {currentCurriculum.version + 1} has been created
            </p>
          </div>
        )}

        <DialogFooter>
          {!saveSuccess && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Confirm & Save"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}