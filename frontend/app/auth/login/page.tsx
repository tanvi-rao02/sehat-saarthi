'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
     const redirectTo = new URLSearchParams(window.location.search).get('redirect');

router.push(
  redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
    ? redirectTo
    : '/chat'
);  
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e1f5ee 0%, #f8fafc 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏥</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0d9488', marginBottom: '4px' }}>SehatSaarthi</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Login to your account</p>
        </div>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>Email address</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link href="/auth/forgot-password" style={{ fontSize: '13px', color: '#0d9488', textDecoration: 'none' }}>Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} style={{ padding: '13px', background: loading ? '#94a3b8' : '#0d9488', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          No account? <Link href="/auth/register" style={{ color: '#0d9488', fontWeight: 500, textDecoration: 'none' }}>Sign up free</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px' }}>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}