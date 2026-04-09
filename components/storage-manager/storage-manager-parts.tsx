"use client";

/**
 * StorageManager UI Parts
 *
 * Modular sub-components for the StorageManager:
 * - Toolbar (search, sort, view toggle, actions)
 * - Breadcrumb navigation
 * - FolderGrid
 * - FileGrid / FileList
 * - FileCard / FileRow
 * - Pagination controls
 * - Upload dialog
 * - Action dialogs (move, rename, delete confirm)
 */

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Folder,
  File,
  Image,
  Music,
  Video,
  FileText,
  FileSpreadsheet,
  Archive,
  Code,
  Grid3X3,
  List,
  Search,
  Upload,
  Trash2,
  FolderPlus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Home,
  ChevronRight as ChevronSep,
  MoreVertical,
  Download,
  Copy,
  FolderInput,
  Pencil,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { formatFileSize } from "../../lib/supabase-storage-client";
import {
  type StorageFile,
  type StorageFolder,
  type ViewMode,
  type SortState,
  type SortField,
  type SortDirection,
  type FilterState,
  type FileMimeCategory,
  type FeatureFlags,
  type PaginationConfig,
  type UploadConfig,
  type StorageError,
} from "../../lib/storage-manager-types";


// ─── Icon Helper ────────────────────────────────────────────────────────────

export function FileIcon({
  category,
  className = "h-4 w-4",
}: {
  category: FileMimeCategory;
  className?: string;
}) {
  const icons: Record<FileMimeCategory, React.ReactNode> = {
    image: <Image className={className} />,
    audio: <Music className={className} />,
    video: <Video className={className} />,
    document: <FileText className={className} />,
    spreadsheet: <FileSpreadsheet className={className} />,
    archive: <Archive className={className} />,
    code: <Code className={className} />,
    other: <File className={className} />,
  };
  return <>{icons[category] || icons.other}</>;
}

// ─── Error Banner ───────────────────────────────────────────────────────────

