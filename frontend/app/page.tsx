'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '🤖',
    title: 'AI Health Chat',
    desc: 'Get instant health guidance powered by Groq AI.',
    link: '/chat',
  },
  {
    icon: '🏥',
    title: 'Hospital Finder',
    desc: 'Find hospitals, clinics, and pharmacies near you instantly.',
    link: '/hospitals',
  },
  {
    icon: '📋',
    title: 'Report Analyzer',
    desc: 'Upload medical reports and get simple explanations.',
    link: '/medical-reports',
  },
  {
    icon: '🚨',
    title: 'Emergency Mode',
    desc: 'Instant access to ambulance contacts and first aid guides.',
    link: '/emergency',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-teal-600">SehatSaarthi</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/chat" className="text-sm text-gray-600 hover:text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-all">Try Free</Link>
          <Link href="/auth/login" className="text-sm text-gray-600 px-4 py-2">Login</Link>
          <Link href="/auth/register" className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all font-medium">Sign Up Free</Link>
        </div>
      </nav>

      <section className="text-center py-24 px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block bg-teal-100 text-teal-700 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">✨ Powered by Google Gemini AI</span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your AI-Powered<br /><span className="text-teal-600">Healthcare Companion</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get instant health guidance, find nearby hospitals, and analyze medical reports — all free.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/chat" className="px-8 py-4 bg-teal-600 text-white rounded-xl text-lg font-medium hover:bg-teal-700 transition-all shadow-lg shadow-teal-100">Start Chatting Free →</Link>
            <Link href="/emergency" className="px-8 py-4 bg-red-600 text-white rounded-xl text-lg font-medium hover:bg-red-700 transition-all">🚨 Emergency</Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need for your health</h2>
        <p className="text-center text-gray-500 mb-12">All features free. No subscription required.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
  <Link href={f.link} key={i}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-teal-100 transition-all cursor-pointer h-full"
    >
      <div className="text-3xl mb-4">{f.icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
    </motion.div>
  </Link>
))}
        </div>
      </section>

      <section className="bg-teal-600 py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to take control of your health?</h2>
        <p className="text-teal-100 mb-8 text-lg">Join users getting AI-powered health guidance.</p>
        <Link href="/auth/register" className="inline-block bg-white text-teal-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-teal-50 transition-all">Create Free Account →</Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center bg-white">
        <p className="text-sm text-gray-400 mb-4">SehatSaarthi provides educational information only — not a substitute for professional medical advice.</p>
        <div className="flex justify-center gap-6">
          <Link href="/chat" className="text-sm text-gray-500 hover:text-teal-600">Chat</Link>
          <Link href="/hospitals" className="text-sm text-gray-500 hover:text-teal-600">Hospitals</Link>
          <Link href="/emergency" className="text-sm text-gray-500 hover:text-teal-600">Emergency</Link>
        </div>
      </footer>
    </div>
  );
}
