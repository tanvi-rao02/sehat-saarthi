
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!token) {
      setMessage('Reset token is missing. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setSuccess(true);
      setMessage(data.message || 'Password reset successfully!');
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
          Reset Password
        </h1>

        <p className="mb-6 text-center text-gray-600">
          Create a new password for your SehatSaarthi account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
          />

          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-teal-600"
          />

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-teal-600 p-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center text-sm text-gray-700">
            {message}
          </p>
        )}

        {success && (
          <div className="mt-5 text-center">
            <a
              href="/auth/login"
              className="font-semibold text-teal-700 hover:underline"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

