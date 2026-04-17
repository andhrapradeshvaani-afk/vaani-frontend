'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:3001';

export default function OfficerLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/api/officers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('officer_token', data.token);
      localStorage.setItem('officer_name',  data.officer.name);
      localStorage.setItem('officer_role',  data.officer.role);
      router.push('/officer/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'50%',background:'var(--ap-navy)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:'20px',fontWeight:'700',color:'var(--ap-gold)'}}>V</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:'var(--ap-navy)'}}>Vaani Officer Portal</div>
          <div style={{fontSize:'13px',color:'var(--text-2)',marginTop:'4px'}}>Government officials only</div>
        </div>

        <div className="card">
          {error && <div className="alert alert-error" style={{marginBottom:'16px'}}>{error}</div>}
          <form onSubmit={login}>
            <div className="form-group">
              <label className="form-label">Official email</label>
              <input className="form-input" type="email" value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="officer@vaani.in" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'8px'}}>
              {loading ? 'Logging in...' : 'Login to dashboard'}
            </button>
          </form>
        </div>

        <div style={{textAlign:'center',marginTop:'20px',fontSize:'12px',color:'var(--text-3)'}}>
          Vaani · వాణి · AP Grievance Portal · Officers only
        </div>
      </div>
    </div>
  );
}
