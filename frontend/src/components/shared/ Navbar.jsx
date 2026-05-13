import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-blue-600">
              🚌 BusTicket
            </Link>
            {user && (
              <>
                <Link to="/booking" className="text-gray-700 hover:text-blue-600 transition">
                  Book Ticket
                </Link>
                <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 transition">
                  My Bookings
                </Link>
                <Link to="/complaints" className="text-gray-700 hover:text-blue-600 transition">
                  Complaints
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-orange-600 hover:text-orange-700 font-medium transition">
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.username}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}