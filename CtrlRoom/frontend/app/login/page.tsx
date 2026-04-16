"use client";

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // POST /api/auth/login
    await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    // Redirect or state
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Sign In</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-2">Welcome back to CtrlRoom</p>
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={!email || loading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Google OAuth coming (GOOGLE_CLIENT_ID ready)
        </p>
        <div className="flex space-x-2 text-xs text-gray-400 text-center">
          <a href="/partners" className="hover:underline">Demo Partners</a>
        </div>
      </div>
    </div>
  );
}
