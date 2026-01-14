import { useState } from 'react'
import { FiImage, FiSettings } from 'react-icons/fi'
import CourseFolders from './CourseFolders'
import ThemeToggle from './ThemeToggle'

export default function CoursePortal() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ulearning-storage</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="/imgbed"
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <FiImage /> 图床
            </a>
            <a
              href="/admin"
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition bg-purple-600 text-white hover:bg-purple-700"
            >
              <FiSettings /> 管理员
            </a>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-4 py-2 rounded-lg transition bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              刷新
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <CourseFolders refreshKey={refreshKey} />
      </main>
    </div>
  )
}
