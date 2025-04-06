"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type FileType,
  type FileObject,
  supabaseStorage,
} from "@/lib/supabase-storage";
import { Loader2, Upload, File, Image, Music, X } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"existing" | "upload">("existing");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    currentFileUrl
  );

  // Load existing files when dialog opens
  useEffect(() => {
    if (isOpen && activeTab === "existing") {
      loadFiles();
    }
  }, [isOpen, activeTab]);

  // Update preview URL when currentFileUrl changes
  useEffect(() => {
    setPreviewUrl(currentFileUrl);
  }, [currentFileUrl]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const files = await supabaseStorage.listFiles(fileType);
      setFiles(files);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const uploadedFile = await supabaseStorage.uploadFile(
        uploadFile,
        fileType
      );
      onFileSelect(uploadedFile);
      setPreviewUrl(uploadedFile.url);
      setIsOpen(false);
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

      // Generate preview for uploaded image
      if (fileType === "image" && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSelectFile = (file: FileObject) => {
    onFileSelect(file);
    setPreviewUrl(file.url);
    setIsOpen(false);
  };

  const getFileIcon = () => {
    if (fileType === "image") return <Image className="h-4 w-4" />;
    if (fileType === "audio") return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const clearSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(undefined);
    onFileSelect({ id: "", name: "", url: "", size: 0 });
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
            <Button variant="outline" size="sm" className="h-7 text-xs px-3">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] p-4">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-base">Select {fileType}</DialogTitle>
            </DialogHeader>

            <Tabs
              defaultValue="existing"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "existing" | "upload")}
              className="mt-1"
            >
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="existing" className="text-xs">
                  Existing Files
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs">
                  Upload New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="min-h-[260px] mt-3">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[200px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {files.length === 0 ? (
                      <div className="col-span-3 text-center py-6 text-xs text-muted-foreground">
                        No {fileType} files found
                      </div>
                    ) : (
                      files.map((file) => (
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
                            <p className="text-xs truncate font-medium">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {Math.round(file.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="upload"
                className="min-h-[260px] mt-3 space-y-3"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="file-upload" className="text-xs font-medium">
                    Select a file to upload
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept={fileType === "image" ? "image/*" : "audio/*"}
                    onChange={handleFileChange}
                    className="text-xs h-8"
                  />
                </div>

                {uploadFile && (
                  <div className="py-1.5 px-2.5 border rounded-md bg-muted/20">
                    <p className="font-medium text-xs">{uploadFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.round(uploadFile.size / 1024)} KB
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || isUploading}
                  className="w-full h-8 text-xs mt-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Upload {fileType === "image" ? "Image" : "Audio"}
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {fileType === "image" && previewUrl && (
        <div className="mt-2 relative">
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
            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/70 hover:bg-background shadow-sm"
            onClick={clearSelectedFile}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
