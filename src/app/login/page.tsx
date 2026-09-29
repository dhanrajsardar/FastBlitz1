'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/blitz';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
        setError('Please enter an email and password.');
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push(returnUrl);
    }
  };

  const handleOAuth = async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/blitz`
        }
    });
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#FF5722]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#FF5722] text-3xl shadow-[0_0_30px_rgba(255,87,34,0.3)]">
          ⚡
        </div>
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-gray-400 mt-2">Sign in to your Fastlane account</p>
      </div>

      <button
        onClick={handleOAuth}
        type="button"
        className="w-full flex items-center justify-center space-x-2 bg-white text-black py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0D0F12] text-gray-500">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition"
            required
          />
          {password.length > 0 && (
            <div className="mt-2 flex items-center text-sm text-green-500">
              <span className="mr-2">✔</span>
              Your password meets all the necessary requirements
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white border border-white/10 hover:border-[#FF5722] py-3 px-4 rounded-xl font-medium transition flex items-center justify-center space-x-2"
        >
          <span>Continue</span>
          <span className="text-[#FF5722]">▶</span>
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#0D0F12] text-white">
      {/* Left Column - Social Proof */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 bg-gradient-to-br from-[#1a1c23] to-[#0D0F12] border-r border-white/10">
        <h1 className="text-5xl font-bold mb-6">10x your organic marketing with AI.</h1>
        <p className="text-xl text-gray-400 mb-12">Join 50k+ Businesses driving 150M+ Organic Views.</p>

        <div className="space-y-4">
          {['Reverse-engineer brand DNA in 10s', 'Infinite 9:16 viral video generation', 'Real-time 60fps in-browser rendering', 'Autopilot algorithmic publishing'].map((feature, i) => (
            <div key={i} className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl backdrop-blur-md">
              <div className="text-[#FF5722]">⚡</div>
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>

        {/* Floating Cookie Card */}
        <div className="absolute bottom-8 right-8 bg-[#1a1c23] border border-white/10 p-4 rounded-xl max-w-sm flex items-center space-x-4 shadow-2xl">
          <p className="text-sm text-gray-300 flex-1">We use cookies to measure ads and improve performance.</p>
          <div className="flex space-x-2">
            <button className="text-xs px-3 py-1.5 text-gray-400 hover:text-white transition">Decline</button>
            <button className="text-xs px-3 py-1.5 bg-[#FF5722] text-white rounded-lg hover:bg-[#EA580C] transition">Allow</button>
          </div>
        </div>
      </div>
    </div>
  );
}
