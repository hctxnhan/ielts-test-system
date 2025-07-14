"use client";

import React from "react";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@testComponents/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@testComponents/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@testComponents/lib/utils";

interface TimeUpDialogProps {
  isOpen: boolean;
  onSubmitTest: () => void;
}

// Custom dialog content without close button
const DialogContentWithoutClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContentWithoutClose.displayName = "DialogContentWithoutClose";

export default function TimeUpDialog({ isOpen, onSubmitTest }: TimeUpDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContentWithoutClose className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-red-600">
            Hết thời gian!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            Thời gian làm bài đã kết thúc. Bạn cần nộp bài ngay bây giờ.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onSubmitTest}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Nộp bài
          </Button>
        </div>
      </DialogContentWithoutClose>
    </Dialog>
  );
}
