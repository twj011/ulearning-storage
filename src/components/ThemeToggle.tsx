import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      title={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
    >
      {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  )
}
