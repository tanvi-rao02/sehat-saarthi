
'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send reset link.');
      }

      setMessage(data.message || 'If your account exists, a reset link has been sent.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-center text-teal-700">
          Forgot Password?
        </h1>

        <p className="mb-6 text-center text-gray-600">
          Enter your registered email address to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 p-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center text-sm text-gray-700">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <a href="/auth/login" className="text-teal-700 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </main>
  );
}
