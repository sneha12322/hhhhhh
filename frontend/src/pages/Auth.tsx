import { useState, useEffect } from 'react';
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

  // Check for OAuth errors in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      setError(`Login failed: ${decodeURIComponent(oauthError)}`);
    }
  }, [location.search]);

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

  const loginWithGoogle = () => {
    window.location.href = api('/api/auth/google');
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl py-3 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>

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