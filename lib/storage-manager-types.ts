/**
 * Storage Manager Types
 *
 * Comprehensive type definitions for the Supabase Storage Manager component.
 * Supports deep configuration for both Retool and Supabase integration.
 */

// ─── Core File & Folder Types ───────────────────────────────────────────────

/** MIME type category for filtering */
export type FileMimeCategory =
  | "image"
  | "audio"
  | "video"
  | "document"
  | "spreadsheet"
  | "archive"
  | "code"
  | "other";

/** Represents a file object from Supabase Storage */
export interface StorageFile {
  /** Unique identifier (Supabase file id) */
  id: string;
  /** Display name (without type prefix) */
  name: string;
  /** Full storage path including folder */
  path: string;
  /** Public URL */
  url: string;
  /** MIME type string (e.g. "image/png") */
  mimeType: string;
  /** MIME category for filtering */
  category: FileMimeCategory;
  /** File size in bytes */
  size: number;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last modification */
  updatedAt: string;
  /** Parent folder path (empty string for root) */
  folder: string;
  /** Custom metadata from Supabase */
  metadata: Record<string, unknown>;
}

/** Represents a folder in the storage */
export interface StorageFolder {
  /** Folder name */
  name: string;
  /** Full path */
  path: string;
  /** Number of items inside (files + subfolders) */
  itemCount: number;
  /** ISO timestamp of creation */
  createdAt: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginationState {
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total items matching current filters */
  totalItems: number;
  /** Total pages */
  totalPages: number;
}

export interface PaginationConfig {
  /** Enable/disable pagination. Default: true */
  enabled: boolean;
  /** Items per page. Default: 20 */
  pageSize: number;
  /** Available page size options. Default: [10, 20, 50, 100] */
  pageSizeOptions: number[];
  /** Enable prefetching next page for smoother navigation. Default: true */
  prefetchNext: boolean;
}


// ─── Sort & Filter ──────────────────────────────────────────────────────────

export type SortField = "name" | "size" | "createdAt" | "updatedAt" | "mimeType";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface FilterState {
  /** Text search on file name */
  searchQuery: string;
  /** Filter by MIME categories */
  categories: FileMimeCategory[];
  /** Filter by specific MIME types (e.g. ["image/png", "audio/mp3"]) */
  mimeTypes: string[];
  /** Min file size in bytes */
  minSize: number | null;
  /** Max file size in bytes */
  maxSize: number | null;
}

// ─── View Mode ──────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "list";

// ─── Upload Configuration ───────────────────────────────────────────────────

export interface UploadConfig {
  /** Allowed MIME types. Empty = all allowed. e.g. ["image/*", "audio/mp3"] */
  allowedMimeTypes: string[];
  /** Max file size in bytes. Default: 50MB (52428800) */
  maxFileSize: number;
  /** Max number of files per upload batch. Default: 10 */
  maxFilesPerUpload: number;
  /** Whether to auto-generate unique filenames. Default: true */
  autoUniqueNames: boolean;
  /** Cache control header value. Default: "3600" */
  cacheControl: string;
  /** Whether to upsert (overwrite) existing files. Default: false */
  upsert: boolean;
}

// ─── Supabase Configuration ─────────────────────────────────────────────────

export interface SupabaseStorageConfig {
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anon key */
  supabaseAnonKey: string;
  /** Storage bucket name */
  bucketName: string;
  /** Whether the bucket is public. Default: true */
  isPublicBucket: boolean;
  /** Root folder path to scope the manager to. Default: "" (bucket root) */
  rootFolder: string;
}

// ─── Feature Flags ──────────────────────────────────────────────────────────

export interface FeatureFlags {
  /** Allow creating folders. Default: true */
  canCreateFolder: boolean;
  /** Allow uploading files. Default: true */
  canUpload: boolean;
  /** Allow deleting files. Default: true */
  canDelete: boolean;
  /** Allow moving files between folders. Default: true */
  canMove: boolean;
  /** Allow copying files. Default: true */
  canCopy: boolean;
  /** Allow renaming files. Default: true */
  canRename: boolean;
  /** Allow downloading files. Default: true */
  canDownload: boolean;
  /** Show the built-in Save/Cancel footer. Default: true */
  showSaveButton: boolean;
  /** Show file preview panel. Default: true */
  showPreview: boolean;
  /** Allow multi-select. Default: true */
  multiSelect: boolean;
  /** Show breadcrumb navigation. Default: true */
  showBreadcrumb: boolean;
  /** Show file size info. Default: true */
  showFileSize: boolean;
  /** Show date info. Default: true */
  showDate: boolean;
}

// ─── Component Props ────────────────────────────────────────────────────────

export interface StorageManagerProps {
  /** Supabase connection config */
  supabaseConfig: SupabaseStorageConfig;
  /** Upload restrictions */
  uploadConfig?: Partial<UploadConfig>;
  /** Pagination settings */
  paginationConfig?: Partial<PaginationConfig>;
  /** Feature toggles */
  features?: Partial<FeatureFlags>;
  /** Initial view mode */
  defaultViewMode?: ViewMode;
  /** Initial sort */
  defaultSort?: SortState;
  /** Initial filter categories */
  defaultFilterCategories?: FileMimeCategory[];
  /** Pre-selected files (URLs or paths) to highlight on load */
  initialSelectedUrls?: string[];
  /** Override the native file input accept attribute (e.g. "audio/*,.mp3,.wav") */
  inputAccept?: string;

