import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUploadCloud, FiX, FiCheck, FiFile, FiImage, FiVideo, FiMusic } from 'react-icons/fi'

interface FileUploadProps {
  token: string
  onClose: () => void
  onComplete: () => void
  endpoint?: string
  requestHeaders?: Record<string, string>
  extraBody?: Record<string, unknown>
}

interface UploadFile {
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function FileUpload({ 
  token: _token, 
  onClose, 
  onComplete, 
  endpoint = '/api/upload', 
  requestHeaders, 
  extraBody 
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FiImage className="text-blue-500" />
    if (file.type.startsWith('video/')) return <FiVideo className="text-purple-500" />
    if (file.type.startsWith('audio/')) return <FiMusic className="text-green-500" />
    return <FiFile className="text-gray-500" />
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined)
        return
      }
      
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const newUploadFiles: UploadFile[] = await Promise.all(
      acceptedFiles.map(async (file) => ({
        file,
        preview: await createPreview(file),
        progress: 0,
        status: 'pending' as const
      }))
    )

    setUploadFiles(prev => [...prev, ...newUploadFiles])
    setGlobalError('')
  }, [])

  const handleUploadFiles = async () => {
    setIsUploading(true)
    setGlobalError('')

    try {
      const files = await Promise.all(
        uploadFiles.map(async (uploadFile) => {
          if (uploadFile.status !== 'pending') return uploadFile
          
          const buffer = await uploadFile.file.arrayBuffer()
          return {
            name: uploadFile.file.name,
            size: uploadFile.file.size,
            content: btoa(String.fromCharCode(...new Uint8Array(buffer)))
          }
        })
      )

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(requestHeaders || {}) },
        body: JSON.stringify({ files, ...(extraBody || {}) })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      await response.json()
      
      // Mark all as success
      setUploadFiles(prev => prev.map(f => ({ ...f, progress: 100, status: 'success' as const })))

      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败'
      setGlobalError(errorMessage)
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, error: errorMessage })))
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isUploading
  })

  const allComplete = uploadFiles.length > 0 && uploadFiles.every(f => f.status === 'success')
  const hasPendingFiles = uploadFiles.some(f => f.status === 'pending')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">上传文件</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isUploading}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {uploadFiles.length === 0 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500'
              }`}
            >
              <input {...getInputProps()} />
              <FiUploadCloud className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
              <p className="text-gray-600 dark:text-gray-300">
                {isDragActive
                  ? '释放文件以上传'
                  : '拖拽文件到此处，或点击选择文件'}
              </p>
            </div>
          )}

          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              {uploadFiles.map((uploadFile, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {uploadFile.preview ? (
                      <img src={uploadFile.preview} alt="" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      getFileIcon(uploadFile.file)
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatSize(uploadFile.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                      disabled={isUploading}
                    >
                      <FiX />
                    </button>
                  </div>
                  
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadFile.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {uploadFile.status === 'success' && (
                    <div className="mt-3 flex items-center gap-2 text-green-600">
                      <FiCheck />
                      <span className="text-sm">上传成功</span>
                    </div>
                  )}
                  
                  {uploadFile.status === 'error' && (
                    <div className="mt-3 text-red-500 text-sm">
                      {uploadFile.error || '上传失败'}
                    </div>
                  )}
                </div>
              ))}

              {hasPendingFiles && (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-600 dark:text-gray-300">添加更多文件</p>
                </div>
              )}
            </div>
          )}

          {globalError && (
            <div className="text-red-500 text-center mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
              {globalError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
            disabled={isUploading}
          >
            取消
          </button>
          
          {uploadFiles.length > 0 && !allComplete && (
            <button
              onClick={handleUploadFiles}
              disabled={isUploading || !hasPendingFiles}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  上传中...
                </>
              ) : (
                <>
                  <FiUploadCloud />
                  上传 {uploadFiles.filter(f => f.status === 'pending').length} 个文件
                </>
              )}
            </button>
          )}
          
          {allComplete && (
            <div className="text-green-600 flex items-center gap-2">
              <FiCheck />
              <span>全部上传成功！</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
