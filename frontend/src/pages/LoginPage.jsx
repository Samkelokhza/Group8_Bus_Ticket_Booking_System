import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function LoginPage() {
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    try {
      setError('')
      setLoading(true)
      
      const res = await api.post('/auth/login/', {
        username: data.username,
        password: data.password
      })
      
      console.log('Login success:', res.data)
      localStorage.setItem('access_token', res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      
      // Fetch user info to check role
      const userRes = await api.get('/auth/me/', {
        headers: { Authorization: Bearer  }
      })
      
      console.log('User info:', userRes.data)
      const roles = userRes.data.roles || []
      
      // Redirect based on role
      if (roles.includes('Admin')) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/passenger'
      }
      
    } catch (err) {
      console.error('Login error:', err.response?.data)
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111827'}}>
      <div style={{background:'#1f2937',padding:32,borderRadius:12,width:'100%',maxWidth:400,boxShadow:'0 4px 6px rgba(0,0,0,0.3)'}}>
        <h1 style={{color:'white',fontSize:24,textAlign:'center',marginBottom:8}}>Bus Ticket System</h1>
        <p style={{color:'#9ca3af',textAlign:'center',marginBottom:24}}>Sign in to your account</p>
        
        {error && (
          <div style={{background:'#7f1d1d',color:'#fca5a5',padding:12,borderRadius:8,marginBottom:16,fontSize:14}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{color:'#d1d5db',fontSize:14,marginBottom:4,display:'block'}}>Username</label>
            <input 
              {...register('username',{required:true})} 
              placeholder='Enter username' 
              style={{width:'100%',padding:12,borderRadius:8,background:'#374151',color:'white',border:'1px solid #4b5563',outline:'none',boxSizing:'border-box'}} 
            />
          </div>
          
          <div>
            <label style={{color:'#d1d5db',fontSize:14,marginBottom:4,display:'block'}}>Password</label>
            <input 
              type='password' 
              {...register('password',{required:true})} 
              placeholder='Enter password' 
              style={{width:'100%',padding:12,borderRadius:8,background:'#374151',color:'white',border:'1px solid #4b5563',outline:'none',boxSizing:'border-box'}} 
            />
          </div>
          
          <button 
            type='submit' 
            disabled={loading}
            style={{padding:12,borderRadius:8,background:loading?'#6b7280':'#2563eb',color:'white',border:'none',cursor:loading?'not-allowed':'pointer',fontSize:16,fontWeight:'bold'}}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{textAlign:'center',marginTop:16,color:'#9ca3af',fontSize:14}}>
          Don't have an account? <Link to='/register' style={{color:'#60a5fa',textDecoration:'none'}}>Register here</Link>
        </p>
      </div>
    </div>
  )
}
