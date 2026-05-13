import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function RegisterPage() {
  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role || 'Passenger'
      })
      const res = await api.post('/auth/login/', { username: data.username, password: data.password })
      localStorage.setItem('access_token', res.data.access)
      navigate('/booking')
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Registration failed'
      setError(msg)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#111'}}>
      <div style={{background:'#1f2937',padding:32,borderRadius:12,width:'100%',maxWidth:400}}>
        <h1 style={{color:'white',fontSize:24,textAlign:'center',marginBottom:24}}>Register</h1>
        {error && <div style={{background:'#7f1d1d',color:'#f87171',padding:12,borderRadius:8,marginBottom:16,fontSize:12}}>{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} style={{display:'flex',flexDirection:'column',gap:16}}>
          <input {...register('first_name',{required:true})} placeholder='First Name' style={{padding:12,borderRadius:8,background:'#374151',color:'white',border:'none'}} />
          <input {...register('last_name',{required:true})} placeholder='Last Name' style={{padding:12,borderRadius:8,background:'#374151',color:'white',border:'none'}} />
          <input {...register('username',{required:true})} placeholder='Username' style={{padding:12,borderRadius:8,background:'#374151',color:'white',border:'none'}} />
          <input type='email' {...register('email',{required:true})} placeholder='Email' style={{padding:12,borderRadius:8,background:'#374151',color:'white',border:'none'}} />
          <input type='password' {...register('password',{required:true})} placeholder='Password' style={{padding:12,borderRadius:8,background:'#374151',color:'white',border:'none'}} />
          <select {...register('role')} style={{padding:12,borderRadius:8,background:'#374151',color:'white',border:'none'}}>
            <option value='Passenger'>Passenger</option>
            <option value='Admin'>Admin</option>
          </select>
          <button type='submit' style={{padding:12,borderRadius:8,background:'#2563eb',color:'white',border:'none',cursor:'pointer'}}>Register</button>
        </form>
        <p style={{textAlign:'center',marginTop:16,color:'#9ca3af'}}>
          Have an account? <Link to='/login' style={{color:'#60a5fa'}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
