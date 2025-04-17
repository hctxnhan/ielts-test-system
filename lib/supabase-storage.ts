import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

// Create a single supabase client for interacting with your database
const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// Define storage bucket name
const STORAGE_BUCKET = ENV.STORAGE_BUCKET;

export type FileType = "image" | "audio";
export type FileObject = {
  id: string;
  name: string;
  url: string;
  type: FileType;
  size: number;
  createdAt: string;
  path?: string; // Full path including folder
  folder?: string; // Folder name only
};

// Helper function to extract folder from path
const getFolderFromPath = (path: string): string => {
  const parts = path.split("/");
  return parts.length > 1 ? parts.slice(0, -1).join("/") : "";
};

// Helper function to get file name from path
const getFileNameFromPath = (path: string): string => {
  const parts = path.split("/");
  return parts[parts.length - 1];
};

export const supabaseStorage = {
  // List files of a specific type
  listFiles: async (
    type: FileType,
    folder: string = ""
  ): Promise<FileObject[]> => {
    try {
      // List files in the specified folder
      const { data: fileList, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(folder, { limit: 100 });

      if (listError) {
        console.error("Error listing files:", listError);
        return [];
      }

      if (!fileList || fileList.length === 0) {
        return [];
      }

      // Filter files by the type prefix and convert to FileObject format
      const filePromises = fileList.map(async (item) => {
        const fullPath = folder ? `${folder}/${item.name}` : item.name;

        const { data: urlData } = await supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(fullPath);

        // Remove the type prefix from the display name
        const displayName = item.name.replace(`${type}_`, "");

        return {
          id: item.id,
          name: displayName,
          url: urlData.publicUrl,
          type: item.metadata?.mimetype,
          size: item.metadata?.size || 0,
          createdAt: item.created_at || new Date().toISOString(),
          path: fullPath,
          folder: folder || "",
        };
      });

      const files = await Promise.all(filePromises);

      return files.filter(
        (item) => item.id === null || item.type.startsWith(type)
      );
    } catch (error) {
      console.error("Error in listFiles:", error);
      return [];
    }
  },
  uploadFile: async (
    file: File,
    type: FileType,
    folder?: string
  ): Promise<FileObject> => {
    try {
      const timestamp = new Date().getTime();
      // Generate a unique file name to avoid conflicts
      const fileNameParts = file.name.split(".");
      const fileExt = fileNameParts.length > 1 ? fileNameParts.pop() : ""; // Handle files with no extension
      const baseFileName = fileNameParts.join("."); // Handle filenames with multiple periods
      const fileName = `${baseFileName}-${timestamp}${
        fileExt ? `.${fileExt}` : ""
      }`;

      // Store the type as metadata in the filename prefix
      const typedFileName = `${type}_${fileName}`;

      // Determine path based on folder - only use if non-empty
      const filePath =
        folder && folder.trim() !== ""
          ? `${folder}/${typedFileName}`
          : typedFileName;

      // Ensure folder exists first if provided
      if (folder && folder.trim() !== "") {
        await supabaseStorage.createFolder(folder);
      }

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type, // Add content type for better MIME type handling
        });

      if (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Return FileObject with clean filename for display (without type prefix)
      return {
        id: data?.path || filePath,
        name: fileName, // Original filename with timestamp
        url: urlData.publicUrl,
        type,
        size: file.size,
        createdAt: new Date().toISOString(),
        path: filePath,
        folder: folder || "",
      };
    } catch (error) {
      console.error("Error in uploadFile:", error);
      throw error;
    }
  },

  // Get a file by ID (path)
  getFile: async (filePath: string): Promise<FileObject | null> => {
    try {
      // First check if the file exists
      const { data: fileData, error: fileError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath);

      if (fileError || !fileData) {
        console.error("Error finding file:", fileError);
        return null;
      }

      // Get public URL
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!data) {
        return null;
      }

      // Extract folder if present
      const folder = getFolderFromPath(filePath);
      const fileName = getFileNameFromPath(filePath);

      // Determine file type from the filename prefix
      let type: FileType = "image"; // Default
      if (fileName.startsWith("image_")) {
        type = "image";
      } else if (fileName.startsWith("audio_")) {
        type = "audio";
      }

      // Remove the type prefix for display name
      const displayName = fileName.replace(/^(image|audio)_/, "");

      return {
        id: filePath,
        name: displayName,
        url: data.publicUrl,
        type,
        size: fileData.size || 0, // Use actual file size from download data
        createdAt: new Date().toISOString(),
        path: filePath,
        folder,
      };
    } catch (error) {
      console.error("Error in getFile:", error);
      return null;
    }
  },

  // Delete a file by path
  deleteFile: async (filePath: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteFile:", error);
      return false;
    }
  },

  // Create a folder
  createFolder: async (folderPath: string): Promise<boolean> => {
    try {
      // Supabase doesn't have a direct "createFolder" method
      // We create an empty file with a trailing slash to represent a folder
      // const { error } = await supabase.storage
      //   .from(STORAGE_BUCKET)
      //   .upload(`${folderPath}/.folder`, new Blob([""]), {
      //     upsert: true,
      //   });

      // if (error) {
      //   console.error("Error creating folder:", error);
      //   return false;
      // }

      return true;
    } catch (error) {
      console.error("Error in createFolder:", error);
      return false;
    }
  },

  // Check if a file exists
  fileExists: async (filePath: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath);

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in fileExists:", error);
      return false;
    }
  },
};
