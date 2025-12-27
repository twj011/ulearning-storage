import { useState, useEffect } from 'react'
import { FiCopy, FiCheck, FiTrash2 } from 'react-icons/fi'

interface Image {
  id: string
  name: string
  url: string
  thumbnail: string
  createdAt: string
}

interface ImageGalleryProps {
  token: string
  refreshKey: number
}

export default function ImageGallery({ token, refreshKey }: ImageGalleryProps) {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
  }, [refreshKey])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/files?type=image', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setImages(data.files || [])
    } catch (err) {
      console.error('Failed to fetch images:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此图片吗？')) return

    try {
      await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setImages(images.filter(img => img.id !== id))
    } catch (err) {
      alert('删除失败')
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无图片，上传图片后即可使用图床功能
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map(image => (
        <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden group">
          <div className="aspect-square bg-gray-100 relative">
            <img
              src={image.thumbnail || image.url}
              alt={image.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => copyToClipboard(image.url, image.id)}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
              >
                {copiedId === image.id ? <FiCheck /> : <FiCopy />}
                {copiedId === image.id ? '已复制' : '复制链接'}
              </button>
              <button
                onClick={() => handleDelete(image.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-800 truncate">{image.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(image.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
