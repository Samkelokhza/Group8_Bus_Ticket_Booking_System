import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function PassengerDashboard() {
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/auth/me/', { headers: { Authorization: Bearer  } })
        .then(res => setUser(res.data))
      api.get('/bookings/', { headers: { Authorization: Bearer  } })
        .then(res => setBookings(res.data))
    }
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div style={{minHeight:'100vh',background:'#111827',color:'white',padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:24}}>🚌 Passenger Dashboard</h1>
        <div>
          <span style={{marginRight:16}}>Welcome, {user?.first_name || user?.username}</span>
          <button onClick={logout} style={{padding:'8px 16px',background:'#dc2626',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      
      <div style={{background:'#1f2937',padding:24,borderRadius:12,marginBottom:24}}>
        <h2 style={{marginBottom:16}}>My Bookings ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p style={{color:'#9ca3af'}}>No bookings yet.</p>
        ) : (
          bookings.map(b => (
            <div key={b.id || b.booking_id} style={{background:'#374151',padding:12,borderRadius:8,marginBottom:8}}>
              <p>Booking #{b.id || b.booking_id} - Status: {b.booking_status || b.status}</p>
              <p style={{color:'#9ca3af',fontSize:14}}>Total: R{b.total_fare || 0}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
