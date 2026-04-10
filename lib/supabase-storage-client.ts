/**
 * Supabase Storage Client
 *
 * A configurable storage client that supports any bucket, any Supabase project,
 * pagination, and all CRUD operations needed by the StorageManager component.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  type SupabaseStorageConfig,
  type StorageFile,
  type StorageFolder,
  type FileMimeCategory,
  type UploadConfig,
  type StorageError,
  type StorageErrorCode,
  DEFAULT_UPLOAD_CONFIG,
} from "./storage-manager-types";

// ─── MIME Helpers ───────────────────────────────────────────────────────────

const MIME_CATEGORY_MAP: Record<string, FileMimeCategory> = {
  "image/": "image",
  "audio/": "audio",
  "video/": "video",
  "application/pdf": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml": "document",
  "application/vnd.ms-excel": "spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml": "spreadsheet",
  "text/csv": "spreadsheet",
  "application/zip": "archive",
  "application/x-rar": "archive",
  "application/gzip": "archive",
  "application/x-tar": "archive",
  "text/javascript": "code",
  "application/json": "code",
  "text/html": "code",
  "text/css": "code",
  "text/plain": "document",
};

export function getMimeCategory(mimeType: string, fileName?: string): FileMimeCategory {
  if (!mimeType || mimeType === "application/octet-stream") {
    // Fallback: infer category from file extension
    if (fileName) {
      const inferred = inferMimeTypeFromExtension(fileName);
      if (inferred) {
        for (const [prefix, category] of Object.entries(MIME_CATEGORY_MAP)) {
          if (inferred.startsWith(prefix)) return category;
        }
      }
      // Fallback: infer from filename prefix convention (e.g. "audio_xxx", "image_xxx")
      const lowerName = fileName.toLowerCase();
      if (lowerName.startsWith("audio_") || lowerName.startsWith("audio-")) return "audio";
      if (lowerName.startsWith("image_") || lowerName.startsWith("image-")) return "image";
      if (lowerName.startsWith("video_") || lowerName.startsWith("video-")) return "video";
    }
    if (!mimeType) return "other";
  }
  for (const [prefix, category] of Object.entries(MIME_CATEGORY_MAP)) {
    if (mimeType.startsWith(prefix)) return category;
  }
  return "other";
}

/** Infer MIME type from file extension when the reported type is generic */
const EXTENSION_MIME_MAP: Record<string, string> = {
  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
  wma: "audio/x-ms-wma",
  opus: "audio/opus",
  webm: "audio/webm",
  // Image
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  // Video
  mp4: "video/mp4",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  // Document
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
};

export function inferMimeTypeFromExtension(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  return EXTENSION_MIME_MAP[ext] || null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}


// ─── Error Helper ───────────────────────────────────────────────────────────

function createStorageError(
  code: StorageErrorCode,
  message: string,
  details?: unknown
): StorageError {
  return { code, message, details };
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateFile(
  file: File,
  config: UploadConfig
): StorageError | null {
  if (file.size > config.maxFileSize) {
    return createStorageError(
      "FILE_TOO_LARGE",
      `File "${file.name}" exceeds max size of ${formatFileSize(config.maxFileSize)}`,
      { fileSize: file.size, maxSize: config.maxFileSize }
    );
  }

  if (config.allowedMimeTypes.length > 0) {
    // Use the reported type, but fall back to extension-based inference
    // when the browser reports a generic type
    let effectiveType = file.type;
    if (!effectiveType || effectiveType === "application/octet-stream") {
      const inferred = inferMimeTypeFromExtension(file.name);
      if (inferred) {
        effectiveType = inferred;
      } else {
        // Cannot determine actual MIME type — skip validation rather than
        // rejecting files whose type the browser simply doesn't recognise
        return null;
      }
    }

    const isAllowed = config.allowedMimeTypes.some((pattern) => {
      if (pattern.endsWith("/*")) {
        return effectiveType.startsWith(pattern.replace("/*", "/"));
      }
      return effectiveType === pattern;
    });
    if (!isAllowed) {
      return createStorageError(
        "INVALID_MIME_TYPE",
        `mime type ${effectiveType} is not supported`,
        { fileType: effectiveType, allowed: config.allowedMimeTypes }
      );
    }
  }

  return null;
}

// ─── Path Helpers ───────────────────────────────────────────────────────────

function joinPath(...parts: string[]): string {
  return parts
    .filter((p) => p && p.trim() !== "")
    .join("/")
    .replace(/\/+/g, "/");
}

function getFileName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1];
}

