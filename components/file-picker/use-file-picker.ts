"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { type FileType, type FileObject, supabaseStorage } from "@testComponents/lib/supabase-storage";

export const SORT_CYCLE = { name: "date", date: "size", size: "name" } as const;
export const SORT_LABELS = { name: "Name", date: "Date", size: "Size" } as const;

export const emptyFile = (fileType: FileType): FileObject => ({
  id: "", name: "", url: "", size: 0, createdAt: "", type: fileType,
});

export function useFilePicker(fileType: FileType, onFileSelect: (file: FileObject) => void, currentFileUrl?: string) {
  // Dialog visibility
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // File browser state
  const [files, setFiles] = useState<FileObject[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"name" | "date" | "size">("name");
  const [isLoading, setIsLoading] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Folder creation: null = hidden, string = input value
  const [folderInput, setFolderInput] = useState<string | null>(null);

  // Preview
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentFileUrl);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filteredFiles = useMemo(() => {
    const result = searchQuery.trim()
      ? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : [...files];

    return result.sort((a, b) => {
      if (sortOrder === "name") return a.name.localeCompare(b.name);
      if (sortOrder === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.size - a.size;
    });
  }, [files, searchQuery, sortOrder]);

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => { setPreviewUrl(currentFileUrl); }, [currentFileUrl]);
  useEffect(() => { setSearchQuery(""); }, [currentFolder]);

  const refreshFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await supabaseStorage.listFiles(fileType, currentFolder || undefined);
      setFolders(result.filter((f) => !f.id).map((f) => f.name));
      setFiles(result.filter((f) => !!f.id));
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fileType, currentFolder]);

  useEffect(() => { if (isOpen) refreshFiles(); }, [isOpen, currentFolder, refreshFiles]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleCreateFolder = async () => {
    if (!folderInput?.trim()) return;
    const name = folderInput.trim();
    try {
      const success = await supabaseStorage.createFolder(name);
      // Whether server succeeds or not, add to local list
      if (success) {
        setFolders((prev) => [...new Set([...prev, name])]);
      } else {
        // Virtual folder — shows in UI even if not persisted
        setFolders((prev) => [...new Set([...prev, name])]);
      }
    } catch {
      setFolders((prev) => [...new Set([...prev, name])]);
    } finally {
      setFolderInput(null);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const uploaded = await supabaseStorage.uploadFile(uploadFile, fileType, currentFolder || undefined);
      setFiles((prev) => [uploaded, ...prev]);
      onFileSelect(uploaded);
      setPreviewUrl(uploaded.url);
      setIsUploadModalOpen(false);
      setUploadFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    if (fileType === "image") {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else if (fileType === "audio") {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectFile = (file: FileObject) => {
    onFileSelect(file);
    setPreviewUrl(file.url);
    setIsOpen(false);
  };

  const handleDeleteFile = async (e: React.MouseEvent, file: FileObject) => {
    e.stopPropagation();
    if (!file.path || !confirm(`Delete "${file.name}"?`)) return;
    const success = await supabaseStorage.deleteFile(file.path);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      if (previewUrl === file.url) {
        setPreviewUrl(undefined);
        onFileSelect(emptyFile(fileType));
      }
    }
  };

  const handleCopyFile = async (file: FileObject, targetFolder: string) => {
    if (!file.path) return;
    await supabaseStorage.copyFile(file.path, targetFolder);
    // No need to update local state — file stays in current folder
  };

  const handleMoveFile = async (file: FileObject, targetFolder: string) => {
    if (!file.path) return;
    const newPath = await supabaseStorage.moveFile(file.path, targetFolder);
    if (newPath) {
      // Remove from current list since it moved to another folder
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      if (previewUrl === file.url) {
        setPreviewUrl(undefined);
        onFileSelect(emptyFile(fileType));
      }
    }
  };

  const clearSelectedFile = (e: React.MouseEvent) => {    e.stopPropagation();
    setPreviewUrl(undefined);
    onFileSelect(emptyFile(fileType));
  };

  return {
    // dialog
    isOpen, setIsOpen,
    isUploadModalOpen, setIsUploadModalOpen,
    // browser
    currentFolder, setCurrentFolder,
    searchQuery, setSearchQuery,
    sortOrder, setSortOrder,
    isLoading,
    folders,
    filteredFiles,
    // folder creation (null = hidden)
    folderInput, setFolderInput,
    // upload
    uploadFile,
    isUploading,
    // preview
    previewUrl,
    audioRef,
    // handlers
    refreshFiles,
    handleCreateFolder,
    handleFileUpload,
    handleFileChange,
    handleSelectFile,
    handleDeleteFile,
    handleMoveFile,
    clearSelectedFile,
  };
}
