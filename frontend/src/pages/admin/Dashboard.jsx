import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/analytics/', { headers: { Authorization: Bearer  } })
        .then(res => setStats(res.data))
        .catch(err => console.error(err))
    }
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div style={{minHeight:'100vh',background:'#111827',color:'white',padding:24}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:24}}>⚙️ Admin Dashboard</h1>
        <button onClick={logout} style={{padding:'8px 16px',background:'#dc2626',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}>Logout</button>
      </div>
      
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <div style={{background:'#1f2937',padding:24,borderRadius:12}}>
          <p style={{color:'#9ca3af',fontSize:14}}>Total Revenue</p>
          <p style={{fontSize:28,fontWeight:'bold'}}>R{stats?.total_revenue || 0}</p>
        </div>
      </div>
      
      <div style={{background:'#1f2937',padding:24,borderRadius:12}}>
        <h2 style={{marginBottom:16}}>Popular Routes</h2>
        {stats?.popular_routes?.map((r, i) => (
          <div key={i} style={{background:'#374151',padding:12,borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between'}}>
            <span>{r.departure_location} → {r.destination}</span>
            <span>{r.booking_count} bookings</span>
          </div>
        ))}
      </div>
    </div>
  )
}
