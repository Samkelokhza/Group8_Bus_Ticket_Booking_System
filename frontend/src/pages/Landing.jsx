import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSearch = () => {
    if (user) {
      navigate(`/passenger/bookings?from=${from}&to=${to}&date=${date}`)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 text-white">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">BusTicket</h1>
        <div>
          {user ? (
            <button onClick={() => navigate(user.roles?.includes('Admin') ? '/admin' : '/passenger')}
                    className="bg-blue-600 px-4 py-2 rounded-lg">Dashboard</button>
          ) : (
            <div className="space-x-4">
              <a href="/login" className="hover:text-blue-300">Login</a>
              <a href="/register" className="bg-blue-600 px-4 py-2 rounded-lg">Register</a>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <h2 className="text-5xl font-bold mb-4">Instant QR tickets – SA‑wide</h2>
        <p className="text-xl mb-8">Travel South Africa by bus, the easy way</p>

        <div className="bg-white rounded-xl p-6 shadow-2xl max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={from} onChange={e => setFrom(e.target.value)}
                   placeholder="From" className="p-3 rounded-lg border text-gray-800" />
            <input value={to} onChange={e => setTo(e.target.value)}
                   placeholder="To" className="p-3 rounded-lg border text-gray-800" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                   className="p-3 rounded-lg border text-gray-800" />
            <button onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg flex items-center justify-center gap-2">
              <Search size={20} /> Search
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="font-bold mb-2">All major SA routes</h3>
            <p>Joburg, Cape Town, Durban, Pretoria, Bloemfontein, Polokwane & more</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="font-bold mb-2">Pick your exact seat</h3>
            <p>Interactive seat map with live availability</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="font-bold mb-2">Secure & instant</h3>
            <p>Confirmed bookings with a scannable QR code</p>
          </div>
        </div>
      </main>
    </div>
  )
}