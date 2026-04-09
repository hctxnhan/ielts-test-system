"use client";

/**
 * FilePicker — integrated with StorageManager
 *
 * Click "Browse" → opens a dialog with the full StorageManager inside.
 * Click a file in the manager → selects it, closes dialog, shows preview.
 * Keeps the same external API: fileType, onFileSelect, currentFileUrl.
 */

import { useState, useRef, useMemo, useCallback } from "react";
import { type FileType, type FileObject } from "../../lib/supabase-storage";
import { Image, Music, File, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { StorageManager } from "../storage-manager/storage-manager";
import { ENV } from "../../lib/env";
import type {
  StorageFile,
  FileMimeCategory,
} from "../../lib/storage-manager-types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface FilePickerProps {
  fileType: FileType;
  onFileSelect: (file: FileObject) => void;
  currentFileUrl?: string;
  /** Override Supabase URL (defaults to ENV) */
  supabaseUrl?: string;
  /** Override Supabase anon key (defaults to ENV) */
  supabaseAnonKey?: string;
  /** Override bucket name (defaults to ENV) */
  bucketName?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Map FileType ("image"|"audio") to FileMimeCategory filter */
function fileTypeToCategories(fileType: FileType): FileMimeCategory[] {
  switch (fileType) {
    case "image":
      return ["image"];
    case "audio":
      return ["audio"];
    default:
      return [];
  }
}

/** Map FileType to allowed MIME patterns for upload */
function fileTypeToMimePatterns(fileType: FileType): string[] {
  switch (fileType) {
    case "image":
      return ["image/*"];
    case "audio":
      return ["audio/*", ".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a", ".wma", ".opus", ".webm"];
    default:
      return [];
  }
}

/** Convert StorageFile → FileObject for backward compatibility */
function storageFileToFileObject(
  sf: StorageFile,
  fileType: FileType
): FileObject {
  return {
    id: sf.id,
    name: sf.name,
    url: sf.url,
    type: fileType,
    size: sf.size,
    createdAt: sf.createdAt,
    path: sf.path,
    folder: sf.folder,
  };
}


// ─── Component ──────────────────────────────────────────────────────────────

export default function FilePicker({
  fileType,
  onFileSelect,
  currentFileUrl,
  supabaseUrl,
  supabaseAnonKey,
  bucketName,
}: FilePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentFileUrl
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  // Supabase config — use props or fall back to ENV
  const supabaseConfig = useMemo(
    () => ({
      supabaseUrl: supabaseUrl || ENV.SUPABASE_URL,
      supabaseAnonKey: supabaseAnonKey || ENV.SUPABASE_ANON_KEY,
      bucketName: bucketName || ENV.STORAGE_BUCKET,
      isPublicBucket: true,
      rootFolder: "",
    }),
    [supabaseUrl, supabaseAnonKey, bucketName]
  );

  // Upload config scoped to fileType
  const uploadConfig = useMemo(
    () => ({
      allowedMimeTypes: fileTypeToMimePatterns(fileType),
      maxFileSize: 52428800, // 50MB
      maxFilesPerUpload: 20,
      autoUniqueNames: true,
    }),
    [fileType]
  );

  // Default filter to show only relevant file types
  const defaultFilterCategories = useMemo(
    () => fileTypeToCategories(fileType),
    [fileType]
  );

  // When a file is selected inside StorageManager → select it and close
  const handleFileSelect = useCallback(
    (file: StorageFile) => {
      const fileObj = storageFileToFileObject(file, fileType);
      onFileSelect(fileObj);
      setPreviewUrl(file.url);
      setIsOpen(false);
    },
    [fileType, onFileSelect]
  );

  // Clear selection
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewUrl(undefined);
      onFileSelect({
        id: "",
        name: "",
        url: "",
        size: 0,
        createdAt: "",
        type: fileType,
      });
    },
    [fileType, onFileSelect]
  );

  // Sync preview when parent changes currentFileUrl
  const prevFileUrlRef = useRef(currentFileUrl);
  if (currentFileUrl !== prevFileUrlRef.current) {
    prevFileUrlRef.current = currentFileUrl;
    // Safe: only runs when prop actually changes between renders
    if (currentFileUrl !== previewUrl) {
      setPreviewUrl(currentFileUrl || undefined);
    }
  }

  const fileIcon = useMemo(() => {
    if (fileType === "image") return <Image className="h-4 w-4" />;
    if (fileType === "audio") return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  }, [fileType]);

  return (
    <div>
      {/* Field + Browse button */}
      <div className="flex items-center gap-1.5">
        {previewUrl ? (
          <div className="flex-1 border border-muted rounded px-2 py-1.5 flex items-center gap-1.5 text-xs truncate">
            {fileIcon}
            <span className="truncate">{previewUrl.split("/").pop()}</span>
          </div>
        ) : (
          <div className="flex-1 border border-dashed rounded px-2 py-1.5 text-xs text-muted-foreground">
            No {fileType} selected
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-3"
            >
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[850px] md:max-w-[950px] p-0 gap-0">
            <DialogHeader className="px-4 pt-4 pb-2">
              <DialogTitle className="text-base">
                Select {fileType}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              {isOpen && (
                <StorageManager
                  supabaseConfig={supabaseConfig}
                  uploadConfig={uploadConfig}
                  inputAccept={fileType === "audio" ? ".mp3,.wav,.ogg,.flac,.aac,.m4a,.wma" : fileType === "image" ? "image/*" : undefined}
                  paginationConfig={{ enabled: true, pageSize: 20, pageSizeOptions: [10, 20, 50] }}
                  features={{
                    canCreateFolder: true,
                    canUpload: true,
                    canDelete: false,
                    canMove: false,
                    canCopy: false,
                    canRename: false,
                    canDownload: false,
                    showPreview: false,
                    multiSelect: false,
                    showBreadcrumb: true,
                    showFileSize: true,
                    showDate: true,
                  }}
                  defaultViewMode="grid"
                  defaultSort={{ field: "name", direction: "asc" }}
                  defaultFilterCategories={defaultFilterCategories}
                  onFileSelect={handleFileSelect}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      {previewUrl && (
        <FilePreviewInline
          fileType={fileType}
          previewUrl={previewUrl}
          audioRef={audioRef}
          onClear={handleClear}
        />
      )}
    </div>
  );
}

// ─── Inline Preview (kept from original file-picker-parts) ──────────────────

function FilePreviewInline({
  fileType,
  previewUrl,
  audioRef,
  onClear,
}: {
  fileType: FileType;
  previewUrl: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onClear: (e: React.MouseEvent) => void;
}) {
  if (fileType === "image") {
    return (
      <div className="mt-2 relative group">
        <div className="border rounded-md overflow-hidden bg-muted/20">
          <img
            src={previewUrl}
            alt="Selected"
            className="w-full object-contain max-h-48"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/70 hover:bg-background shadow-sm opacity-70 group-hover:opacity-100 transition-opacity"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 border rounded-md bg-muted/20 p-2">
      <audio ref={audioRef} src={previewUrl} controls className="flex-1 h-10" />
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 w-8 h-8 rounded-full bg-destructive border-2 border-white flex items-center justify-center text-white hover:opacity-90"
      >
        <X size={16} />
      </button>
    </div>
  );
}
