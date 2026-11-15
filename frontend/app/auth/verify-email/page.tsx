
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState('Verifying your email...');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage('Verification token is missing.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL;

        if (!API) {
          throw new Error('API URL is not configured.');
        }

        const response = await fetch(
          `${API}/auth/verify/${encodeURIComponent(token)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Verification failed.');
        }

        setSuccess(true);
        setMessage(data.message || 'Email verified! You can now login.');
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : 'Verification failed.'
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center rounded-xl border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">SehatSaarthi</h1>
        <p className="mb-6">{message}</p>

        {!loading && success && (
          <a
            href="/auth/login"
            className="inline-block rounded-lg bg-teal-600 px-6 py-3 text-white"
          >
            Go to Login
          </a>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-6">
        Loading email verification...
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
