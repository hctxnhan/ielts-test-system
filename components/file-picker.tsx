"use client";

import type React from "react";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type FileType,
  type FileObject,
  supabaseStorage,
} from "@/lib/supabase-storage";
import {
  Loader2,
  Upload,
  File,
  Image,
  Music,
  X,
  FolderPlus,
  ChevronLeft,
  Folder,
  Search,
  ArrowUpDown,
  RefreshCcw,
  Plus,
} from "lucide-react";

interface FilePickerProps {
  fileType: FileType;
  onFileSelect: (file: FileObject) => void;
  currentFileUrl?: string;
}

export default function FilePicker({
  fileType,
  onFileSelect,
  currentFileUrl,
}: FilePickerProps) {
  // Dialog states
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Content state
  const [files, setFiles] = useState<FileObject[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [virtualFolders, setVirtualFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"name" | "date" | "size">("name");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentFileUrl,
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  // Combine server folders and virtual folders
  const allFolders = useMemo(() => {
    // Remove duplicates by converting to Set and back to array
    return [...new Set([...folders, ...virtualFolders])];
  }, [folders, virtualFolders]);

  // Filter and sort files based on search query and sort order
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((file) => file.name.toLowerCase().includes(query));
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "size":
          return b.size - a.size;
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, sortOrder]);

  // Update preview URL when currentFileUrl changes
  useEffect(() => {
    setPreviewUrl(currentFileUrl);
  }, [currentFileUrl]);

  // Load data when dialog opens or folder changes
  useEffect(() => {
    if (isOpen) {
      refreshFiles();
    }
  }, [isOpen, currentFolder]);

  // Reset search when changing folders
  useEffect(() => {
    setSearchQuery("");
  }, [currentFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      // Use the dedicated createFolder method from the updated API
      const success = await supabaseStorage.createFolder(newFolderName.trim());

      if (success) {
        // Add to folders list if successful
        setFolders((prev) => [...new Set([...prev, newFolderName.trim()])]);
      } else {
        // If server creation fails, fall back to virtual folders
        setVirtualFolders((prev) => [...prev, newFolderName.trim()]);
      }

      setNewFolderName("");
      setShowFolderInput(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      // Add as virtual folder anyway in case of error
      setVirtualFolders((prev) => [...prev, newFolderName.trim()]);
      setNewFolderName("");
      setShowFolderInput(false);
    }
  };

  // Folder navigation
  const handleFolderSelect = (folder: string) => {
    setCurrentFolder(folder);
  };

  const handleBackToFolders = () => {
    setCurrentFolder("");
  };

  // File upload and management
  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const uploadedFile = await supabaseStorage.uploadFile(
        uploadFile,
        fileType,
        currentFolder || undefined,
      );

      // Add the new file to the current files array
      setFiles((prev) => [uploadedFile, ...prev]);

      onFileSelect(uploadedFile);
      setPreviewUrl(uploadedFile.url);
      setIsUploadModalOpen(false); // Close the upload modal after successful upload
      setUploadFile(null); // Reset the file input
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadFile(file);

      // Generate preview for uploaded file
      if (file) {
        if (fileType === "image") {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else if (fileType === "audio") {
          // For audio files, we'll create a temporary object URL
          const audioUrl = URL.createObjectURL(file);
          setPreviewUrl(audioUrl);
        }
      }
    }
  };

  const handleSelectFile = (file: FileObject) => {
    onFileSelect(file);
    setPreviewUrl(file.url);
    setIsOpen(false);
  };

  // Search and sort functions
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = () => {
    // Cycle through sort options: name -> date -> size -> name
    setSortOrder((current) =>
      current === "name" ? "date" : current === "date" ? "size" : "name",
    );
  };

  const refreshFiles = async () => {
    setIsLoading(true);
    try {
      const files = await supabaseStorage.listFiles(
        fileType,
        currentFolder || undefined,
      );

      // folder is files that doesn't have id
      const folders = files.filter((file) => !file.id);
      const fileList = files.filter((file) => file.id);

      setFolders(folders.map((folder) => folder.name));
      setFiles(fileList);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // UI helper functions
  const getFileIcon = () => {
    if (fileType === "image") return <Image className="h-4 w-4" />;
    if (fileType === "audio") return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case "name":
        return "Name";
      case "date":
        return "Date";
      case "size":
        return "Size";
      default:
        return "Sort";
    }
  };

  const clearSelectedFile = (e: React.MouseEvent) => {
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
  };

  return (
    <div>
      {/* File selection field with browse button */}
      <div className="flex items-center gap-1.5">
        {currentFileUrl ? (
          <div className="flex-1 border border-muted rounded px-2 py-1.5 flex items-center gap-1.5 text-xs truncate">
            {getFileIcon()}
            <span className="truncate">{currentFileUrl.split("/").pop()}</span>
          </div>
        ) : (
          <div className="flex-1 border border-dashed rounded px-2 py-1.5 text-xs text-muted-foreground">
            No {fileType} selected
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs px-3">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[750px] md:max-w-[850px] p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">Select {fileType}</DialogTitle>
            </DialogHeader>

            <div className="min-h-[400px] mt-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Top action bar with navigation, search, and sort */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {currentFolder ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={handleBackToFolders}
                        >
                          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                          Back
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {showFolderInput ? (
                            <div className="flex items-center gap-1">
                              <Input
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) =>
                                  setNewFolderName(e.target.value)
                                }
                                className="text-xs h-7 w-36"
                              />
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={handleCreateFolder}
                              >
                                Create
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setShowFolderInput(false);
                                  setNewFolderName("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex items-center gap-1"
                              onClick={() => setShowFolderInput(true)}
                            >
                              <FolderPlus className="h-3.5 w-3.5" />
                              New Folder
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Search, upload and action buttons */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={handleSearch}
                          className="pl-7 text-xs h-7 w-[120px] md:w-[180px]"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs flex items-center gap-1"
                        onClick={handleSortChange}
                      >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {getSortLabel()}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex items-center gap-1"
                        onClick={() => setIsUploadModalOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Upload
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={refreshFiles}
                        title="Refresh"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Folders grid - only shown in root when there are folders */}
                  {!currentFolder && allFolders.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2">Folders</p>
                      <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                        {allFolders.map((folder) => (
                          <div
                            key={folder}
                            className="border rounded overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                            onClick={() => handleFolderSelect(folder)}
                          >
                            <div className="p-3 flex flex-col items-center justify-center">
                              <Folder className="h-8 w-8 text-muted-foreground/70 mb-1" />
                              <p className="text-xs truncate font-medium text-center">
                                {folder}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files grid with improved layout */}
                  <div>
                    <p className="text-xs font-medium mb-2 flex justify-between items-center">
                      <span>
                        {currentFolder
                          ? `Files in "${currentFolder}"`
                          : "Root Files"}
                      </span>
                      {filteredFiles.length > 0 && (
                        <span className="text-muted-foreground text-[10px]">
                          {filteredFiles.length}{" "}
                          {filteredFiles.length === 1 ? "file" : "files"}
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                      {filteredFiles.length === 0 ? (
                        <div className="col-span-5 text-center py-6 text-xs text-muted-foreground">
                          {searchQuery
                            ? `No ${fileType} files found matching "${searchQuery}"`
                            : `No ${fileType} files found${currentFolder ? ` in ${currentFolder}` : ""}`}
                        </div>
                      ) : (
                        filteredFiles.map((file) => (
                          <div
                            key={file.id}
                            className="border rounded overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                            onClick={() => handleSelectFile(file)}
                          >
                            {fileType === "image" ? (
                              <div className="aspect-video bg-muted/50 overflow-hidden">
                                <img
                                  src={file.url || "/placeholder.svg"}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="aspect-video bg-muted/30 flex items-center justify-center">
                                <Music className="h-8 w-8 text-muted-foreground/70" />
                              </div>
                            )}
                            <div className="p-1.5">
                              <p
                                className="text-xs truncate font-medium"
                                title={file.name}
                              >
                                {file.name}
                              </p>
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] text-muted-foreground">
                                  {Math.round(file.size / 1024)} KB
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(file.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Separate Upload Modal */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="sm:max-w-[450px] p-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">Upload {fileType}</DialogTitle>
            </DialogHeader>

            <div className="p-3 border rounded-md bg-muted/10">
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="file-upload-modal"
                    className="text-sm font-medium block mb-2"
                  >
                    Select a {fileType} to upload{" "}
                    {currentFolder ? `to "${currentFolder}"` : ""}
                  </Label>
                  <Input
                    id="file-upload-modal"
                    type="file"
                    accept={
                      fileType === "image"
                        ? ".jpg,.jpeg,.png,.gif,.webp,image/*"
                        : ".mp3,.wav,.ogg,.m4a,audio/*"
                    }
                    onChange={handleFileChange}
                    className="text-xs h-9 w-full"
                  />
                </div>

                {uploadFile && (
                  <div className="mt-4 py-3 px-4 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      {fileType === "image" && previewUrl ? (
                        <div className="w-16 h-16 rounded bg-muted/50 overflow-hidden flex-shrink-0">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : fileType === "audio" && previewUrl ? (
                        <div className="w-16 h-16 rounded bg-muted/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <Music className="h-8 w-8 text-muted-foreground/70" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {getFileIcon()}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm truncate"
                          title={uploadFile.name}
                        >
                          {uploadFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.size / 1024).toFixed(1)} KB
                        </p>
                        {fileType === "image" && previewUrl && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Preview available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <Button
                    onClick={handleFileUpload}
                    disabled={!uploadFile || isUploading}
                    className="w-full h-9"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {fileType}
                      </>
                    )}
                  </Button>

                  {!uploadFile && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Select a file to upload
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* File preview - image */}
      {fileType === "image" && previewUrl && (
        <div className="mt-2 relative group">
          <div className="border rounded-md overflow-hidden bg-muted/20">
            <img
              src={previewUrl}
              alt="Selected image preview"
              className="w-full object-contain max-h-48"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/70 hover:bg-background shadow-sm opacity-70 group-hover:opacity-100 transition-opacity"
            onClick={clearSelectedFile}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* File preview - audio */}
      {fileType === "audio" && previewUrl && (
        <div className="mt-2 relative group">
          <div className="border rounded-md overflow-hidden bg-muted/20 p-3">
            <audio
              ref={audioRef}
              src={previewUrl}
              controls
              className="w-full h-10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/70 hover:bg-background shadow-sm opacity-70 group-hover:opacity-100 transition-opacity"
            onClick={clearSelectedFile}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
