"use client";

import type React from "react";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@testComponents/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@testComponents/components/ui/dialog";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import {
  type FileType,
  type FileObject,
  supabaseStorage,
} from "@testComponents/lib/supabase-storage";
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
  Trash2,
  Info,
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
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [files, setFiles] = useState<FileObject[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [virtualFolders, setVirtualFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"name" | "date" | "size">("name");

  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentFileUrl);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const allFolders = useMemo(() => {
    return [...new Set([...folders, ...virtualFolders])];
  }, [folders, virtualFolders]);

  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((file) => file.name.toLowerCase().includes(query));
    }
    result.sort((a, b) => {
      switch (sortOrder) {
        case "name": return a.name.localeCompare(b.name);
        case "date": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "size": return b.size - a.size;
        default: return 0;
      }
    });
    return result;
  }, [files, searchQuery, sortOrder]);

  useEffect(() => {
    setPreviewUrl(currentFileUrl);
  }, [currentFileUrl]);

  useEffect(() => {
    if (isOpen) refreshFiles();
  }, [isOpen, currentFolder]);

  useEffect(() => {
    setSearchQuery("");
  }, [currentFolder]);

  const refreshFiles = async () => {
    setIsLoading(true);
    try {
      const result = await supabaseStorage.listFiles(fileType, currentFolder || undefined);
      const folderItems = result.filter((f: FileObject) => !f.id);
      const fileList = result.filter((f: FileObject) => f.id);
      setFolders(folderItems.map((f: FileObject) => f.name));
      setFiles(fileList);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const success = await supabaseStorage.createFolder(newFolderName.trim());
      if (success) {
        setFolders((prev) => [...new Set([...prev, newFolderName.trim()])]);
      } else {
        setVirtualFolders((prev) => [...prev, newFolderName.trim()]);
      }
      setNewFolderName("");
      setShowFolderInput(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      setVirtualFolders((prev) => [...prev, newFolderName.trim()]);
      setNewFolderName("");
      setShowFolderInput(false);
    }
  };

  const handleFolderSelect = (folder: string) => setCurrentFolder(folder);
  const handleBackToFolders = () => setCurrentFolder("");

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const uploadedFile = await supabaseStorage.uploadFile(uploadFile, fileType, currentFolder || undefined);
      setFiles((prev) => [uploadedFile, ...prev]);
      onFileSelect(uploadedFile);
      setPreviewUrl(uploadedFile.url);
      setIsUploadModalOpen(false);
      setUploadFile(null);
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
      if (fileType === "image") {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else if (fileType === "audio") {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSelectFile = (file: FileObject) => {
    onFileSelect(file);
    setPreviewUrl(file.url);
    setIsOpen(false);
  };

  const handleDeleteFile = async (e: React.MouseEvent, file: FileObject) => {
    e.stopPropagation();
    if (!file.path) return;
    if (!confirm(`Delete "${file.name}"?`)) return;
    const success = await supabaseStorage.deleteFile(file.path);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      if (previewUrl === file.url) {
        setPreviewUrl(undefined);
        onFileSelect({ id: "", name: "", url: "", size: 0, createdAt: "", type: fileType });
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleSortChange = () => {
    setSortOrder((current) => current === "name" ? "date" : current === "date" ? "size" : "name");
  };

  const clearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(undefined);
    onFileSelect({ id: "", name: "", url: "", size: 0, createdAt: "", type: fileType });
  };

  const getFileIcon = () => {
    if (fileType === "image") return <Image className="h-4 w-4" />;
    if (fileType === "audio") return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case "name": return "Name";
      case "date": return "Date";
      case "size": return "Size";
      default: return "Sort";
    }
  };

  return (
    <div>
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
            <Button variant="outline" size="sm" className="h-7 text-xs px-3">Browse</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[750px] md:max-w-[850px] p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">Select {fileType}</DialogTitle>
            </DialogHeader>

            <div className="max-h-[500px] mt-3 overflow-y-auto overflow-x-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-3 sticky top-0 bg-background z-10 pb-2">
                    <div className="flex items-center gap-2">
                      {currentFolder ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleBackToFolders}>
                          <ChevronLeft className="h-3.5 w-3.5 mr-1" />Back
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {showFolderInput ? (
                            <div className="flex items-center gap-1">
                              <Input
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                className="text-xs h-7 w-36"
                              />
                              <Button size="sm" className="h-7 text-xs" onClick={handleCreateFolder}>Create</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setShowFolderInput(false); setNewFolderName(""); }}>Cancel</Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1" onClick={() => setShowFolderInput(true)}>
                              <FolderPlus className="h-3.5 w-3.5" />New Folder
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search files..." value={searchQuery} onChange={handleSearch} className="pl-7 text-xs h-7 w-[120px] md:w-[180px]" />
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-1" onClick={handleSortChange}>
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{getSortLabel()}</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1" onClick={() => setIsUploadModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />Upload
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refreshFiles} title="Refresh">
                        <RefreshCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {!currentFolder && allFolders.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2">Folders</p>
                      <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                        {allFolders.map((folder) => (
                          <div key={folder} className="border rounded overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors" onClick={() => handleFolderSelect(folder)}>
                            <div className="p-3 flex flex-col items-center justify-center">
                              <Folder className="h-8 w-8 text-muted-foreground/70 mb-1" />
                              <p className="text-xs truncate font-medium text-center">{folder}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium mb-2 flex justify-between items-center">
                      <span>{currentFolder ? `Files in "${currentFolder}"` : "Root Files"}</span>
                      {filteredFiles.length > 0 && (
                        <span className="text-muted-foreground text-[10px]">{filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}</span>
                      )}
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                      {filteredFiles.length === 0 ? (
                        <div className="col-span-5 text-center py-6 text-xs text-muted-foreground">
                          {searchQuery ? `No ${fileType} files found matching "${searchQuery}"` : `No ${fileType} files found${currentFolder ? ` in ${currentFolder}` : ""}`}
                        </div>
                      ) : (
                        filteredFiles.map((file) => (
                          <div
                            key={file.id}
                            className="border rounded overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors relative"
                            onClick={() => handleSelectFile(file)}
                            onMouseEnter={() => setHoveredFileId(file.id)}
                            onMouseLeave={() => setHoveredFileId(null)}
                          >
                            {fileType === "image" ? (
                              <div className="aspect-video bg-muted/50 overflow-hidden">
                                <img src={file.url || "/placeholder.svg"} alt={file.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="aspect-video bg-muted/30 flex items-center justify-center">
                                <Music className="h-8 w-8 text-muted-foreground/70" />
                              </div>
                            )}
                            <div className="p-1.5">
                              <p className="text-xs truncate font-medium" title={file.name}>{file.name}</p>
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(file.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p>
                              </div>
                            </div>
                            {hoveredFileId === file.id && (
                              <div className="absolute top-1 right-1 flex gap-1">
                                <button
                                  className="bg-black/60 hover:bg-black/80 text-white rounded p-0.5"
                                  title={`Name: ${file.name}\nSize: ${Math.round(file.size / 1024)} KB\nDate: ${new Date(file.createdAt).toLocaleString()}\nPath: ${file.path}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                                <button
                                  className="bg-red-500/80 hover:bg-red-600 text-red-600 rounded p-0.5"
                                  title="Delete file"
                                  onClick={(e) => handleDeleteFile(e, file)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
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

        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="sm:max-w-[450px] p-4" onScroll={() => console.log(111)}>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">Upload {fileType}</DialogTitle>
            </DialogHeader>
            <div className="p-3 border rounded-md bg-muted/10">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload-modal" className="text-sm font-medium block mb-2">
                    Select a {fileType} to upload {currentFolder ? `to "${currentFolder}"` : ""}
                  </Label>
                  <Input
                    id="file-upload-modal"
                    type="file"
                    accept={fileType === "image" ? ".jpg,.jpeg,.png,.gif,.webp,image/*" : ".mp3,.wav,.ogg,.m4a,audio/*"}
                    onChange={handleFileChange}
                    className="text-xs h-9 w-full"
                  />
                </div>
                {uploadFile && (
                  <div className="mt-4 py-3 px-4 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      {fileType === "image" && previewUrl ? (
                        <div className="w-16 h-16 rounded bg-muted/50 overflow-hidden flex-shrink-0">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-muted/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {fileType === "audio" ? <Music className="h-8 w-8 text-muted-foreground/70" /> : getFileIcon()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={uploadFile.name}>{uploadFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="pt-3">
                  <Button onClick={handleFileUpload} disabled={!uploadFile || isUploading} className="w-full h-9">
                    {isUploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" />Upload {fileType}</>
                    )}
                  </Button>
                  {!uploadFile && <p className="text-xs text-muted-foreground text-center mt-2">Select a file to upload</p>}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {fileType === "image" && previewUrl && (
        <div className="mt-2 relative group">
          <div className="border rounded-md overflow-hidden bg-muted/20">
            <img src={previewUrl} alt="Selected image preview" className="w-full object-contain max-h-48" />
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

      {fileType === "audio" && previewUrl && (
        <div className="mt-2 flex items-center gap-2 border rounded-md bg-muted/20 p-2">
          <audio ref={audioRef} src={previewUrl} controls className="flex-1 h-10" />
          <button
            type="button"
            onClick={clearSelectedFile}
            style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "rgb(239,68,68)", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 10, position: "relative" }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
