import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import LogoHorizontal from '../assets/logo-horizontal.png';
import { api } from '../lib/api';

function isValidEmail(email: string) {
  return /^([\w-.]+)@([\w-]+\.)+([\w-]{2,})$/.test(email);
}

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login';

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(api('/api/auth/request-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Unable to send OTP');
      setMessage('OTP sent. Check your inbox.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Enter OTP code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(api('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Invalid OTP');
      
      console.log("[Auth] OTP verified successfully. Token received:", body.token ? "Yes (" + body.token.length + " chars)" : "No");
      localStorage.setItem('token', body.token);
      localStorage.setItem('email', email);
      console.log("[Auth] Token saved to localStorage. Stored value:", localStorage.getItem('token') ? "Present" : "Missing");
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center -mt-6 md:-mt-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="flex justify-center mb-8">
          <img src={LogoHorizontal} alt="live.fyi" className="h-32 w-auto" />
        </div>
        <h1 className="text-3xl font-black mb-4">{mode === 'signup' ? 'Sign up' : 'Login'}</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to get one-time code.</p>

        <div className="space-y-4">
          <div>
            <label className="font-semibold text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E2330]"
              disabled={step === 'otp'}
            />
          </div>

          {step === 'otp' && (
            <div>
              <label className="font-semibold text-sm text-gray-700">OTP code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E2330]"
              />
            </div>
          )}

          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {step === 'email' ? (
            <button
              onClick={requestOtp}
              className="w-full bg-[#1E2330] text-white font-black rounded-xl py-3 hover:bg-black transition"
              disabled={loading}
            >
              {loading ? 'Sending...' : mode === 'signup' ? 'Send Signup Code' : 'Send Login Code'}
            </button>
          ) : (
            <button
              onClick={verifyOtp}
              className="w-full bg-[#1E2330] text-white font-black rounded-xl py-3 hover:bg-black transition"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          )}

          <div className="text-center text-gray-500 text-sm">
            {mode === 'signup' ? (
              <span>
                Already have an account?{' '}
                <Link to="/login" className="text-[#1E2330] font-bold">Login</Link>
              </span>
            ) : (
              <span>
                New user?{' '}
                <Link to="/login?mode=signup" className="text-[#1E2330] font-bold">Sign up</Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}