export function ErrorBanner({
  error,
  onDismiss,
}: {
  error: StorageError;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive text-xs rounded border border-destructive/20">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate">{error.message}</span>
      <button onClick={onDismiss} className="shrink-0 hover:opacity-70">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Breadcrumb ─────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  folderHistory: { name: string; path: string }[];
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ folderHistory, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto">
      <button
        onClick={() => onNavigate("")}
        className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Root</span>
      </button>
      {folderHistory.map((item) => (
        <React.Fragment key={item.path}>
          <ChevronSep className="h-3 w-3 shrink-0" />
          <button
            onClick={() => onNavigate(item.path)}
            className="hover:text-foreground transition-colors truncate max-w-[120px]"
            title={item.name}
          >
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}


// ─── Toolbar ────────────────────────────────────────────────────────────────

interface ToolbarProps {
  features: FeatureFlags;
  viewMode: ViewMode;
  sort: SortState;
  filter: FilterState;
  isLoading: boolean;
  selectedCount: number;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortState) => void;
  onFilterChange: (filter: FilterState) => void;
  onRefresh: () => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  onDeleteSelected: () => void;
}

const SORT_OPTIONS: { value: string; label: string; field: SortField; direction: SortDirection }[] = [
  { value: "name-asc", label: "Name A→Z", field: "name", direction: "asc" },
  { value: "name-desc", label: "Name Z→A", field: "name", direction: "desc" },
  { value: "createdAt-desc", label: "Newest first", field: "createdAt", direction: "desc" },
  { value: "createdAt-asc", label: "Oldest first", field: "createdAt", direction: "asc" },
  { value: "size-desc", label: "Largest first", field: "size", direction: "desc" },
  { value: "size-asc", label: "Smallest first", field: "size", direction: "asc" },
  { value: "mimeType-asc", label: "Type A→Z", field: "mimeType", direction: "asc" },
];

export function Toolbar({
  features,
  viewMode,
  sort,
  filter,
  isLoading,
  selectedCount,
  onViewModeChange,
  onSortChange,
  onFilterChange,
  onRefresh,
  onUploadClick,
  onCreateFolderClick,
  onDeleteSelected,
}: ToolbarProps) {
  const currentSortValue = `${sort.field}-${sort.direction}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={filter.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filter, searchQuery: e.target.value })
            }
            className="w-full h-8 pl-7 pr-7 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filter, searchQuery: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={currentSortValue}
          onChange={(e) => {
            const opt = SORT_OPTIONS.find((o) => o.value === e.target.value);
            if (opt) onSortChange({ field: opt.field, direction: opt.direction });
          }}
          className="h-8 px-2 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          title="Sort by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex border border-input rounded overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "h-8 px-2 flex items-center",
              viewMode === "grid" ? "bg-accent" : "hover:bg-accent/50"
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "h-8 px-2 flex items-center",
              viewMode === "list" ? "bg-accent" : "hover:bg-accent/50"
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 px-2 border border-input rounded hover:bg-accent disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
        </button>

        {/* Upload */}
        {features.canUpload && (
          <button
            onClick={onUploadClick}
            className="h-8 px-3 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 flex items-center gap-1"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        )}

        {/* Create Folder */}
        {features.canCreateFolder && (
          <button
            onClick={onCreateFolderClick}
            className="h-8 px-2 border border-input rounded hover:bg-accent"
            title="New folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Bulk delete */}
        {selectedCount > 0 && features.canDelete && (
          <button
            onClick={onDeleteSelected}
            className="h-8 px-2 text-xs bg-destructive text-destructive-foreground rounded hover:opacity-90 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Folder Grid ────────────────────────────────────────────────────────────

interface FolderGridProps {
  folders: StorageFolder[];
  features: FeatureFlags;
  allFolderNames: string[];
  onNavigate: (path: string) => void;
  onDelete: (folderPath: string) => void;
  onRename: (folderPath: string, newName: string) => void;
  onMove: (folderPath: string, toParent: string) => void;
  onCopy: (folderPath: string, toParent: string) => void;
}

const FOLDERS_PER_PAGE = 10;

export function FolderGrid({
  folders,
  features,
  allFolderNames,
  onNavigate,
  onDelete,
  onRename,
  onMove,
  onCopy,
}: FolderGridProps) {
  const [visibleCount, setVisibleCount] = useState(FOLDERS_PER_PAGE);

  // Reset when folders change (navigated to different directory)
  const prevLenRef = useRef(folders.length);
  if (folders.length !== prevLenRef.current) {
    prevLenRef.current = folders.length;
    if (visibleCount !== FOLDERS_PER_PAGE) {
      setVisibleCount(FOLDERS_PER_PAGE);
    }
  }

  if (folders.length === 0) return null;

  const visibleFolders = folders.slice(0, visibleCount);
  const hasMore = visibleCount < folders.length;
  const remaining = folders.length - visibleCount;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          Folders ({folders.length})
        </p>
        {folders.length > FOLDERS_PER_PAGE && (
          <button
            onClick={() =>
              setVisibleCount(
                visibleCount >= folders.length ? FOLDERS_PER_PAGE : folders.length
              )
            }
            className="text-[10px] text-primary hover:text-primary/80 transition-colors"
          >
            {visibleCount >= folders.length ? "Show less" : "Show all"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {visibleFolders.map((folder) => (
          <FolderItem
            key={folder.path}
            folder={folder}
            features={features}
            allFolderNames={allFolderNames}
            onNavigate={onNavigate}
            onDelete={onDelete}
            onRename={onRename}
            onMove={onMove}
            onCopy={onCopy}
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() =>
            setVisibleCount((prev) => Math.min(prev + FOLDERS_PER_PAGE, folders.length))
          }
          className="mt-2 w-full h-8 text-xs text-muted-foreground border border-dashed border-input rounded hover:bg-accent hover:text-foreground hover:border-accent transition-colors flex items-center justify-center gap-1.5"
        >
          <ChevronRight className="h-3 w-3" />
          Show more folders ({remaining} remaining)
        </button>
      )}
    </div>
  );
}

function FolderItem({
  folder,
  features,
  allFolderNames,
  onNavigate,
  onDelete,
  onRename,
  onMove,
  onCopy,
}: {
  folder: StorageFolder;
  features: FeatureFlags;
  allFolderNames: string[];
  onNavigate: (path: string) => void;
  onDelete: (folderPath: string) => void;
  onRename: (folderPath: string, newName: string) => void;
  onMove: (folderPath: string, toParent: string) => void;
  onCopy: (folderPath: string, toParent: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== folder.name) {
      onRename(folder.name, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const otherFolders = allFolderNames.filter((f) => f !== folder.name);

  return (
    <div
      className="relative flex items-center gap-2 p-2.5 rounded border border-input hover:bg-accent hover:border-accent transition-colors text-left group cursor-pointer"
      onClick={() => !isRenaming && onNavigate(folder.name)}
    >
      <Folder className="h-5 w-5 text-primary shrink-0" />
      {isRenaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") setIsRenaming(false);
          }}
          onBlur={handleRenameSubmit}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-xs border border-input rounded px-1 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <span className="text-xs truncate group-hover:text-foreground flex-1">
          {folder.name}
        </span>
      )}

      {/* Context menu trigger */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="h-5 w-5 flex items-center justify-center rounded bg-background/80 border border-input hover:bg-accent"
        >
          <MoreVertical className="h-3 w-3" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
            <div className="absolute right-0 top-6 z-50 w-36 bg-popover border border-border rounded shadow-lg py-1">
              {features.canRename && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                >
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </button>
              )}
              {features.canMove && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMoveMenu(!showMoveMenu); setShowCopyMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    <FolderInput className="h-3.5 w-3.5" /> Move to...
                    <ChevronSep className="h-3 w-3 ml-auto" />
                  </button>
                  {showMoveMenu && (
                    <div className="absolute left-full top-0 ml-1 w-32 bg-popover border border-border rounded shadow-lg py-1 z-50">
                      <button
                        onClick={(e) => { e.stopPropagation(); onMove(folder.name, ""); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        <Home className="h-3 w-3" /> Root
                      </button>
                      {otherFolders.map((f) => (
                        <button
                          key={f}
                          onClick={(e) => { e.stopPropagation(); onMove(folder.name, f); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent truncate"
                        >
                          <Folder className="h-3 w-3" /> {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {features.canCopy && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCopyMenu(!showCopyMenu); setShowMoveMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy to...
                    <ChevronSep className="h-3 w-3 ml-auto" />
                  </button>
                  {showCopyMenu && (
                    <div className="absolute left-full top-0 ml-1 w-32 bg-popover border border-border rounded shadow-lg py-1 z-50">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCopy(folder.name, ""); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
                      >
                        <Home className="h-3 w-3" /> Root
                      </button>
                      {otherFolders.map((f) => (
                        <button
                          key={f}
                          onClick={(e) => { e.stopPropagation(); onCopy(folder.name, f); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent truncate"
                        >
                          <Folder className="h-3 w-3" /> {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {features.canDelete && (
                <>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(folder.name); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── File Card (Grid View) ──────────────────────────────────────────────────

interface FileCardProps {
  file: StorageFile;
  isSelected: boolean;
  features: FeatureFlags;
  availableFolders: string[];
  onSelect: (file: StorageFile, isMulti: boolean) => void;
  onDelete: (file: StorageFile) => void;
  onMove: (file: StorageFile, toFolder: string) => void;
  onCopy: (file: StorageFile, toFolder: string) => void;
  onRename: (file: StorageFile, newName: string) => void;
  onDownload: (file: StorageFile) => void;
}

function FileCard({
  file,
  isSelected,
  features,
  availableFolders,
  onSelect,
  onDelete,
  onMove,
  onCopy,
  onRename,
  onDownload,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(file.name);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== file.name) {
      onRename(file, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const isImage = file.category === "image";

  return (
    <div
      className={cn(
        "relative group rounded border transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-input hover:border-primary/50 hover:shadow-sm"
      )}
      onClick={(e) => onSelect(file, e.metaKey || e.ctrlKey)}
    >
      {/* Thumbnail / Icon */}
      <div className="aspect-square flex items-center justify-center bg-muted/30 rounded-t overflow-hidden">
        {isImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileIcon category={file.category} className="h-10 w-10 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        {isRenaming ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setIsRenaming(false);
              }}
              onBlur={handleRenameSubmit}
              className="flex-1 text-xs border border-input rounded px-1 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        ) : (
          <p className="text-xs font-medium truncate" title={file.name}>
            {file.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          {features.showFileSize && (
            <span className="text-[10px] text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          )}
          {features.showDate && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(file.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Selection checkbox */}
      {features.multiSelect && (
        <div
          className={cn(
            "absolute top-1.5 left-1.5 h-4 w-4 rounded border flex items-center justify-center transition-opacity",
            isSelected
              ? "bg-primary border-primary opacity-100"
              : "border-muted-foreground/40 bg-background opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(file, true);
          }}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      )}

      {/* Context menu trigger */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="h-6 w-6 flex items-center justify-center rounded bg-background/80 border border-input hover:bg-accent"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {showMenu && (
            <ContextMenu
              file={file}
              features={features}
              availableFolders={availableFolders}
              showMoveMenu={showMoveMenu}
              showCopyMenu={showCopyMenu}
              onToggleMoveMenu={() => { setShowMoveMenu(!showMoveMenu); setShowCopyMenu(false); }}
              onToggleCopyMenu={() => { setShowCopyMenu(!showCopyMenu); setShowMoveMenu(false); }}
              onRename={() => { setIsRenaming(true); setShowMenu(false); }}
              onDelete={() => { onDelete(file); setShowMenu(false); }}
              onDownload={() => { onDownload(file); setShowMenu(false); }}
              onMove={(folder) => { onMove(file, folder); setShowMenu(false); }}
              onCopy={(folder) => { onCopy(file, folder); setShowMenu(false); }}
              onClose={() => { setShowMenu(false); setShowMoveMenu(false); setShowCopyMenu(false); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}


// ─── Context Menu ───────────────────────────────────────────────────────────

interface ContextMenuProps {
  file: StorageFile;
  features: FeatureFlags;
  availableFolders: string[];
  showMoveMenu: boolean;
  showCopyMenu: boolean;
  onToggleMoveMenu: () => void;
  onToggleCopyMenu: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onMove: (folder: string) => void;
  onCopy: (folder: string) => void;
  onClose: () => void;
}

function ContextMenu({
  features,
  availableFolders,
  showMoveMenu,
  showCopyMenu,
  onToggleMoveMenu,
  onToggleCopyMenu,
  onRename,
  onDelete,
  onDownload,
  onMove,
  onCopy,
  onClose,
}: ContextMenuProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-7 z-50 w-40 bg-popover border border-border rounded shadow-lg py-1">
        {features.canDownload && (
          <MenuButton icon={<Download className="h-3.5 w-3.5" />} label="Download" onClick={onDownload} />
        )}
        {features.canRename && (
          <MenuButton icon={<Pencil className="h-3.5 w-3.5" />} label="Rename" onClick={onRename} />
        )}
        {features.canMove && (
          <div className="relative">
            <MenuButton
              icon={<FolderInput className="h-3.5 w-3.5" />}
              label="Move to..."
              onClick={onToggleMoveMenu}
              hasSubmenu
            />
            {showMoveMenu && (
              <FolderSubmenu
                folders={availableFolders}
                onSelect={onMove}
                includeRoot
              />
            )}
          </div>
        )}
        {features.canCopy && (
          <div className="relative">
            <MenuButton
              icon={<Copy className="h-3.5 w-3.5" />}
              label="Copy to..."
              onClick={onToggleCopyMenu}
              hasSubmenu
            />
            {showCopyMenu && (
              <FolderSubmenu
                folders={availableFolders}
                onSelect={onCopy}
                includeRoot
              />
            )}
          </div>
        )}
        {features.canDelete && (
          <>
            <div className="border-t border-border my-1" />
            <MenuButton
              icon={<Trash2 className="h-3.5 w-3.5" />}
              label="Delete"
              onClick={onDelete}
              destructive
            />
          </>
        )}
      </div>
    </>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  destructive = false,
  hasSubmenu = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  hasSubmenu?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors",
        destructive && "text-destructive hover:bg-destructive/10"
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {hasSubmenu && <ChevronSep className="h-3 w-3" />}
    </button>
  );
}

function FolderSubmenu({
  folders,
  onSelect,
  includeRoot = false,
}: {
  folders: string[];
  onSelect: (folder: string) => void;
  includeRoot?: boolean;
}) {
  return (
    <div className="absolute left-full top-0 ml-1 w-36 bg-popover border border-border rounded shadow-lg py-1 z-50">
      {includeRoot && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect("");
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
        >
          <Home className="h-3 w-3" />
          Root
        </button>
      )}
      {folders.map((folder) => (
        <button
          key={folder}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(folder);
          }}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent"
        >
          <Folder className="h-3 w-3" />
          <span className="truncate">{folder}</span>
        </button>
      ))}
      {folders.length === 0 && !includeRoot && (
        <p className="px-3 py-1.5 text-xs text-muted-foreground">No folders</p>
      )}
    </div>
  );
}


// ─── File Row (List View) ───────────────────────────────────────────────────

function FileRow({
  file,
  isSelected,
  features,
  availableFolders,
  onSelect,
  onDelete,
  onMove,
  onCopy,
  onRename,
  onDownload,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(file.name);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== file.name) {
      onRename(file, renameValue.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded border transition-all cursor-pointer group",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:bg-accent/50"
      )}
      onClick={(e) => onSelect(file, e.metaKey || e.ctrlKey)}
    >
      {/* Checkbox */}
      {features.multiSelect && (
        <div
          className={cn(
            "h-4 w-4 rounded border flex items-center justify-center shrink-0",
            isSelected
              ? "bg-primary border-primary"
              : "border-muted-foreground/40"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(file, true);
          }}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      )}

      {/* Icon */}
      <FileIcon category={file.category} className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xs border border-input rounded px-1 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        ) : (
          <p className="text-xs truncate" title={file.name}>
            {file.name}
          </p>
        )}
      </div>

      {/* Meta */}
      {features.showFileSize && (
        <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">
          {formatFileSize(file.size)}
        </span>
      )}
      {features.showDate && (
        <span className="text-[10px] text-muted-foreground shrink-0 w-20 text-right hidden sm:block">
          {new Date(file.createdAt).toLocaleDateString()}
        </span>
      )}

      {/* Actions */}
      <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
        {showMenu && (
          <ContextMenu
            file={file}
            features={features}
            availableFolders={availableFolders}
            showMoveMenu={showMoveMenu}
            showCopyMenu={showCopyMenu}
            onToggleMoveMenu={() => { setShowMoveMenu(!showMoveMenu); setShowCopyMenu(false); }}
            onToggleCopyMenu={() => { setShowCopyMenu(!showCopyMenu); setShowMoveMenu(false); }}
            onRename={() => { setIsRenaming(true); setShowMenu(false); }}
            onDelete={() => { onDelete(file); setShowMenu(false); }}
            onDownload={() => { onDownload(file); setShowMenu(false); }}
            onMove={(folder) => { onMove(file, folder); setShowMenu(false); }}
            onCopy={(folder) => { onCopy(file, folder); setShowMenu(false); }}
            onClose={() => { setShowMenu(false); setShowMoveMenu(false); setShowCopyMenu(false); }}
          />
        )}
      </div>
    </div>
  );
}


// ─── File Display (Grid or List) ────────────────────────────────────────────

interface FileDisplayProps {
  files: StorageFile[];
  viewMode: ViewMode;
  features: FeatureFlags;
  selectedFiles: StorageFile[];
  availableFolders: string[];
  onSelect: (file: StorageFile, isMulti: boolean) => void;
  onDelete: (file: StorageFile) => void;
  onMove: (file: StorageFile, toFolder: string) => void;
  onCopy: (file: StorageFile, toFolder: string) => void;
  onRename: (file: StorageFile, newName: string) => void;
  onDownload: (file: StorageFile) => void;
}

export function FileDisplay({
  files,
  viewMode,
  features,
  selectedFiles,
  availableFolders,
  onSelect,
  onDelete,
  onMove,
  onCopy,
  onRename,
  onDownload,
}: FileDisplayProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <File className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">No files found</p>
        <p className="text-xs mt-1">Upload files or change your filters</p>
      </div>
    );
  }

  const isSelected = (file: StorageFile) =>
    selectedFiles.some((s) => s.path === file.path);

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {files.map((file) => (
          <FileCard
            key={file.path}
            file={file}
            isSelected={isSelected(file)}
            features={features}
            availableFolders={availableFolders}
            onSelect={onSelect}
            onDelete={onDelete}
            onMove={onMove}
            onCopy={onCopy}
            onRename={onRename}
            onDownload={onDownload}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {/* List header */}
      <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        {features.multiSelect && <div className="w-4" />}
        <div className="w-4" />
        <div className="flex-1">Name</div>
        {features.showFileSize && <div className="w-16 text-right">Size</div>}
        {features.showDate && <div className="w-20 text-right hidden sm:block">Date</div>}
        <div className="w-6" />
      </div>
      {files.map((file) => (
        <FileRow
          key={file.path}
          file={file}
          isSelected={isSelected(file)}
          features={features}
          availableFolders={availableFolders}
          onSelect={onSelect}
          onDelete={onDelete}
          onMove={onMove}
          onCopy={onCopy}
          onRename={onRename}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}

// ─── Pagination Controls ────────────────────────────────────────────────────

interface PaginationControlsProps {
  page: number;
  hasMore: boolean;
  fileCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalFiles: number | null;
  totalPages: number | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Generate visible page numbers with ellipsis */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export function PaginationControls({
  page,
  hasMore,
  fileCount,
  pageSize,
  pageSizeOptions,
  totalFiles,
  totalPages,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  // Hide if page 1 and no more pages and few items
  if (page <= 1 && !hasMore && fileCount < pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = start + fileCount - 1;

  const pageNumbers = totalPages ? getPageNumbers(page, totalPages) : null;

  return (
    <div className="flex items-center justify-between pt-3 border-t border-border gap-2 flex-wrap">
      {/* Left: item range + total */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {fileCount > 0 ? (
            <>
              {start}–{end}
              {totalFiles !== null ? ` of ${totalFiles}` : hasMore ? "+" : ""}
            </>
          ) : (
            "No items"
          )}
        </span>

        {/* Page size selector */}
        {pageSizeOptions.length > 1 && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-6 px-1 text-[10px] border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            title="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: page navigation */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
          className="h-7 w-7 flex items-center justify-center rounded border border-input hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="h-7 w-7 flex items-center justify-center rounded border border-input hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Page numbers (when totalPages is known) */}
        {pageNumbers ? (
          pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="text-xs px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={cn(
                  "h-7 min-w-[28px] px-1 text-xs rounded border transition-colors",
                  p === page
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-input hover:bg-accent disabled:opacity-30"
                )}
              >
                {p}
              </button>
            )
          )
        ) : (
          <span className="text-xs px-2 min-w-[40px] text-center">
            Page {page}
          </span>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={(!hasMore && (totalPages === null || page >= totalPages)) || isLoading}
          className="h-7 w-7 flex items-center justify-center rounded border border-input hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last page (when known) */}
        {totalPages && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || isLoading}
            className="h-7 w-7 flex items-center justify-center rounded border border-input hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
            title="Last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}


// ─── Upload Panel ───────────────────────────────────────────────────────────

interface UploadPanelProps {
  uploadConfig: UploadConfig;
  inputAccept?: string;
  currentFolder: string;
  isUploading: boolean;
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

export function UploadPanel({
  uploadConfig,
  inputAccept,
  currentFolder,
  isUploading,
  onUpload,
  onClose,
}: UploadPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptStr = useMemo(() => {
    if (inputAccept) return inputAccept;
    if (uploadConfig.allowedMimeTypes.length === 0) return undefined;
    return uploadConfig.allowedMimeTypes.join(",");
  }, [inputAccept, uploadConfig.allowedMimeTypes]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      let arr = Array.from(files);

      // Filter by allowed MIME types (drag & drop bypasses <input accept>)
      if (uploadConfig.allowedMimeTypes.length > 0) {
        arr = arr.filter((file) => {
          const type = file.type || "";
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          return uploadConfig.allowedMimeTypes.some((pattern) => {
            if (pattern.startsWith(".")) {
              return ext === pattern.slice(1).toLowerCase();
            }
            if (pattern.endsWith("/*")) {
              return type.startsWith(pattern.replace("/*", "/"));
            }
            return type === pattern;
          });
        });
      }

      setSelectedFiles(arr.slice(0, uploadConfig.maxFilesPerUpload));
    },
    [uploadConfig.maxFilesPerUpload, uploadConfig.allowedMimeTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  return (
    <div className="border border-border rounded p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">
          Upload to {currentFolder || "root"}
        </h3>
        <button onClick={onClose} className="hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50"
        )}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Max {formatFileSize(uploadConfig.maxFileSize)} per file
          {uploadConfig.maxFilesPerUpload > 1 &&
            ` · Up to ${uploadConfig.maxFilesPerUpload} files`}
        </p>
        {uploadConfig.allowedMimeTypes.length > 0 && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Allowed: {uploadConfig.allowedMimeTypes.join(", ")}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple={uploadConfig.maxFilesPerUpload > 1}
          accept={acceptStr}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-3 space-y-1">
          {selectedFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 text-xs px-2 py-1 bg-muted/50 rounded"
            >
              <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-muted-foreground shrink-0">
                {formatFileSize(file.size)}
              </span>
              <button
                onClick={() =>
                  setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="shrink-0 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onClose}
          className="h-8 px-3 text-xs border border-input rounded hover:bg-accent"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || isUploading}
          className="h-8 px-4 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload ({selectedFiles.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Create Folder Dialog ───────────────────────────────────────────────────

interface CreateFolderDialogProps {
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function CreateFolderDialog({ onSubmit, onClose }: CreateFolderDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <div className="border border-border rounded p-3 bg-card flex items-center gap-2">
      <FolderPlus className="h-4 w-4 text-primary shrink-0" />
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onClose();
        }}
        placeholder="Folder name..."
        className="flex-1 h-7 text-xs border border-input rounded px-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="h-7 px-3 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
      >
        Create
      </button>
      <button
        onClick={onClose}
        className="h-7 px-2 text-xs border border-input rounded hover:bg-accent"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Delete Confirmation ────────────────────────────────────────────────────

interface DeleteConfirmProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ count, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="border border-destructive/30 rounded p-3 bg-destructive/5 flex items-center gap-3">
      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
      <p className="flex-1 text-xs">
        Delete {count} {count === 1 ? "file" : "files"}? This cannot be undone.
      </p>
      <button
        onClick={onCancel}
        className="h-7 px-3 text-xs border border-input rounded hover:bg-accent"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="h-7 px-3 text-xs bg-destructive text-destructive-foreground rounded hover:opacity-90"
      >
        Delete
      </button>
    </div>
  );
}
