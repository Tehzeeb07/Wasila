import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CompanyProfile from './pages/CompanyProfile'
import MyJobs from './pages/MyJobs'
import PostJob from './pages/PostJob'
import JobDetail from './pages/JobDetail'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />

      <Route path="/jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
      <Route path="/jobs/new" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
      <Route path="/jobs/:jobId/edit" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
      <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />

      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
    </Routes>
  )
}
