import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const error = params.get('error');

    if (error) {
      console.error("[AuthCallback] Error parameter:", error);
      navigate(`/auth?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!token || !email) {
      console.error("[AuthCallback] Missing token or email");
      navigate('/auth?error=missing_params');
      return;
    }

    try {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      console.log("[AuthCallback] Token and email stored in localStorage");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("[AuthCallback] Failed to store in localStorage:", err);
      navigate(`/auth?error=${encodeURIComponent('storage_failed')}`);
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}
