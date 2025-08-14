'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void
  isProcessing: boolean
}

export default function ImageUpload({ onImageUpload, isProcessing }: ImageUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      setUploadedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
        onImageUpload(result)
      }
      reader.readAsDataURL(file)
      
      toast.success('Image uploaded successfully!')
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isProcessing
  })

  const removeFile = () => {
    setUploadedFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`upload-zone ${
          isDragActive ? 'dragover' : ''
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        
        {!uploadedFile ? (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-primary-600" />
              ) : (
                <Camera className="w-8 h-8 text-primary-600" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragActive ? 'Drop your image here' : 'Upload Chemistry Question'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, PNG, GIF, BMP, WebP (max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {uploadedFile && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <img 
              src={preview || ''} 
              alt="Preview" 
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <p className="font-medium text-sm">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          {!isProcessing && (
            <button
              onClick={removeFile}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-medium">
              Processing your chemistry question...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
