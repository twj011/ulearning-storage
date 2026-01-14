interface LoadingSkeletonProps {
  type?: 'table' | 'gallery' | 'card'
  rows?: number
}

export default function LoadingSkeleton({ type = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文件名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">大小</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">上传时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (type === 'gallery') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: rows * 2 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