function getParentFolder(path: string): string {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
}


// ─── Storage Client Class ───────────────────────────────────────────────────

export class SupabaseStorageClient {
  private supabase: SupabaseClient;
  private bucketName: string;
  private isPublicBucket: boolean;
  private rootFolder: string;
  private uploadConfig: UploadConfig;

  constructor(
    storageConfig: SupabaseStorageConfig,
    uploadConfig?: Partial<UploadConfig>
  ) {
    this.supabase = createClient(
      storageConfig.supabaseUrl,
      storageConfig.supabaseAnonKey
    );
    this.bucketName = storageConfig.bucketName;
    this.isPublicBucket = storageConfig.isPublicBucket ?? true;
    this.rootFolder = storageConfig.rootFolder ?? "";
    this.uploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...uploadConfig };
  }

  /** Resolve a relative path to the full path including rootFolder */
  private resolvePath(relativePath: string): string {
    return joinPath(this.rootFolder, relativePath);
  }

  /** Get the public or signed URL for a file */
  private getFileUrl(filePath: string): string {
    if (this.isPublicBucket) {
      const { data } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      return data.publicUrl;
    }
    // For private buckets, return the path — caller should use getSignedUrl
    return filePath;
  }

  /** Get a signed URL for private bucket files */
  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(this.resolvePath(filePath), expiresIn);
    if (error) return null;
    return data.signedUrl;
  }

  /** Map a Supabase file object to our StorageFile interface */
  private mapToStorageFile(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any,
    folderPath: string
  ): StorageFile {
    const fullPath = joinPath(folderPath, item.name);
    let mimeType = item.metadata?.mimetype || "";

    // Fallback: infer from extension when Supabase returns generic type
    if (!mimeType || mimeType === "application/octet-stream") {
      const inferred = inferMimeTypeFromExtension(item.name);
      if (inferred) {
        mimeType = inferred;
      } else {
        // Infer from filename prefix convention (e.g. "audio_xxx")
        const lowerName = item.name.toLowerCase();
        if (lowerName.startsWith("audio_") || lowerName.startsWith("audio-")) {
          mimeType = "audio/mpeg";
        } else if (lowerName.startsWith("image_") || lowerName.startsWith("image-")) {
          mimeType = "image/jpeg";
        } else if (lowerName.startsWith("video_") || lowerName.startsWith("video-")) {
          mimeType = "video/mp4";
        }
      }
    }

    return {
      id: item.id || fullPath,
      name: item.name,
      path: fullPath,
      url: this.getFileUrl(fullPath),
      mimeType,
      category: getMimeCategory(mimeType, item.name),
      size: item.metadata?.size || 0,
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || item.created_at || new Date().toISOString(),
      folder: folderPath,
      metadata: item.metadata || {},
    };
  }


  // ─── List ───────────────────────────────────────────────────────────────

  /**
   * List files and folders in a given path.
   * Returns both folders (items with id=null) and files separately.
   */
  async listContents(
    folderPath = "",
    options?: { limit?: number; offset?: number; sortBy?: { column: string; order: string } }
  ): Promise<{
    files: StorageFile[];
    folders: StorageFolder[];
    error: StorageError | null;
  }> {
    try {
      const resolvedPath = this.resolvePath(folderPath);
      const listPath = resolvedPath || undefined;
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list(listPath, {
          limit: options?.limit || 1000,
          offset: options?.offset || 0,
          sortBy: options?.sortBy
            ? { column: options.sortBy.column, order: options.sortBy.order }
            : { column: "name", order: "asc" },
        });

      if (error) {
        // Ignore MIME type errors from Supabase bucket restrictions
        const isMimeError = error.message?.toLowerCase().includes("mime type")
          && error.message?.toLowerCase().includes("is not supported");
        if (!isMimeError) {
          return {
            files: [],
            folders: [],
            error: createStorageError("LIST_FAILED", error.message, error),
          };
        }
        console.warn("[StorageManager] Ignoring MIME type error from Supabase list:", error.message);
      }

      if (!data) return { files: [], folders: [], error: null };

      const folders: StorageFolder[] = [];
      const files: StorageFile[] = [];

      for (const item of data) {
        if (!item.name) continue;
        if (item.id === null) {
          folders.push({
            name: item.name,
            path: joinPath(resolvedPath, item.name),
            itemCount: 0,
            createdAt: item.created_at || new Date().toISOString(),
          });
        } else {
          if (item.name === ".folder") continue;
          files.push(this.mapToStorageFile(item, resolvedPath));
        }
      }

      return { files, folders, error: null };
    } catch (err) {
      return {
        files: [],
        folders: [],
        error: createStorageError(
          "LIST_FAILED",
          err instanceof Error ? err.message : "Unknown error listing files",
          err
        ),
      };
    }
  }

  /**
   * Fetch all folders and paginated files in a single pass.
   *
   * Supabase Storage `.list()` returns folders and files INTERLEAVED
   * (sorted by name together), NOT folders-first. So we cannot rely on
   * offset-based separation. Instead we:
   *   1. Fetch batches from offset 0, collecting ALL folders + files.
   *   2. Stop when we have enough files for the requested page.
   *   3. Return folders (all) + files (page slice) + totalFiles count.
   *
   * This is called once per page navigation. Folders are cheap (typically <50)
   * and are always returned in full.
   */
  async listFoldersAndFiles(
    folderPath = "",
    options?: {
      fileOffset?: number;
      fileLimit?: number;
      sortBy?: { column: string; order: string };
    }
  ): Promise<{
    folders: StorageFolder[];
    files: StorageFile[];
    totalFiles: number;
    hasMore: boolean;
    error: StorageError | null;
  }> {
    try {
      const resolvedPath = this.resolvePath(folderPath);
      const listPath = resolvedPath || undefined;
      const fileOffset = options?.fileOffset || 0;
      const fileLimit = options?.fileLimit || 20;
      const sortBy = options?.sortBy || { column: "name", order: "asc" };

      const allFolders: StorageFolder[] = [];
      const allFiles: StorageFile[] = [];
      let batchOffset = 0;
      const batchSize = 200; // Fetch in batches of 200
      let exhausted = false;

      // Keep fetching until we have enough files or run out of items
      while (!exhausted) {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .list(listPath, {
            limit: batchSize,
            offset: batchOffset,
            sortBy: { column: sortBy.column, order: sortBy.order },
          });

        if (error) {
          // Supabase buckets with MIME type restrictions may return
          // "mime type ... is not supported" errors during listing.
          // This is non-fatal — ignore it and continue with any data returned.
          const isMimeError = error.message?.toLowerCase().includes("mime type")
            && error.message?.toLowerCase().includes("is not supported");

          if (isMimeError) {
            console.warn("[StorageManager] Ignoring MIME type error from Supabase list:", error.message);
            // Still process data if Supabase returned it alongside the error
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items = (data as unknown) as any[] | null;
            if (items && items.length > 0) {
              for (const item of items) {
                if (!item.name) continue;
                if (item.id === null) {
                  allFolders.push({
                    name: item.name,
                    path: joinPath(resolvedPath, item.name),
                    itemCount: 0,
                    createdAt: item.created_at || new Date().toISOString(),
                  });
                } else if (item.name !== ".folder") {
                  allFiles.push(this.mapToStorageFile(item, resolvedPath));
                }
              }
            }
            exhausted = true;
            break;
          }

          // If we already collected some data, return what we have
          // instead of discarding everything
          if (allFolders.length > 0 || allFiles.length > 0) {
            console.warn("[StorageManager] Partial list error (returning collected data):", error.message);
            exhausted = true;
            break;
          }
          return {
            folders: [],
            files: [],
            totalFiles: 0,
            hasMore: false,
            error: createStorageError("LIST_FAILED", error.message, error),
          };
        }

        if (!data || data.length === 0) {
          exhausted = true;
          break;
        }

        for (const item of data) {
          if (!item.name) continue;
          if (item.id === null) {
            // It's a folder
            allFolders.push({
              name: item.name,
              path: joinPath(resolvedPath, item.name),
              itemCount: 0,
              createdAt: item.created_at || new Date().toISOString(),
            });
          } else if (item.name !== ".folder") {
            allFiles.push(this.mapToStorageFile(item, resolvedPath));
          }
        }

        // If we got fewer items than batchSize, we've exhausted the listing
        if (data.length < batchSize) {
          exhausted = true;
          break;
        }

        // If we already have enough files for the requested page + 1 (to check hasMore),
        // AND we've scanned enough to be confident about folder count, we can stop early.
        // But we need totalFiles count, so keep going unless it's too many.
        // Optimization: if we have way more files than needed, stop.
        if (allFiles.length > fileOffset + fileLimit + batchSize) {
          // We have enough to serve this page and know there's more.
          // But totalFiles will be approximate (at least allFiles.length).
          break;
        }

        batchOffset += batchSize;
      }

      const totalFiles = allFiles.length;
      const pageFiles = allFiles.slice(fileOffset, fileOffset + fileLimit);
      const hasMore = !exhausted || fileOffset + fileLimit < totalFiles;

      return {
        folders: allFolders,
        files: pageFiles,
        totalFiles: exhausted ? totalFiles : -1, // -1 means "at least this many"
        hasMore,
        error: null,
      };
    } catch (err) {
      return {
        folders: [],
        files: [],
        totalFiles: 0,
        hasMore: false,
        error: createStorageError(
          "LIST_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  // ─── Upload ─────────────────────────────────────────────────────────────

  /**
   * Upload one or more files to the specified folder.
   * Validates each file against uploadConfig before uploading.
   */
  async uploadFiles(
    files: File[],
    folderPath = ""
  ): Promise<{
    uploaded: StorageFile[];
    errors: StorageError[];
  }> {
    if (files.length > this.uploadConfig.maxFilesPerUpload) {
      return {
        uploaded: [],
        errors: [
          createStorageError(
            "MAX_FILES_EXCEEDED",
            `Cannot upload more than ${this.uploadConfig.maxFilesPerUpload} files at once`
          ),
        ],
      };
    }

    const uploaded: StorageFile[] = [];
    const errors: StorageError[] = [];

    for (const file of files) {
      // Validate
      const validationError = validateFile(file, this.uploadConfig);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      try {
        let fileName = file.name;
        if (this.uploadConfig.autoUniqueNames) {
          const ts = Date.now();
          const ext = fileName.includes(".")
            ? "." + fileName.split(".").pop()
            : "";
          const base = fileName.includes(".")
            ? fileName.substring(0, fileName.lastIndexOf("."))
            : fileName;
          fileName = `${base}-${ts}${ext}`;
        }

        // Use inferred MIME type for upload when browser reports generic type
        let uploadContentType = file.type;
        if (!uploadContentType || uploadContentType === "application/octet-stream") {
          const inferred = inferMimeTypeFromExtension(file.name);
          if (inferred) {
            uploadContentType = inferred;
          } else if (this.uploadConfig.allowedMimeTypes.length > 0) {
            // Fall back to the first non-wildcard allowed type, or expand wildcard
            // e.g. "audio/*" → "audio/mpeg" as a safe default
            const firstAllowed = this.uploadConfig.allowedMimeTypes[0];
            if (firstAllowed.endsWith("/*")) {
              const prefix = firstAllowed.replace("/*", "");
              const defaults: Record<string, string> = {
                audio: "audio/mpeg",
                image: "image/jpeg",
                video: "video/mp4",
              };
              uploadContentType = defaults[prefix] || uploadContentType;
            } else {
              uploadContentType = firstAllowed;
            }
          }
        }

        const resolvedPath = this.resolvePath(joinPath(folderPath, fileName));

        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(resolvedPath, file, {
            cacheControl: this.uploadConfig.cacheControl,
            upsert: this.uploadConfig.upsert,
            contentType: uploadContentType,
          });

        if (error) {
          errors.push(
            createStorageError("UPLOAD_FAILED", `Failed to upload "${file.name}": ${error.message}`, error)
          );
          continue;
        }

        const storagePath = data?.path || resolvedPath;
        uploaded.push({
          id: storagePath,
          name: fileName,
          path: storagePath,
          url: this.getFileUrl(storagePath),
          mimeType: uploadContentType,
          category: getMimeCategory(uploadContentType, file.name),
          size: file.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          folder: this.resolvePath(folderPath),
          metadata: {},
        });
      } catch (err) {
        errors.push(
          createStorageError(
            "UPLOAD_FAILED",
            `Failed to upload "${file.name}": ${err instanceof Error ? err.message : "Unknown error"}`,
            err
          )
        );
      }
    }

    return { uploaded, errors };
  }


  // ─── Delete ─────────────────────────────────────────────────────────────

  async deleteFiles(filePaths: string[]): Promise<{
    deleted: string[];
    errors: StorageError[];
  }> {
    const resolvedPaths = filePaths.map((p) => this.resolvePath(p));
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove(resolvedPaths);

      if (error) {
        return {
          deleted: [],
          errors: [createStorageError("DELETE_FAILED", error.message, error)],
        };
      }

      return { deleted: filePaths, errors: [] };
    } catch (err) {
      return {
        deleted: [],
        errors: [
          createStorageError(
            "DELETE_FAILED",
            err instanceof Error ? err.message : "Unknown error",
            err
          ),
        ],
      };
    }
  }

  // ─── Move ───────────────────────────────────────────────────────────────

  async moveFile(
    fromPath: string,
    toFolder: string
  ): Promise<{ newPath: string | null; error: StorageError | null }> {
    try {
      const resolvedFrom = this.resolvePath(fromPath);
      const fileName = getFileName(fromPath);
      const resolvedTo = this.resolvePath(joinPath(toFolder, fileName));

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .move(resolvedFrom, resolvedTo);

      if (error) {
        return {
          newPath: null,
          error: createStorageError("MOVE_FAILED", error.message, error),
        };
      }

      return { newPath: joinPath(toFolder, fileName), error: null };
    } catch (err) {
      return {
        newPath: null,
        error: createStorageError(
          "MOVE_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  // ─── Copy ───────────────────────────────────────────────────────────────

  async copyFile(
    fromPath: string,
    toFolder: string
  ): Promise<{ newPath: string | null; error: StorageError | null }> {
    try {
      const resolvedFrom = this.resolvePath(fromPath);
      const fileName = getFileName(fromPath);
      const resolvedTo = this.resolvePath(joinPath(toFolder, fileName));

      const { data, error: downloadError } = await this.supabase.storage
        .from(this.bucketName)
        .download(resolvedFrom);

      if (downloadError || !data) {
        return {
          newPath: null,
          error: createStorageError(
            "COPY_FAILED",
            `Failed to download source: ${downloadError?.message || "No data"}`,
            downloadError
          ),
        };
      }

      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(resolvedTo, data, {
          cacheControl: this.uploadConfig.cacheControl,
          upsert: false,
        });

      if (uploadError) {
        return {
          newPath: null,
          error: createStorageError("COPY_FAILED", uploadError.message, uploadError),
        };
      }

      return { newPath: joinPath(toFolder, fileName), error: null };
    } catch (err) {
      return {
        newPath: null,
        error: createStorageError(
          "COPY_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  // ─── Rename ─────────────────────────────────────────────────────────────

  async renameFile(
    filePath: string,
    newName: string
  ): Promise<{ newPath: string | null; error: StorageError | null }> {
    try {
      const resolvedFrom = this.resolvePath(filePath);
      const parentFolder = getParentFolder(filePath);
      const resolvedTo = this.resolvePath(joinPath(parentFolder, newName));

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .move(resolvedFrom, resolvedTo);

      if (error) {
        return {
          newPath: null,
          error: createStorageError("RENAME_FAILED", error.message, error),
        };
      }

      return { newPath: joinPath(parentFolder, newName), error: null };
    } catch (err) {
      return {
        newPath: null,
        error: createStorageError(
          "RENAME_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  // ─── Create Folder ─────────────────────────────────────────────────────

  async createFolder(
    folderPath: string
  ): Promise<{ folder: StorageFolder | null; error: StorageError | null }> {
    try {
      const resolvedPath = this.resolvePath(joinPath(folderPath, ".folder"));

      // Supabase buckets with MIME-type restrictions reject empty blobs
      // (application/octet-stream). We must send a contentType that the
      // bucket allows. Derive it from the upload config.
      let placeholderType = "text/plain";
      if (this.uploadConfig.allowedMimeTypes.length > 0) {
        const first = this.uploadConfig.allowedMimeTypes[0];
        if (first.endsWith("/*")) {
          const prefix = first.replace("/*", "");
          const defaults: Record<string, string> = {
            audio: "audio/mpeg",
            image: "image/png",
            video: "video/mp4",
            text: "text/plain",
          };
          placeholderType = defaults[prefix] || first.replace("*", "octet-stream");
        } else {
          placeholderType = first;
        }
      }

      // Try with the derived MIME type first
      let result = await this.supabase.storage
        .from(this.bucketName)
        .upload(resolvedPath, new Blob(["folder"], { type: placeholderType }), {
          upsert: true,
          contentType: placeholderType,
        });

      // If rejected by bucket MIME policy, retry without contentType restriction
      // by trying common MIME types that the bucket might accept
      if (result.error?.message?.toLowerCase().includes("mime type")) {
        const fallbackTypes = [
          "application/octet-stream",
          "text/plain",
          "audio/mpeg",
          "image/png",
          "video/mp4",
        ].filter((t) => t !== placeholderType);

        for (const fallbackType of fallbackTypes) {
          result = await this.supabase.storage
            .from(this.bucketName)
            .upload(resolvedPath, new Blob(["folder"], { type: fallbackType }), {
              upsert: true,
              contentType: fallbackType,
            });
          if (!result.error) break;
          if (!result.error.message?.toLowerCase().includes("mime type")) break;
        }
      }

      if (result.error) {
        return {
          folder: null,
          error: createStorageError("FOLDER_CREATE_FAILED", result.error.message, result.error),
        };
      }

      return {
        folder: {
          name: getFileName(folderPath),
          path: this.resolvePath(folderPath),
          itemCount: 0,
          createdAt: new Date().toISOString(),
        },
        error: null,
      };
    } catch (err) {
      return {
        folder: null,
        error: createStorageError(
          "FOLDER_CREATE_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  // ─── Download ───────────────────────────────────────────────────────────

  async downloadFile(filePath: string): Promise<{ blob: Blob | null; error: StorageError | null }> {
    try {
      const resolvedPath = this.resolvePath(filePath);
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(resolvedPath);

      if (error || !data) {
        return {
          blob: null,
          error: createStorageError("LIST_FAILED", error?.message || "Download failed", error),
        };
      }

      return { blob: data, error: null };
    } catch (err) {
      return {
        blob: null,
        error: createStorageError(
          "NETWORK_ERROR",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  // ─── Folder Operations ──────────────────────────────────────────────

  /** List all file paths recursively inside a folder */
  private async listAllFilesInFolder(folderPath: string): Promise<string[]> {
    const paths: string[] = [];
    const { data } = await this.supabase.storage
      .from(this.bucketName)
      .list(folderPath, { limit: 1000 });

    if (!data) return paths;

    for (const item of data) {
      // Skip empty-named items to prevent infinite recursion
      if (!item.name) continue;

      const fullPath = joinPath(folderPath, item.name);
      if (item.id === null) {
        // It's a subfolder — recurse
        const subPaths = await this.listAllFilesInFolder(fullPath);
        paths.push(...subPaths);
      } else {
        paths.push(fullPath);
      }
    }
    return paths;
  }

  /** Delete a folder and all its contents */
  async deleteFolder(
    folderPath: string
  ): Promise<{ error: StorageError | null }> {
    try {
      const resolvedPath = this.resolvePath(folderPath);
      const allFiles = await this.listAllFilesInFolder(resolvedPath);

      if (allFiles.length > 0) {
        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .remove(allFiles);

        if (error) {
          return { error: createStorageError("DELETE_FAILED", error.message, error) };
        }
      }

      return { error: null };
    } catch (err) {
      return {
        error: createStorageError(
          "DELETE_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  /** Rename a folder by moving all its contents to a new path */
  async renameFolder(
    folderPath: string,
    newName: string
  ): Promise<{ newPath: string | null; error: StorageError | null }> {
    try {
      const resolvedOld = this.resolvePath(folderPath);
      const parentFolder = getParentFolder(folderPath);
      const newFolderPath = joinPath(parentFolder, newName);
      const resolvedNew = this.resolvePath(newFolderPath);

      const allFiles = await this.listAllFilesInFolder(resolvedOld);

      for (const filePath of allFiles) {
        const relativePart = filePath.substring(resolvedOld.length);
        const newFilePath = joinPath(resolvedNew, relativePart);

        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .move(filePath, newFilePath);

        if (error) {
          return {
            newPath: null,
            error: createStorageError("RENAME_FAILED", `Failed to move ${filePath}: ${error.message}`, error),
          };
        }
      }

      return { newPath: newFolderPath, error: null };
    } catch (err) {
      return {
        newPath: null,
        error: createStorageError(
          "RENAME_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  /** Move a folder to a different parent */
  async moveFolder(
    folderPath: string,
    toParentFolder: string
  ): Promise<{ newPath: string | null; error: StorageError | null }> {
    try {
      const resolvedOld = this.resolvePath(folderPath);
      const folderName = getFileName(folderPath);
      const newFolderPath = joinPath(toParentFolder, folderName);
      const resolvedNew = this.resolvePath(newFolderPath);

      const allFiles = await this.listAllFilesInFolder(resolvedOld);

      for (const filePath of allFiles) {
        const relativePart = filePath.substring(resolvedOld.length);
        const newFilePath = joinPath(resolvedNew, relativePart);

        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .move(filePath, newFilePath);

        if (error) {
          return {
            newPath: null,
            error: createStorageError("MOVE_FAILED", `Failed to move ${filePath}: ${error.message}`, error),
          };
        }
      }

      return { newPath: newFolderPath, error: null };
    } catch (err) {
      return {
        newPath: null,
        error: createStorageError(
          "MOVE_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }

  /** Copy a folder to a different parent */
  async copyFolder(
    folderPath: string,
    toParentFolder: string
  ): Promise<{ newPath: string | null; error: StorageError | null }> {
    try {
      const resolvedOld = this.resolvePath(folderPath);
      const folderName = getFileName(folderPath);
      const newFolderPath = joinPath(toParentFolder, folderName);
      const resolvedNew = this.resolvePath(newFolderPath);

      const allFiles = await this.listAllFilesInFolder(resolvedOld);

      for (const filePath of allFiles) {
        const relativePart = filePath.substring(resolvedOld.length);
        const newFilePath = joinPath(resolvedNew, relativePart);

        // Download then re-upload (Supabase has no native copy)
        const { data, error: dlError } = await this.supabase.storage
          .from(this.bucketName)
          .download(filePath);

        if (dlError || !data) {
          return {
            newPath: null,
            error: createStorageError("COPY_FAILED", `Failed to download ${filePath}: ${dlError?.message}`, dlError),
          };
        }

        const { error: upError } = await this.supabase.storage
          .from(this.bucketName)
          .upload(newFilePath, data, { upsert: false });

        if (upError) {
          return {
            newPath: null,
            error: createStorageError("COPY_FAILED", `Failed to upload ${newFilePath}: ${upError.message}`, upError),
          };
        }
      }

      return { newPath: newFolderPath, error: null };
    } catch (err) {
      return {
        newPath: null,
        error: createStorageError(
          "COPY_FAILED",
          err instanceof Error ? err.message : "Unknown error",
          err
        ),
      };
    }
  }
}
