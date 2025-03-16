// Mock Supabase storage service
// This will be replaced with actual Supabase implementation later

export type FileType = "image" | "audio"
export type FileObject = {
  id: string
  name: string
  url: string
  type: FileType
  size: number
  createdAt: string
}

// Mock data
const mockFiles: FileObject[] = [
  {
    id: "1",
    name: "sample-image-1.jpg",
    url: "/placeholder.svg?height=400&width=600",
    type: "image",
    size: 1024 * 1024 * 2, // 2MB
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "sample-image-2.jpg",
    url: "/placeholder.svg?height=500&width=700",
    type: "image",
    size: 1024 * 1024 * 1.5, // 1.5MB
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "sample-audio-1.mp3",
    url: "/sample-audio-1.mp3",
    type: "audio",
    size: 1024 * 1024 * 3, // 3MB
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "sample-audio-2.mp3",
    url: "/sample-audio-2.mp3",
    type: "audio",
    size: 1024 * 1024 * 4, // 4MB
    createdAt: new Date().toISOString(),
  },
]

// Mock functions that mimic Supabase storage API
export const supabaseStorage = {
  // List files of a specific type
  listFiles: async (type: FileType): Promise<FileObject[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockFiles.filter((file) => file.type === type)
  },

  // Upload a file
  uploadFile: async (file: File, type: FileType): Promise<FileObject> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create a mock file object
    const newFile: FileObject = {
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      url: URL.createObjectURL(file), // This would be a Supabase URL in production
      type,
      size: file.size,
      createdAt: new Date().toISOString(),
    }

    // In a real implementation, we would upload to Supabase here
    console.log("Mock uploading file to Supabase:", file.name)

    return newFile
  },

  // Delete a file
  deleteFile: async (fileId: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("Mock deleting file from Supabase:", fileId)
  },

  // Get a file by ID
  getFile: async (fileId: string): Promise<FileObject | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockFiles.find((file) => file.id === fileId) || null
  },
}

