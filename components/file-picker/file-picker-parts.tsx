"use client";

import { useState } from "react";
import { Button } from "@testComponents/components/ui/button";
import { Input } from "@testComponents/components/ui/input";
import { Label } from "@testComponents/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@testComponents/components/ui/dropdown-menu";
import { type FileObject, type FileType } from "@testComponents/lib/supabase-storage";
import {
  ArrowUpDown, ChevronLeft, Folder, FolderInput, FolderPlus,
  Info, Loader2, MoreVertical, Music, Plus, RefreshCcw,
  Search, Trash2, Upload, X, Copy,
} from "lucide-react";
import type React from "react";
import { SORT_LABELS } from "./use-file-picker";

// ─── Toolbar ────────────────────────────────────────────────────────────────

interface ToolbarProps {
  currentFolder: string;
  folderInput: string | null;
  searchQuery: string;
  sortOrder: "name" | "date" | "size";
  onBack: () => void;
  onShowFolderInput: () => void;
  onCancelFolderInput: () => void;
  onFolderNameChange: (v: string) => void;
  onCreateFolder: () => void;
  onSearchChange: (v: string) => void;
  onSortChange: () => void;
  onUploadClick: () => void;
  onRefresh: () => void;
}

export function Toolbar({
  currentFolder, folderInput, searchQuery, sortOrder,
  onBack, onShowFolderInput, onCancelFolderInput, onFolderNameChange,
  onCreateFolder, onSearchChange, onSortChange, onUploadClick, onRefresh,
}: ToolbarProps) {
  return (
    <div className="flex justify-between items-center mb-3 sticky top-0 bg-background z-10 pb-2">
      <div className="flex items-center gap-2">
        {currentFolder ? (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onBack}>
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />Back
          </Button>
        ) : folderInput !== null ? (
          <div className="flex items-center gap-1">
            <Input
              placeholder="Folder name"
              value={folderInput}
              onChange={(e) => onFolderNameChange(e.target.value)}
              className="text-xs h-7 w-36"
            />
            <Button size="sm" className="h-7 text-xs" onClick={onCreateFolder}>Create</Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancelFolderInput}>Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1" onClick={onShowFolderInput}>
            <FolderPlus className="h-3.5 w-3.5" />New Folder
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-7 text-xs h-7 w-[120px] md:w-[180px]"
          />
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-1" onClick={onSortChange}>
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{SORT_LABELS[sortOrder]}</span>
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1" onClick={onUploadClick}>
          <Plus className="h-3.5 w-3.5" />Upload
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRefresh} title="Refresh">
          <RefreshCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Folder Grid ─────────────────────────────────────────────────────────────

interface FolderGridProps {
  folders: string[];
  onSelect: (folder: string) => void;
}

export function FolderGrid({ folders, onSelect }: FolderGridProps) {
  if (folders.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-medium mb-2">Folders</p>
      <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
        {folders.map((folder) => (
          <div
            key={folder}
            className="border rounded overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            onClick={() => onSelect(folder)}
          >
            <div className="p-3 flex flex-col items-center justify-center">
              <Folder className="h-8 w-8 text-muted-foreground/70 mb-1" />
              <p className="text-xs truncate font-medium text-center">{folder}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── File Card ───────────────────────────────────────────────────────────────

interface FileCardProps {
  file: FileObject;
  fileType: FileType;
  availableFolders: string[];
  onSelect: (file: FileObject) => void;
  onDelete: (e: React.MouseEvent, file: FileObject) => void;
  onMove: (file: FileObject, targetFolder: string) => void;
  onCopy: (file: FileObject, targetFolder: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export function FileCard({ file, fileType, availableFolders, onSelect, onDelete, onMove, onCopy, onMouseEnter, onMouseLeave }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const stopAndRun = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();
    fn();
  };

  const showMenu = isHovered || menuOpen;

  return (
    <div
      className="border rounded overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors relative"
      onClick={() => onSelect(file)}
      onMouseEnter={() => { setIsHovered(true); onMouseEnter(file.id); }}
      onMouseLeave={() => { setIsHovered(false); onMouseLeave(); }}
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
          <p className="text-[10px] text-muted-foreground">
            {new Date(file.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* 3-dot menu */}
      <div className="absolute top-1 right-1" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="h-6 w-6 rounded flex items-center justify-center bg-black/60 hover:bg-black/80 text-black transition-opacity"
              style={{ opacity: showMenu ? 1 : 0, pointerEvents: showMenu ? "auto" : "none" }}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            {/* Info */}
            <DropdownMenuItem
              className="gap-2 text-xs cursor-default focus:bg-muted"
              onSelect={(e) => e.preventDefault()}
            >
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">{file.name}</span>
                <span className="text-muted-foreground">{Math.round(file.size / 1024)} KB · {new Date(file.createdAt).toLocaleDateString()}</span>
                {file.path && <span className="text-muted-foreground truncate text-[10px]">{file.path}</span>}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Move to folder */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-xs cursor-pointer">
                <FolderInput className="h-3.5 w-3.5 text-amber-500 cursor-pointer" />
                Move to folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {/* Root option */}
                <DropdownMenuItem
                  className="gap-2 text-xs"
                  onSelect={(e) => stopAndRun(e as unknown as React.MouseEvent, () => onMove(file, ""))}
                >
                  <Folder className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                  Root (no folder)
                </DropdownMenuItem>
                {availableFolders.length > 0 && <DropdownMenuSeparator />}
                {availableFolders.map((folder) => (
                  <DropdownMenuItem
                    key={folder}
                    className="gap-2 text-xs"
                    onSelect={(e) => stopAndRun(e as unknown as React.MouseEvent, () => onMove(file, folder))}
                  >
                    <Folder className="h-3.5 w-3.5 text-amber-400" />
                    {folder}
                  </DropdownMenuItem>
                ))}
                {availableFolders.length === 0 && (
                  <div className="px-2 py-1.5 text-[10px] text-muted-foreground">No other folders</div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuSeparator />

            {/* Copy to folder */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-xs cursor-pointer">
                <Copy className="h-3.5 w-3.5 text-blue-500" />
                Copy to folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onSelect={() => onCopy(file, "")}>
                  <Folder className="h-3.5 w-3.5 text-muted-foreground" />Root (no folder)
                </DropdownMenuItem>
                {availableFolders.length > 0 && <DropdownMenuSeparator />}
                {availableFolders.map((folder) => (
                  <DropdownMenuItem key={folder} className="gap-2 text-xs cursor-pointer" onSelect={() => onCopy(file, folder)}>
                    <Folder className="h-3.5 w-3.5 text-amber-400" />{folder}
                  </DropdownMenuItem>
                ))}
                {availableFolders.length === 0 && (
                  <div className="px-2 py-1.5 text-[10px] text-muted-foreground">No other folders</div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Delete */}
            <DropdownMenuItem
              className="gap-2 text-xs text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer"
              onSelect={(e) => stopAndRun(e as unknown as React.MouseEvent, () => onDelete(e as unknown as React.MouseEvent, file))}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── File Grid ───────────────────────────────────────────────────────────────

interface FileGridProps {
  files: FileObject[];
  fileType: FileType;
  currentFolder: string;
  searchQuery: string;
  hoveredFileId: string | null;
  availableFolders: string[];
  onSelect: (file: FileObject) => void;
  onDelete: (e: React.MouseEvent, file: FileObject) => void;
  onMove: (file: FileObject, targetFolder: string) => void;
  onCopy: (file: FileObject, targetFolder: string) => void;
  onHover: (id: string | null) => void;
}

export function FileGrid({ files, fileType, currentFolder, searchQuery, hoveredFileId, availableFolders, onSelect, onDelete, onMove, onCopy, onHover }: FileGridProps) {
  return (
    <div>
      <p className="text-xs font-medium mb-2 flex justify-between items-center">
        <span>{currentFolder ? `Files in "${currentFolder}"` : "Root Files"}</span>
        {files.length > 0 && (
          <span className="text-muted-foreground text-[10px]">{files.length} {files.length === 1 ? "file" : "files"}</span>
        )}
      </p>
      <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
        {files.length === 0 ? (
          <div className="col-span-5 text-center py-6 text-xs text-muted-foreground">
            {searchQuery
              ? `No ${fileType} files found matching "${searchQuery}"`
              : `No ${fileType} files found${currentFolder ? ` in ${currentFolder}` : ""}`}
          </div>
        ) : files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            fileType={fileType}
            availableFolders={availableFolders.filter((f) => f !== currentFolder)}
            onSelect={onSelect}
            onDelete={onDelete}
            onMove={onMove}
            onCopy={onCopy}
            onMouseEnter={(id) => onHover(id)}
            onMouseLeave={() => onHover(null)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Upload Modal Content ────────────────────────────────────────────────────

interface UploadContentProps {
  fileType: FileType;
  currentFolder: string;
  uploadFile: File | null;
  previewUrl?: string;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export function UploadContent({ fileType, currentFolder, uploadFile, previewUrl, isUploading, onFileChange, onUpload }: UploadContentProps) {
  return (
    <div className="p-3 border rounded-md bg-muted/10 space-y-3">
      <div>
        <Label htmlFor="file-upload-modal" className="text-sm font-medium block mb-2">
          Select a {fileType} to upload{currentFolder ? ` to "${currentFolder}"` : ""}
        </Label>
        <Input
          id="file-upload-modal"
          type="file"
          accept={fileType === "image" ? ".jpg,.jpeg,.png,.gif,.webp,image/*" : ".mp3,.wav,.ogg,.m4a,audio/*"}
          onChange={onFileChange}
          className="text-xs h-9 w-full"
        />
      </div>
      {uploadFile && (
        <div className="py-3 px-4 border rounded-md bg-muted/20 flex items-center gap-3">
          <div className="w-16 h-16 rounded bg-muted/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {fileType === "image" && previewUrl
              ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              : <Music className="h-8 w-8 text-muted-foreground/70" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" title={uploadFile.name}>{uploadFile.name}</p>
            <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}
      <div className="pt-1">
        <Button onClick={onUpload} disabled={!uploadFile || isUploading} className="w-full h-9">
          {isUploading
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
            : <><Upload className="mr-2 h-4 w-4" />Upload {fileType}</>}
        </Button>
        {!uploadFile && <p className="text-xs text-muted-foreground text-center mt-2">Select a file to upload</p>}
      </div>
    </div>
  );
}

// ─── Preview ─────────────────────────────────────────────────────────────────

interface PreviewProps {
  fileType: FileType;
  previewUrl: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onClear: (e: React.MouseEvent) => void;
}

export function FilePreview({ fileType, previewUrl, audioRef, onClear }: PreviewProps) {
  if (fileType === "image") {
    return (
      <div className="mt-2 relative group">
        <div className="border rounded-md overflow-hidden bg-muted/20">
          <img src={previewUrl} alt="Selected image preview" className="w-full object-contain max-h-48" />
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
        style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", background: "rgb(239,68,68)", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 10, position: "relative" }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
