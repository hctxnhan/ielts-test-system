"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type FileType, type FileObject, supabaseStorage } from "@/lib/supabase-storage"
import { Loader2, Upload, File, Image, Music } from "lucide-react"

interface FilePickerProps {
  fileType: FileType
  onFileSelect: (file: FileObject) => void
  currentFileUrl?: string
}

export default function FilePicker({ fileType, onFileSelect, currentFileUrl }: FilePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"existing" | "upload">("existing")
  const [files, setFiles] = useState<FileObject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load existing files when dialog opens
  useEffect(() => {
    if (isOpen && activeTab === "existing") {
      loadFiles()
    }
  }, [isOpen, activeTab])

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const files = await supabaseStorage.listFiles(fileType)
      setFiles(files)
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return

    setIsUploading(true)
    try {
      const uploadedFile = await supabaseStorage.uploadFile(uploadFile, fileType)
      onFileSelect(uploadedFile)
      setIsOpen(false)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0])
    }
  }

  const handleSelectFile = (file: FileObject) => {
    onFileSelect(file)
    setIsOpen(false)
  }

  const getFileIcon = () => {
    if (fileType === "image") return <Image className="h-5 w-5" />
    if (fileType === "audio") return <Music className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {currentFileUrl ? (
          <div className="flex-1 border rounded-md p-2 flex items-center gap-2 text-sm truncate">
            {getFileIcon()}
            <span className="truncate">{currentFileUrl.split("/").pop()}</span>
          </div>
        ) : (
          <div className="flex-1 border rounded-md p-2 text-sm text-muted-foreground">No {fileType} selected</div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select {fileType === "image" ? "an image" : "an audio file"}</DialogTitle>
            </DialogHeader>

            <Tabs
              defaultValue="existing"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "existing" | "upload")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Existing Files</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="min-h-[300px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {files.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">No {fileType} files found</div>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="border rounded-md p-2 cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => handleSelectFile(file)}
                        >
                          {fileType === "image" ? (
                            <div className="aspect-video mb-2 bg-muted rounded-md overflow-hidden">
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video mb-2 bg-muted rounded-md flex items-center justify-center">
                              <Music className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="min-h-[300px]">
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Select a file to upload</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept={fileType === "image" ? "image/*" : "audio/*"}
                      onChange={handleFileChange}
                    />
                  </div>

                  {uploadFile && (
                    <div className="p-4 border rounded-md">
                      <p className="font-medium">{uploadFile.name}</p>
                      <p className="text-sm text-muted-foreground">{Math.round(uploadFile.size / 1024)} KB</p>
                    </div>
                  )}

                  <Button onClick={handleFileUpload} disabled={!uploadFile || isUploading} className="w-full">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {fileType === "image" ? "Image" : "Audio"}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