  // ─── Callbacks (Retool event bridge) ────────────────────────────────────

  /** Fired when a file is selected */
  onFileSelect?: (file: StorageFile) => void;
  /** Fired when multiple files are selected */
  onFilesSelect?: (files: StorageFile[]) => void;
  /** Fired after a successful upload */
  onUploadComplete?: (files: StorageFile[]) => void;
  /** Fired after a file is deleted */
  onFileDelete?: (file: StorageFile) => void;
  /** Fired after a file is moved */
  onFileMove?: (file: StorageFile, fromPath: string, toPath: string) => void;
  /** Fired after a file is copied */
  onFileCopy?: (file: StorageFile, toPath: string) => void;
  /** Fired after a file is renamed */
  onFileRename?: (file: StorageFile, oldName: string) => void;
  /** Fired after a folder is created */
  onFolderCreate?: (folder: StorageFolder) => void;
  /** Fired when current folder changes */
  onFolderChange?: (folderPath: string) => void;
  /** Fired when user clicks Save with selected files */
  onSave?: (files: StorageFile[]) => void;
  /** Fired on any error */
  onError?: (error: StorageError) => void;
}

// ─── Error Types ────────────────────────────────────────────────────────────

export type StorageErrorCode =
  | "UPLOAD_FAILED"
  | "DELETE_FAILED"
  | "MOVE_FAILED"
  | "COPY_FAILED"
  | "RENAME_FAILED"
  | "LIST_FAILED"
  | "FOLDER_CREATE_FAILED"
  | "FILE_TOO_LARGE"
  | "INVALID_MIME_TYPE"
  | "MAX_FILES_EXCEEDED"
  | "NETWORK_ERROR"
  | "AUTH_ERROR";

export interface StorageError {
  code: StorageErrorCode;
  message: string;
  details?: unknown;
}

// ─── Internal State ─────────────────────────────────────────────────────────

export interface StorageManagerState {
  files: StorageFile[];
  folders: StorageFolder[];
  currentFolder: string;
  selectedFiles: StorageFile[];
  pagination: PaginationState;
  sort: SortState;
  filter: FilterState;
  viewMode: ViewMode;
  isLoading: boolean;
  isUploading: boolean;
  error: StorageError | null;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  allowedMimeTypes: [],
  maxFileSize: 52428800, // 50MB
  maxFilesPerUpload: 10,
  autoUniqueNames: true,
  cacheControl: "3600",
  upsert: false,
};

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  enabled: true,
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  prefetchNext: true,
};

export const DEFAULT_FEATURES: FeatureFlags = {
  canCreateFolder: true,
  canUpload: true,
  canDelete: true,
  canMove: true,
  canCopy: true,
  canRename: true,
  canDownload: true,
  showSaveButton: true,
  showPreview: true,
  multiSelect: true,
  showBreadcrumb: true,
  showFileSize: true,
  showDate: true,
};

export const DEFAULT_SORT: SortState = {
  field: "name",
  direction: "asc",
};

export const DEFAULT_FILTER: FilterState = {
  searchQuery: "",
  categories: [],
  mimeTypes: [],
  minSize: null,
  maxSize: null,
};
