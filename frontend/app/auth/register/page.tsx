'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e1f5ee 0%, #f8fafc 100%)', fontFamily: 'Inter, sans-serif' };
  const cardStyle = { background: '#fff', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.06)' };

  if (success) return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Check your email!</h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
        <Link href="/auth/login" style={{ display: 'block', padding: '13px', background: '#0d9488', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏥</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0d9488', marginBottom: '4px' }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Free forever. No credit card needed.</p>
        </div>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email address', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Minimum 8 characters' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat your password' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>{field.label}</label>
              <input type={field.type} placeholder={field.placeholder} value={(form as any)[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} required style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ padding: '13px', background: loading ? '#94a3b8' : '#0d9488', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
          Already have an account? <Link href="/auth/login" style={{ color: '#0d9488', fontWeight: 500, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
