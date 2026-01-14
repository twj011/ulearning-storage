import { useState, useEffect } from 'react'
import { FiDownload, FiTrash2, FiFile, FiImage, FiVideo, FiMusic } from 'react-icons/fi'
import LoadingSkeleton from './LoadingSkeleton'

interface File {
  id: string
  name: string
  size: number
  type: string
  url: string
  createdAt: string
}

interface FileListProps {
  token: string
  refreshKey: number
}

export default function FileList({ token, refreshKey }: FileListProps) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [refreshKey])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Failed to fetch files:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此文件吗？')) return

    try {
      await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setFiles(files.filter(f => f.id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FiImage className="text-blue-500" />
    if (type.startsWith('video/')) return <FiVideo className="text-purple-500" />
    if (type.startsWith('audio/')) return <FiMusic className="text-green-500" />
    return <FiFile className="text-gray-500" />
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (loading) {
    return <LoadingSkeleton type="table" />
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无文件，点击上传按钮开始使用
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">文件名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">大小</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">上传时间</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map(file => (
              <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <span className="text-sm text-gray-900 dark:text-gray-100">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(file.createdAt).toLocaleString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <a
                    href={file.url}
                    download
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                  >
                    <FiDownload className="inline" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FiTrash2 className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
