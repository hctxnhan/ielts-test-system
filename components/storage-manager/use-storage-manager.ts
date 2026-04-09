"use client";

/**
 * useStorageManager Hook
 *
 * Unified fetch approach: calls `listFoldersAndFiles()` which fetches
 * all items from Supabase, separates folders/files client-side, then
 * paginates files. This avoids the interleaved-offset bug where
 * Supabase returns folders and files mixed by name sort order.
 *
 * Features:
 * - Correct pagination regardless of folder/file interleaving
 * - Total file count for proper page numbers
 * - Next-page prefetching for instant navigation
 * - Dynamic page size selection
 * - Client-side search/filter on current page data
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SupabaseStorageClient } from "../../lib/supabase-storage-client";
import {
  type StorageManagerProps,
  type StorageFile,
  type StorageFolder,
  type StorageError,
  type SortState,
  type FilterState,
  type ViewMode,
  type PaginationConfig,
  type UploadConfig,
  type FeatureFlags,
  DEFAULT_UPLOAD_CONFIG,
  DEFAULT_PAGINATION_CONFIG,
  DEFAULT_FEATURES,
  DEFAULT_SORT,
  DEFAULT_FILTER,
} from "../../lib/storage-manager-types";

/** Map our SortField to Supabase column names */
function toSupabaseSortColumn(field: SortState["field"]): string {
  switch (field) {
    case "name": return "name";
    case "size": return "name";
    case "createdAt": return "created_at";
    case "updatedAt": return "updated_at";
    case "mimeType": return "name";
    default: return "name";
  }
}

