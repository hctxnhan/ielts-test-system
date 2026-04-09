"use client";

/**
 * StorageManager Component
 *
 * A full-featured Supabase Storage file manager with:
 * - Folder navigation with breadcrumb
 * - Grid / List view toggle
 * - Upload (drag & drop + file picker)
 * - Delete, Move, Copy, Rename, Download
 * - Pagination
 * - Search, Sort, Category filter
 * - Multi-select with bulk actions
 * - Deep configuration via props
 */

import React, { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { type StorageManagerProps } from "../../lib/storage-manager-types";
import { useStorageManager } from "./use-storage-manager";
import {
  Breadcrumb,
  Toolbar,
  FolderGrid,
  FileDisplay,
  PaginationControls,
  UploadPanel,
  CreateFolderDialog,
  DeleteConfirm,
  ErrorBanner,
} from "./storage-manager-parts";

// ─── Error Boundary ─────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class StorageManagerErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[StorageManager] Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: "#ef4444", fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>StorageManager Error</span>
          </div>
          <pre style={{ fontSize: 11, whiteSpace: "pre-wrap", background: "#fef2f2", padding: 8, borderRadius: 4 }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 8, padding: "4px 12px", fontSize: 12, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function StorageManager(props: StorageManagerProps) {
  return (
    <StorageManagerErrorBoundary>
      <StorageManagerInner {...props} />
    </StorageManagerErrorBoundary>
  );
}

function StorageManagerInner(props: StorageManagerProps) {
  const manager = useStorageManager(props);
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const availableFolderNames = manager.folders.map((f) => f.name);

  return (
    <div className="flex flex-col gap-3 p-3 bg-background text-foreground min-h-[400px]">
      {/* Error */}
      {manager.error && (
        <ErrorBanner
          error={manager.error}
          onDismiss={() => manager.refreshFiles()}
        />
      )}

      {/* Breadcrumb */}
      {manager.features.showBreadcrumb && (
        <Breadcrumb
          folderHistory={manager.folderHistory}
          onNavigate={manager.navigateToFolder}
        />
      )}

      {/* Toolbar */}
      <Toolbar
        features={manager.features}
        viewMode={manager.viewMode}
        sort={manager.sort}
        filter={manager.filter}
        isLoading={manager.isLoading}
        selectedCount={manager.selectedFiles.length}
        onViewModeChange={manager.setViewMode}
        onSortChange={manager.setSort}
        onFilterChange={manager.setFilter}
        onRefresh={manager.refreshFiles}
        onUploadClick={() => setShowUpload(true)}
        onCreateFolderClick={() => setShowCreateFolder(true)}
        onDeleteSelected={() => setShowDeleteConfirm(true)}
      />

      {/* Upload Panel */}
      {showUpload && (
        <UploadPanel
          uploadConfig={manager.uploadConfig}
          inputAccept={manager.inputAccept}
          currentFolder={manager.currentFolder}
          isUploading={manager.isUploading}
          onUpload={async (files) => {
            await manager.handleUpload(files);
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Create Folder */}
      {showCreateFolder && (
        <CreateFolderDialog
          onSubmit={manager.handleCreateFolder}
          onClose={() => setShowCreateFolder(false)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirm
          count={manager.selectedFiles.length}
          onConfirm={async () => {
            await manager.handleDelete(manager.selectedFiles);
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Loading */}
      {manager.isLoading ? (
        <div className="flex flex-col gap-3">
          {/* Skeleton folders */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`sf-${i}`} className="flex items-center gap-2 p-2.5 rounded border border-input">
                <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                <div className="h-3 flex-1 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
          {/* Skeleton files */}
          {manager.viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {Array.from({ length: manager.pageSize > 8 ? 8 : manager.pageSize }).map((_, i) => (
                <div key={`s-${i}`} className="rounded border border-input overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <div className="p-2 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: manager.pageSize > 8 ? 8 : manager.pageSize }).map((_, i) => (
                <div key={`sl-${i}`} className="flex items-center gap-3 px-3 py-2">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  <div className="h-3 flex-1 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-12 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Folders */}
          <FolderGrid
            folders={manager.folders}
            features={manager.features}
            allFolderNames={availableFolderNames}
            onNavigate={(name) =>
              manager.navigateToFolder(
                manager.currentFolder
                  ? `${manager.currentFolder}/${name}`
                  : name
              )
            }
            onDelete={manager.handleDeleteFolder}
            onRename={manager.handleRenameFolder}
            onMove={manager.handleMoveFolder}
            onCopy={manager.handleCopyFolder}
          />

          {/* Files */}
          <FileDisplay
            files={manager.files}
            viewMode={manager.viewMode}
            features={manager.features}
            selectedFiles={manager.selectedFiles}
            availableFolders={availableFolderNames}
            onSelect={manager.toggleFileSelection}
            onDelete={(file) => manager.handleDelete([file])}
            onMove={manager.handleMove}
            onCopy={manager.handleCopy}
            onRename={manager.handleRename}
            onDownload={manager.handleDownload}
          />

          {/* Pagination */}
          {manager.paginationConfig.enabled && (
            <PaginationControls
              page={manager.page}
              hasMore={manager.hasMore}
              fileCount={manager.files.length}
              pageSize={manager.pageSize}
              pageSizeOptions={manager.paginationConfig.pageSizeOptions}
              totalFiles={manager.totalFiles}
              totalPages={manager.totalPages}
              isLoading={manager.isLoading}
              onPageChange={manager.setPage}
              onPageSizeChange={manager.setPageSize}
            />
          )}
        </>
      )}

      {/* Save footer — only shows when onSave callback is provided and showSaveButton is true */}
      {manager.hasSaveCallback && manager.features.showSaveButton !== false && manager.selectedFiles.length > 0 && (
        <div className="sticky bottom-0 flex items-center justify-between pt-3 pb-1 border-t border-border bg-background">
          <span className="text-xs text-muted-foreground">
            {manager.selectedFiles.length} file{manager.selectedFiles.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={manager.clearSelection}
              className="h-8 px-3 text-xs border border-input rounded hover:bg-accent"
            >
              Cancel
            </button>
            <button
              onClick={manager.handleSave}
              className="h-8 px-4 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 flex items-center gap-1.5"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StorageManager;
