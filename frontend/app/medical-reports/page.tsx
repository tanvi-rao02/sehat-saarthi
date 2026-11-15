
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

interface MedicalReport {
  _id: string;
  originalName: string;
  fileType: string;
  summary?: string;
  keyFindings?: string[];
  simplifiedTerms?: { term: string; explanation: string }[];
  questionsForDoctor?: string[];
  rawExtractedText?: string;
  analysisStatus: string;
  createdAt: string;
}

export default function MedicalReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadReports = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API}/reports`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();

      if (response.ok) {
        setReports(data.reports || []);
      } else {
        setError(data.message || 'Unable to load reports.');
      }
    } catch {
      setError('Could not connect to the backend.');
    }
  }, []);

  useEffect(() => {
  const savedToken = localStorage.getItem('token');

  if (!savedToken) return;

  fetch(`${API}/reports`, {
    headers: {
      Authorization: `Bearer ${savedToken}`,
    },
  })
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load reports.');
      }

      return data;
    })
    .then((data) => {
      setReports(data.reports || []);
    })
    .catch((err) => {
      setError(err instanceof Error ? err.message : 'Could not load reports.');
    });
}, []);

  async function uploadReport() {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please log in before uploading a report.');
      return;
    }

    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setError('');
    setMessage('');

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be 10 MB or less.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API}/reports/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Report upload failed.');
      }

      const report = data.report as MedicalReport;

      setReports((previous) => [
        report,
        ...previous.filter((item) => item._id !== report._id),
      ]);

      setSelectedReport(report);
      setFile(null);

      const input = document.getElementById('report-file') as HTMLInputElement;
      if (input) input.value = '';

      setMessage(
        report.analysisStatus === 'completed'
          ? 'Report uploaded and analyzed successfully!'
          : 'Report uploaded, but AI analysis failed.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteReport(id: string) {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Please log in first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete report.');
      }

      setReports((previous) => previous.filter((report) => report._id !== id));

      if (selectedReport?._id === id) {
        setSelectedReport(null);
      }

      setMessage('Report deleted successfully.');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete report.');
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-5 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <Link href="/" className="text-teal-600 text-sm font-medium">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              Medical Report Analyzer
            </h1>
            <p className="text-gray-500 mt-2">
              Understand your medical reports with AI-powered explanations.
            </p>
          </div>
          <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium">
            ✨ Powered by Groq AI
          </span>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Upload Your Medical Report
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Supported formats: PDF, JPG, JPEG, PNG and WEBP. Maximum size: 10 MB.
          </p>

          <input
            id="report-file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError('');
              setMessage('');
            }}
            className="block w-full text-sm text-gray-600 border border-gray-200 rounded-xl p-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-semibold"
          />

          {file && (
            <p className="text-sm text-gray-600 mt-3">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}

          <button
            onClick={uploadReport}
            disabled={!file || loading}
            className="mt-5 bg-teal-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Uploading and Analyzing...' : 'Upload & Analyze Report'}
          </button>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-4 text-sm text-teal-700">{message}</p>}

          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login?redirect=/medical-reports"  className="text-teal-700 font-semibold">
              Login
            </Link>
          </p>
        </section>

        {selectedReport && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  AI Analysis Results
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedReport.originalName}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                {selectedReport.analysisStatus.toUpperCase()}
              </span>
            </div>

            {selectedReport.analysisStatus === 'completed' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">📋 Summary</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedReport.summary || 'No summary available.'}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">🔍 Key Findings</h3>
                  {selectedReport.keyFindings?.length ? (
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      {selectedReport.keyFindings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No findings available.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">
                    📖 Simplified Medical Terms
                  </h3>
                  {selectedReport.simplifiedTerms?.length ? (
                    <div className="space-y-3">
                      {selectedReport.simplifiedTerms.map((item, index) => (
                        <div key={index} className="bg-teal-50 rounded-xl p-4">
                          <p className="font-semibold text-teal-800">{item.term}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No simplified terms available.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-2">
                    💬 Questions to Ask Your Doctor
                  </h3>
                  {selectedReport.questionsForDoctor?.length ? (
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      {selectedReport.questionsForDoctor.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No questions available.</p>
                  )}
                </div>

                {selectedReport.rawExtractedText && (
                  <details className="border border-gray-200 rounded-xl p-4">
                    <summary className="cursor-pointer font-semibold text-gray-700">
                      View Extracted Text
                    </summary>
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 mt-4">
                      {selectedReport.rawExtractedText}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <p className="text-red-600">
                The report was uploaded, but AI analysis could not be completed.
                Please check the original report with your doctor.
              </p>
            )}
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Previous Reports
          </h2>

          {reports.length === 0 ? (
            <p className="text-gray-500 text-sm">No reports uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="flex flex-wrap justify-between items-center gap-3 border border-gray-100 rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      📄 {report.originalName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.createdAt).toLocaleString()}
                      {' · '}
                      {report.analysisStatus}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-sm text-teal-700 font-semibold hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => deleteReport(report._id)}
                      className="text-sm text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-gray-400 mt-8">
          SehatSaarthi provides educational information only. It does not
          diagnose conditions or replace professional medical advice.
        </p>
      </div>
    </main>
  );
}
