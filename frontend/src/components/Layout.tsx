import { ReactNode, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router';
import { User, Search, Plus } from 'lucide-react';
import LogoHorizontal from '../assets/logo-horizontal.png';

export default function Layout({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    const token = localStorage.getItem('token');
    console.log("[Shorten] Token from localStorage:", token ? "Present (" + token.length + " chars)" : "MISSING");
    
    if (!token) {
      alert('Please log in to shorten a link');
      navigate('/auth');
      return;
    }
    
    try {
      console.log("[Shorten] Sending POST /api/links with Authorization header");
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ original_url: url }),
      });
      console.log("[Shorten] Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        setUrl('');
        navigate(`/links/${data.id}?success=true`);
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        navigate('/auth');
        alert('Your session expired. Please log in again.');
      } else {
        console.error('Failed to shorten link:', res.status);
        const error = await res.json();
        alert(`Failed to shorten link: ${error.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error shortening link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#1E2330] font-sans selection:bg-[#1E2330] selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={LogoHorizontal} alt="live.fyi" className="h-28 w-auto" />
          </Link>
          
          {/* Global Shorten Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleShorten} className="relative group">
              <input 
                type="url" 
                placeholder="Paste your long link here" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#f3f3f1] border-2 border-transparent focus:border-black/20 focus:bg-white rounded-full py-4 px-6 pr-36 outline-none transition-all font-medium text-lg"
              />
              <button 
                type="submit"
                disabled={!url}
                className="absolute right-2 top-2 bottom-2 bg-[#1E2330] hover:bg-black text-white px-6 rounded-full font-bold text-sm transition-all shadow-lg shadow-black/10 disabled:opacity-40 disabled:shadow-none"
              >
                Shorten link
              </button>
            </form>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors md:hidden">
              <Plus size={24} className="text-[#1E2330]" />
            </button>
            {localStorage.getItem('token') ? (
              <div className="relative">
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-12 h-12 bg-[#1E2330] hover:bg-black rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/10 cursor-pointer hover:scale-105 transition-all"
                >
                  <span className="mt-[-1px]">
                    {localStorage.getItem('email') ? localStorage.getItem('email')!.substring(0, 2).toUpperCase() : 'ME'}
                  </span>
                </div>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    
                    {/* Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 mb-2">
                         <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Signed in as</p>
                         <p className="font-bold text-[#1E2330] text-sm truncate">{localStorage.getItem('email') || 'User'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          localStorage.removeItem('token');
                          localStorage.removeItem('email');
                          navigate('/');
                        }}
                        className="w-full text-left px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm transition-colors flex items-center gap-3"
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-[#1E2330] hover:bg-black text-white font-semibold rounded-full text-sm transition-all shadow-lg shadow-black/10 flex items-center gap-2"
              >
                <User size={18} />
                Log in or Sign up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