export function useStorageManager(props: StorageManagerProps) {
  const {
    supabaseConfig,
    uploadConfig: uploadConfigOverride,
    paginationConfig: paginationConfigOverride,
    features: featuresOverride,
    defaultViewMode = "grid",
    defaultSort = DEFAULT_SORT,
    defaultFilterCategories,
    initialSelectedUrls,
    inputAccept,
    onFileSelect,
    onFilesSelect,
    onUploadComplete,
    onFileDelete,
    onFileMove,
    onFileCopy,
    onFileRename,
    onFolderCreate,
    onFolderChange,
    onSave,
    onError,
  } = props;

  // ─── Stable callback refs (prevent Retool re-render loops) ─────────

  const callbackRefs = useRef({
    onFileSelect, onFilesSelect, onUploadComplete, onFileDelete,
    onFileMove, onFileCopy, onFileRename, onFolderCreate,
    onFolderChange, onSave, onError,
  });
  callbackRefs.current = {
    onFileSelect, onFilesSelect, onUploadComplete, onFileDelete,
    onFileMove, onFileCopy, onFileRename, onFolderCreate,
    onFolderChange, onSave, onError,
  };

  // ─── Merged configs ────────────────────────────────────────────────────

  const uploadConfig: UploadConfig = useMemo(
    () => ({ ...DEFAULT_UPLOAD_CONFIG, ...uploadConfigOverride }),
    [uploadConfigOverride]
  );

  const paginationConfig: PaginationConfig = useMemo(
    () => ({ ...DEFAULT_PAGINATION_CONFIG, ...paginationConfigOverride }),
    [paginationConfigOverride]
  );

  const features: FeatureFlags = useMemo(
    () => ({ ...DEFAULT_FEATURES, ...featuresOverride }),
    [featuresOverride]
  );

  // ─── Storage client (stable ref) ───────────────────────────────────────

  const configKey = `${supabaseConfig.supabaseUrl}|${supabaseConfig.supabaseAnonKey}|${supabaseConfig.bucketName}|${supabaseConfig.rootFolder}`;
  const configKeyRef = useRef(configKey);
  const clientRef = useRef<SupabaseStorageClient | null>(null);

  if (!clientRef.current || configKeyRef.current !== configKey) {
    configKeyRef.current = configKey;
    clientRef.current = new SupabaseStorageClient(supabaseConfig, uploadConfig);
  }
  const client = clientRef.current;

  // ─── State ────────────────────────────────────────────────────────────

  const [files, setFiles] = useState<StorageFile[]>([]);
  const [folders, setFolders] = useState<StorageFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<StorageFile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [sort, setSort] = useState<SortState>(defaultSort);
  const [filter, setFilter] = useState<FilterState>({
    ...DEFAULT_FILTER,
    categories: defaultFilterCategories || [],
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(
    paginationConfig.enabled ? paginationConfig.pageSize : 100
  );
  const [hasMore, setHasMore] = useState(false);
  const [totalFiles, setTotalFiles] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<StorageError | null>(null);

  // ─── Derived values ───────────────────────────────────────────────────

  const totalPages = useMemo(() => {
    if (totalFiles === null) return null;
    return Math.max(1, Math.ceil(totalFiles / pageSize));
  }, [totalFiles, pageSize]);

  const folderHistory = useMemo(() => {
    if (!currentFolder) return [];
    const parts = currentFolder.split("/").filter(Boolean);
    return parts.map((name, i) => ({
      name,
      path: parts.slice(0, i + 1).join("/"),
    }));
  }, [currentFolder]);

  // ─── Client-side filter on current page data ──────────────────────────

  const displayFiles = useMemo(() => {
    let result = [...files];
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (filter.categories.length > 0) {
      result = result.filter((f) => filter.categories.includes(f.category));
    }
    if (filter.mimeTypes.length > 0) {
      result = result.filter((f) => filter.mimeTypes.includes(f.mimeType));
    }
    if (filter.minSize !== null) {
      result = result.filter((f) => f.size >= filter.minSize!);
    }
    if (filter.maxSize !== null) {
      result = result.filter((f) => f.size <= filter.maxSize!);
    }
    return result;
  }, [files, filter]);

  // ─── Unified fetch (folders + files in one pass) ──────────────────────

  const fetchPage = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const fileOffset = (targetPage - 1) * pageSize;

        const result = await client.listFoldersAndFiles(currentFolder, {
          fileOffset,
          fileLimit: pageSize,
          sortBy: {
            column: toSupabaseSortColumn(sort.field),
            order: sort.direction,
          },
        });

        if (result.error) {
          setError(result.error);
          callbackRefs.current.onError?.(result.error);
          return;
        }

        setFolders(result.folders);
        setFiles(result.files);
        setHasMore(result.hasMore);

        // Set total if we got an exact count (exhausted = true → totalFiles >= 0)
        if (result.totalFiles >= 0) {
          setTotalFiles(result.totalFiles);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [client, currentFolder, pageSize, sort]
  );

  // Refetch when page changes
  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  // Reset on folder/sort/pageSize change
  useEffect(() => {
    setPage(1);
    setSelectedFiles([]);
    setTotalFiles(null);
  }, [currentFolder, sort.field, sort.direction, pageSize]);

  const refreshFiles = useCallback(() => {
    setTotalFiles(null);
    return fetchPage(page);
  }, [fetchPage, page]);

  // ─── Page size change handler ─────────────────────────────────────────

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSizeState(newSize);
  }, []);

  // ─── Auto-select files matching initialSelectedUrls ───────────────────

  const initialUrlsApplied = useRef(false);

  useEffect(() => {
    if (
      !initialUrlsApplied.current &&
      initialSelectedUrls &&
      initialSelectedUrls.length > 0 &&
      files.length > 0
    ) {
      const urlSet = new Set(initialSelectedUrls);
      const matched = files.filter((f) => urlSet.has(f.url) || urlSet.has(f.path));
      if (matched.length > 0) {
        setSelectedFiles(matched);
        initialUrlsApplied.current = true;
      }
    }
  }, [files, initialSelectedUrls]);

  // ─── Navigation ───────────────────────────────────────────────────────

  const navigateToFolder = useCallback(
    (folderPath: string) => {
      setCurrentFolder(folderPath);
      setPage(1);
      setSelectedFiles([]);
      callbackRefs.current.onFolderChange?.(folderPath);
    },
    []
  );

  const navigateUp = useCallback(() => {
    if (!currentFolder) return;
    const parts = currentFolder.split("/").filter(Boolean);
    parts.pop();
    navigateToFolder(parts.join("/"));
  }, [currentFolder, navigateToFolder]);

  // ─── Selection ────────────────────────────────────────────────────────

  const toggleFileSelection = useCallback(
    (file: StorageFile, isMulti = false) => {
      setSelectedFiles((prev) => {
        if (!features.multiSelect || !isMulti) {
          const isAlreadySelected = prev.some((f) => f.path === file.path);
          const next = isAlreadySelected ? [] : [file];
          if (next.length === 1) callbackRefs.current.onFileSelect?.(next[0]);
          callbackRefs.current.onFilesSelect?.(next);
          return next;
        }
        const exists = prev.find((f) => f.path === file.path);
        const next = exists
          ? prev.filter((f) => f.path !== file.path)
          : [...prev, file];
        callbackRefs.current.onFilesSelect?.(next);
        if (next.length === 1) callbackRefs.current.onFileSelect?.(next[0]);
        return next;
      });
    },
    [features.multiSelect]
  );

  const selectAll = useCallback(() => {
    setSelectedFiles(displayFiles);
    callbackRefs.current.onFilesSelect?.(displayFiles);
  }, [displayFiles]);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
    callbackRefs.current.onFilesSelect?.([]);
  }, []);

  // ─── Upload ───────────────────────────────────────────────────────────

  const handleUpload = useCallback(
    async (uploadFiles: File[]) => {
      setIsUploading(true);
      setError(null);
      try {
        // Client-side filter: reject files that don't match allowedMimeTypes
        let filesToUpload = uploadFiles;
        if (uploadConfig.allowedMimeTypes.length > 0) {
          filesToUpload = uploadFiles.filter((file) => {
            const type = file.type || "";
            const ext = file.name.split(".").pop()?.toLowerCase() || "";
            return uploadConfig.allowedMimeTypes.some((pattern) => {
              if (pattern.startsWith(".")) return ext === pattern.slice(1).toLowerCase();
              if (pattern.endsWith("/*")) return type.startsWith(pattern.replace("/*", "/"));
              return type === pattern;
            });
          });
          if (filesToUpload.length === 0 && uploadFiles.length > 0) {
            const err: StorageError = {
              code: "INVALID_MIME_TYPE",
              message: `Only ${uploadConfig.allowedMimeTypes.filter(p => p.endsWith("/*")).join(", ")} files are allowed`,
            };
            setError(err);
            callbackRefs.current.onError?.(err);
            return { uploaded: [], errors: [err] };
          }
        }

        const result = await client.uploadFiles(filesToUpload, currentFolder);
        if (result.errors.length > 0) {
          setError(result.errors[0]);
          callbackRefs.current.onError?.(result.errors[0]);
        }
        if (result.uploaded.length > 0) {
          callbackRefs.current.onUploadComplete?.(result.uploaded);
          setTotalFiles(null);
          await fetchPage(page);
        }
        return result;
      } finally {
        setIsUploading(false);
      }
    },
    [client, currentFolder, fetchPage, page]
  );

  // ─── Delete ───────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    async (filesToDelete: StorageFile[]) => {
      setError(null);
      const paths = filesToDelete.map((f) => f.path);
      const result = await client.deleteFiles(paths);
      if (result.errors.length > 0) {
        setError(result.errors[0]);
        callbackRefs.current.onError?.(result.errors[0]);
      } else {
        filesToDelete.forEach((f) => callbackRefs.current.onFileDelete?.(f));
        setSelectedFiles((prev) =>
          prev.filter((s) => !paths.includes(s.path))
        );
        setTotalFiles(null);
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Move ─────────────────────────────────────────────────────────────

  const handleMove = useCallback(
    async (file: StorageFile, toFolder: string) => {
      setError(null);
      const fromPath = file.path;
      const result = await client.moveFile(file.path, toFolder);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        callbackRefs.current.onFileMove?.(file, fromPath, result.newPath!);
        setTotalFiles(null);
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Copy ─────────────────────────────────────────────────────────────

  const handleCopy = useCallback(
    async (file: StorageFile, toFolder: string) => {
      setError(null);
      const result = await client.copyFile(file.path, toFolder);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        callbackRefs.current.onFileCopy?.(file, result.newPath!);
      }
      return result;
    },
    [client]
  );

  // ─── Rename ───────────────────────────────────────────────────────────

  const handleRename = useCallback(
    async (file: StorageFile, newName: string) => {
      setError(null);
      const oldName = file.name;
      const result = await client.renameFile(file.path, newName);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        callbackRefs.current.onFileRename?.(file, oldName);
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Create Folder ────────────────────────────────────────────────────

  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      setError(null);
      const fullPath = currentFolder
        ? `${currentFolder}/${folderName}`
        : folderName;
      const result = await client.createFolder(fullPath);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else if (result.folder) {
        callbackRefs.current.onFolderCreate?.(result.folder);
        await fetchPage(page);
      }
      return result;
    },
    [client, currentFolder, fetchPage, page]
  );

  // ─── Folder Delete ────────────────────────────────────────────────────

  const handleDeleteFolder = useCallback(
    async (folderPath: string) => {
      setError(null);
      const result = await client.deleteFolder(folderPath);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Folder Rename ────────────────────────────────────────────────────

  const handleRenameFolder = useCallback(
    async (folderPath: string, newName: string) => {
      setError(null);
      const result = await client.renameFolder(folderPath, newName);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Folder Move ──────────────────────────────────────────────────────

  const handleMoveFolder = useCallback(
    async (folderPath: string, toParent: string) => {
      setError(null);
      const result = await client.moveFolder(folderPath, toParent);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Folder Copy ──────────────────────────────────────────────────────

  const handleCopyFolder = useCallback(
    async (folderPath: string, toParent: string) => {
      setError(null);
      const result = await client.copyFolder(folderPath, toParent);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
      } else {
        await fetchPage(page);
      }
      return result;
    },
    [client, fetchPage, page]
  );

  // ─── Download ─────────────────────────────────────────────────────────

  const handleDownload = useCallback(
    async (file: StorageFile) => {
      const result = await client.downloadFile(file.path);
      if (result.error) {
        setError(result.error);
        callbackRefs.current.onError?.(result.error);
        return;
      }
      if (result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    [client]
  );

  // ─── Save ─────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    callbackRefs.current.onSave?.(selectedFiles);
  }, [selectedFiles]);

  // ─── Return ───────────────────────────────────────────────────────────

  return {
    features,
    uploadConfig,
    paginationConfig,
    inputAccept,
    hasSaveCallback: !!callbackRefs.current.onSave,

    files: displayFiles,
    folders,
    currentFolder,
    folderHistory,
    selectedFiles,
    viewMode,
    sort,
    filter,
    isLoading,
    isUploading,
    error,

    page,
    hasMore,
    pageSize,
    totalFiles,
    totalPages,
    setPage,
    setPageSize: handlePageSizeChange,

    setViewMode,
    setSort,
    setFilter,
    refreshFiles,
    navigateToFolder,
    navigateUp,
    toggleFileSelection,
    selectAll,
    clearSelection,
    handleUpload,
    handleDelete,
    handleMove,
    handleCopy,
    handleRename,
    handleCreateFolder,
    handleDeleteFolder,
    handleRenameFolder,
    handleMoveFolder,
    handleCopyFolder,
    handleDownload,
    handleSave,
  };
}

export type UseStorageManagerReturn = ReturnType<typeof useStorageManager>;
