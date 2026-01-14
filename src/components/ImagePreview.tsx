import { useState, useCallback } from 'react'
import { FiX, FiDownload, FiCopy, FiCheck, FiZoomIn } from 'react-icons/fi'

interface ImagePreviewProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export default function ImagePreview({ src, alt, isOpen, onClose }: ImagePreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(src)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [src])

  const downloadImage = useCallback(() => {
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [src, alt])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-7xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
        >
          <FiX size={24} />
        </button>

        {/* Image */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg px-4 py-2">
          <button
            onClick={copyToClipboard}
            className="text-white hover:text-gray-300 transition flex items-center gap-2"
            title="复制链接"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? '已复制' : '复制'}
          </button>
          <button
            onClick={downloadImage}
            className="text-white hover:text-gray-300 transition flex items-center gap-2"
            title="下载图片"
          >
            <FiDownload />
            下载
          </button>
          <button
            onClick={() => window.open(src, '_blank')}
            className="text-white hover:text-gray-300 transition flex items-center gap-2"
            title="新窗口打开"
          >
            <FiZoomIn />
            新窗口
          </button>
        </div>
      </div>
    </div>
  )
}
