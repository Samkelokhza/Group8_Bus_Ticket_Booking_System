import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PassengerDashboard from './pages/passenger/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/passenger' element={<PassengerDashboard />} />
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='*' element={<Navigate to='/login' />} />
    </Routes>
  )
}
