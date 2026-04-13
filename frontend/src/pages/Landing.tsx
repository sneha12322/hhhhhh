import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Link as LinkIcon, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import LogoHorizontal from '../assets/logo-horizontal.png';
import { api } from '../lib/api';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Fail-safe: Check for token/email in URL (handles case where /auth-callback path is stripped)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    if (token && email) {
      console.log("[Landing] OAuth token found at root URL, completing login fallback...");
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      // Remove tokens from URL and go to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const shortUrl = result ? `${window.location.origin}/${result.slug}` : '';

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    const token = localStorage.getItem('token');
    console.log("[Landing Shorten] Token from localStorage:", token ? "Present" : "MISSING (guest)");
    
    setLoading(true);
    try {
      // Authenticated users go to dashboard flow
      if (token) {
        const res = await fetch(api('/api/links'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ original_url: url }),
        });
        if (res.ok) {
          const data = await res.json();
          navigate(`/links/${data.id}?success=true`);
          return;
        }
      }

      // Guest: create link and show result inline (no auth required)
      const res = await fetch(api('/api/links'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_url: url }),
      });
      console.log("[Landing Shorten] Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setUrl('');
      } else {
        alert('Failed to shorten link. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Error shortening link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F1] text-[#1E2330] font-sans selection:bg-[#D2E823] selection:text-[#1E2330]">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <img src={LogoHorizontal} alt="live.fyi" className="h-28 w-auto" />
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 bg-[#E9EAE8] hover:bg-[#DFE0DE] px-5 py-2.5 rounded-full font-semibold transition-colors"
        >
          🔑 Log in or Sign up
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-12"
        >
          Short and sweet 😇<br />just like you
        </motion.h1>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="max-w-2xl mx-auto bg-[#1E2330] p-6 rounded-3xl shadow-2xl text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#D2E823] rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-[#1E2330]" />
                </div>
                <p className="text-white font-black text-lg">Your short link is ready!</p>
              </div>
              <p className="text-white/40 text-sm font-medium mb-5 truncate">↳ {result.original_url}</p>
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                <span className="flex-1 text-white font-black font-mono text-lg pl-3 truncate">
                  {window.location.origin}/{result.slug}
                </span>
                <button
                  onClick={handleCopy}
                  className="bg-[#D2E823] hover:bg-yellow-300 text-[#1E2330] px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 shrink-0"
                >
                  {copied ? <><CheckCircle2 size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 px-1">
                <button
                  onClick={() => { setResult(null); setUrl(''); }}
                  className="text-white/40 hover:text-white text-sm font-bold transition-colors"
                >
                  ← Shorten another
                </button>
                <Link
                  to="/dashboard"
                  className="text-sm font-bold text-[#D2E823] hover:underline"
                >
                  Sign up to track analytics →
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleShorten} 
              className="max-w-2xl mx-auto bg-white p-2 rounded-full shadow-xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center pl-6">
                <LinkIcon className="text-gray-400 mr-3" size={24} />
                <input
                  type="url"
                  required
                  placeholder="Paste your long link here"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full py-4 text-lg outline-none bg-transparent placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url}
                className="bg-[#1E2330] hover:bg-black text-white px-8 py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Shorten link'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>

      {/* FAQs */}
      <section className="bg-white py-24 px-6 rounded-t-[3rem]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12">FAQs</h2>
          
          <div className="space-y-8">
            <FAQItem 
              question="What is live.fyi?" 
              answer="live.fyi is a versatile link shortening & QR code service designed to simplify the way we share links online. It allows you to create compact, memorable links and QR codes that redirect to longer URLs of your choice."
            />
            <FAQItem 
              question="What is a link shortener?" 
              answer="A link shortener, like live.fyi, is a tool that condenses long URLs into shorter, more manageable links. These shortened URLs retain the functionality of the original link and are easier to share across social media platforms, emails, and messaging apps."
            />
            <FAQItem question="Why is link shortening important?" answer="Short links are cleaner, more trustworthy, and take up less space. They also allow you to track clicks and understand your audience better." />
            <FAQItem question="What sort of links can I shorten?" answer="You can shorten almost any valid URL, including links to your website, social profiles, videos, articles, and more." />
            <FAQItem question="Is there a limit to how many links I can shorten with live.fyi?" answer="No, you can shorten as many links as you need!" />
            <FAQItem question="Do shortened links expire with live.fyi?" answer="No, your live.fyi links will never expire as long as your account is active." />
            <FAQItem 
              question="How can I track the performance of my shortened links?" 
              answer="live.fyi provides comprehensive analytics with each shortened link, including the number of clicks, geographic location of your visitors, referrer information and device types."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E2330] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src={LogoHorizontal} alt="live.fyi" className="h-20 w-auto brightness-0 invert" />
            </div>
            <p className="text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">
              The fastest way to share and track your links. built for the modern web.
            </p>
            <p className="text-gray-500 text-xs">
              &copy; 2026 live.fyi Inc.<br />
              All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-6 text-lg">Help & Info</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">What does a short link do?</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How do URL shorteners work?</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How to get a QR code for a link</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How to shorten a URL</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Company</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trust & legal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy notice</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-xl font-bold mb-3">{question}</h3>
      <p className="text-gray-600 leading-relaxed">{answer}</p>
    </div>
  );
}
