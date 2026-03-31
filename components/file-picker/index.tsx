"use client";

import { useState, useMemo } from "react";
import { type FileType, type FileObject } from "@testComponents/lib/supabase-storage";
import { Image, Music, File, Loader2 } from "lucide-react";
import { Button } from "@testComponents/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@testComponents/components/ui/dialog";
import { useFilePicker, SORT_CYCLE } from "./use-file-picker";
import { Toolbar, FolderGrid, FileGrid, UploadContent, FilePreview } from "./file-picker-parts";

interface FilePickerProps {
  fileType: FileType;
  onFileSelect: (file: FileObject) => void;
  currentFileUrl?: string;
}

export default function FilePicker({ fileType, onFileSelect, currentFileUrl }: FilePickerProps) {
  const {
    isOpen, setIsOpen,
    isUploadModalOpen, setIsUploadModalOpen,
    currentFolder, setCurrentFolder,
    searchQuery, setSearchQuery,
    sortOrder, setSortOrder,
    isLoading,
    uploadFile,
    isUploading,
    folderInput, setFolderInput,
    previewUrl,
    audioRef,
    folders,
    filteredFiles,
    refreshFiles,
    handleCreateFolder,
    handleFileUpload,
    handleFileChange,
    handleSelectFile,
    handleDeleteFile,
    handleMoveFile,
    clearSelectedFile,
  } = useFilePicker(fileType, onFileSelect, currentFileUrl);

  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const allFolders = useMemo(() => [...new Set(folders)], [folders]);

  const fileIcon = useMemo(() => {
    if (fileType === "image") return <Image className="h-4 w-4" />;
    if (fileType === "audio") return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  }, [fileType]);

  return (
    <div>
      {/* Field + Browse button */}
      <div className="flex items-center gap-1.5">
        {currentFileUrl ? (
          <div className="flex-1 border border-muted rounded px-2 py-1.5 flex items-center gap-1.5 text-xs truncate">
            {fileIcon}
            <span className="truncate">{currentFileUrl.split("/").pop()}</span>
          </div>
        ) : (
          <div className="flex-1 border border-dashed rounded px-2 py-1.5 text-xs text-muted-foreground">
            No {fileType} selected
          </div>
        )}

        {/* Browse Dialog */}
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
                  <Toolbar
                    currentFolder={currentFolder}
                    folderInput={folderInput}
                    searchQuery={searchQuery}
                    sortOrder={sortOrder}
                    onBack={() => setCurrentFolder("")}
                    onShowFolderInput={() => setFolderInput("")}
                    onCancelFolderInput={() => setFolderInput(null)}
                    onFolderNameChange={setFolderInput}
                    onCreateFolder={handleCreateFolder}
                    onSearchChange={setSearchQuery}
                    onSortChange={() => setSortOrder((s) => SORT_CYCLE[s])}
                    onUploadClick={() => setIsUploadModalOpen(true)}
                    onRefresh={refreshFiles}
                  />
                  {!currentFolder && (
                    <FolderGrid folders={allFolders} onSelect={setCurrentFolder} />
                  )}
                  <FileGrid
                    files={filteredFiles}
                    fileType={fileType}
                    currentFolder={currentFolder}
                    searchQuery={searchQuery}
                    hoveredFileId={hoveredFileId}
                    availableFolders={allFolders}
                    onSelect={handleSelectFile}
                    onDelete={handleDeleteFile}
                    onMove={handleMoveFile}
                    onHover={setHoveredFileId}
                  />
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="sm:max-w-[450px] p-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">Upload {fileType}</DialogTitle>
            </DialogHeader>
            <UploadContent
              fileType={fileType}
              currentFolder={currentFolder}
              uploadFile={uploadFile}
              previewUrl={previewUrl}
              isUploading={isUploading}
              onFileChange={handleFileChange}
              onUpload={handleFileUpload}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      {previewUrl && (
        <FilePreview
          fileType={fileType}
          previewUrl={previewUrl}
          audioRef={audioRef}
          onClear={clearSelectedFile}
        />
      )}
    </div>
  );
}
