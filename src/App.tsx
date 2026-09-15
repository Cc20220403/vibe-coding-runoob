import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TaskListPage from './pages/TaskListPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TaskListPage />} />
    </Routes>
  )
}
