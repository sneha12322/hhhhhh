import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Copy, Download, Trash2, Info, Loader2, Search, CheckCircle2, Palette, Globe, ChevronDown, MoreVertical, Tag, Zap, QrCode } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import Icon_B from '../assets/Icon_B.png';
import { api } from '../lib/api';

interface LinkData {
  id: string;
  original_url: string;
  slug: string;
  title: string | null;
  tags: string[];
  channels: any[];
}

interface AnalyticsData {
  totalVisits: number;
  uniqueVisits: number;
  clicksByChannel: any[];
  clicksByDevice: any[];
  clicksByReferrer: any[];
  clicksByCity: any[];
  clicksByCountry: any[];
  timeline: any[];
  channelPerformance?: any[];
}

export default function LinkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [link, setLink] = useState<LinkData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [newChannelName, setNewChannelName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardColor, setCardColor] = useState(() => localStorage.getItem(`link_color_${id}`) || '#1E2330');
  const [timeframe, setTimeframe] = useState('30d');
  const [showMore, setShowMore] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tempTag, setTempTag] = useState('');
  const [selectedQR, setSelectedQR] = useState<{slug: string, name: string} | null>(null);
  const [geoView, setGeoView] = useState('map');
  const [hoveredCountry, setHoveredCountry] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEditingTag && !(e.target as HTMLElement).closest('.tag-container')) {
        setIsEditingTag(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isEditingTag]);

  const themeColors = [
    '#1E2330', // Default Charcoal
    '#4F46E5', // Indigo
    '#7C3AED', // Violet
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#8B5CF6', // Purple
    '#F97316', // Orange
  ];

  const cycleColor = () => {
    const currentIndex = themeColors.indexOf(cardColor);
    const nextIndex = (currentIndex + 1) % themeColors.length;
    const newColor = themeColors[nextIndex];
    setCardColor(newColor);
    if (id) {
      localStorage.setItem(`link_color_${id}`, newColor);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, timeframe]);

  useEffect(() => {
    // Check for success param from search/redirect
    const params = new URLSearchParams(location.search);
    if (params.get('success')) {
      setShowSuccessToast(true);
      const fromGuest = params.get('fromGuest') === 'true';
      
      // For guest links, automatically navigate to channels tab to show the short URL
      if (fromGuest) {
        setActiveTab('channels');
      }
      
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        // Clean URL
        navigate(location.pathname, { replace: true });
      }, 6000);
      return () => clearTimeout(timer);
    }
    
    // Check for tagging param to auto-open
    if (params.get('tagging')) {
      setIsEditingTag(true);
      // Clean URL
      navigate(location.pathname, { replace: true });
    }
  }, [location]);

  const addTag = async (tagStr: string) => {
    if (!link || !tagStr.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(api(`/api/links/${link.id}/tags`), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tag: tagStr.trim() }),
      });
      // Refresh local state or re-fetch
      setLink({ ...link, tags: [...(link.tags || []), tagStr.trim()] });
      setTempTag('');
      // Don't close input (setIsEditingTag(false) removed)
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTag = async (tagStr: string) => {
    if (!link) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(api(`/api/links/${link.id}/tags/${tagStr}`), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setLink({ ...link, tags: link.tags.filter(t => t !== tagStr) });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTimeframeChange = (newTf: string) => {
    setAnalytics(null); // Clear data to show loader during transition
    setTimeframe(newTf);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [linkRes, analyticsRes] = await Promise.all([
        fetch(api(`/api/links/${id}`), { headers }),
        fetch(api(`/api/links/${id}/analytics?timeframe=${timeframe}&_t=${Date.now()}`), { headers })
      ]);
      
      if (!linkRes.ok) throw new Error('Failed to fetch link details');
      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');

      const linkData = await linkRes.json();
      setLink(linkData);
      setAnalytics(await analyticsRes.json());
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load link data');
    }
  };

  const handleAddChannel = async (name: string) => {
    if (!name) return;
    const token = localStorage.getItem('token');
    await fetch(api(`/api/links/${id}/channels`), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name })
    });
    setNewChannelName('');
    fetchData();
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (channelName === 'Direct') {
      alert("You cannot delete the primary 'Direct' channel.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the channel '${channelName}'? This will also wipe its tracking history.`)) return;
    
    const token = localStorage.getItem('token');
      const res = await fetch(api(`/api/links/${link.id}/channels/${channelId}`), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    fetchData();
  };

  const copyToClipboard = (shortUrl: string, channelId: string) => {
    const fullUrl = `${window.location.origin}/${shortUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(channelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadLargeQR = (slug: string) => {
    const canvas = document.getElementById(`large-qr-${slug}`) as HTMLCanvasElement;
    if (canvas) {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext("2d");
      
      if (ctx) {
        ctx.fillStyle = "#ffffff"; // Use white background for download
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(canvas, 0, 0);
      }
      
      const pngFile = finalCanvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${slug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    }
  };

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-red-500">
      <p className="font-bold text-lg mb-2">Oops! Something went wrong.</p>
      <p>{error}</p>
      <Link to="/dashboard" className="mt-4 text-black underline">Go back to dashboard</Link>
    </div>
  );

  if (!link || !analytics) return (
    <div className="flex items-center justify-center h-64 text-[#1E2330]">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="w-full pb-24 px-4 relative">
      <AnimatePresence>
        {showSuccessToast && link && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 bg-[#1E2330] text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-between gap-10 min-w-[550px] backdrop-blur-xl"
          >
            {/* Direct channel short URL display */}
            {link.channels && link.channels.length > 0 && link.channels[0]?.name === 'Direct' ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D2E823] rounded-full flex items-center justify-center text-black shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight text-white">Your short URL is ready!</p>
                    <p className="text-white/60 font-bold text-sm leading-tight font-mono">live.fyi/{link.channels[0].short_url}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const directChannel = link.channels[0];
                    copyToClipboard(directChannel.short_url, directChannel.id);
                    setCopiedId(directChannel.id);
                  }}
                  className="bg-white/10 hover:bg-[#D2E823] hover:text-black px-6 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  {copiedId === link.channels[0]?.id ? (
                    <>
                      <CheckCircle2 size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy URL
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#D2E823] rounded-full flex items-center justify-center text-black shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight text-white">Success!</p>
                    <p className="text-white/60 font-bold text-sm leading-tight">Link is ready. Want to add a tag now?</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setShowSuccessToast(false);
                    setIsEditingTag(true);
                  }}
                  className="bg-white/10 hover:bg-[#D2E823] hover:text-black px-6 py-2.5 rounded-full text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Tag size={16} />
                  Manage Tags
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1E2330] mb-8 font-bold transition-all hover:-translate-x-1">
          <ArrowLeft size={18} /> Back to links
        </Link>
        
        {link && (
          <motion.div 
            animate={{ backgroundColor: cardColor }}
            className="rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group relative shadow-2xl transition-colors duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none"></div>
            
            <div className="flex-1 min-w-0 w-full text-left relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight break-all">
                  live.fyi/{link.slug}
                </h3>
              </div>
              <p className="text-white/60 text-lg truncate mb-8 max-w-2xl font-medium">
                {link.original_url}
              </p>
              <div className="flex flex-col gap-4 relative tag-container">
                <div className="flex flex-wrap gap-2 items-center">
                  {link.tags && link.tags.length > 0 ? (
                    <>
                      {link.tags.map((tag, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/10 text-white/90 px-5 py-2 rounded-full text-sm font-bold border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 group/tag backdrop-blur-md"
                        >
                          <Tag size={12} className="opacity-50" />
                          {tag}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTag(tag);
                            }}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10 opacity-0 group-hover/tag:opacity-100 transition-all ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          setIsEditingTag(!isEditingTag);
                          setTempTag('');
                        }}
                        className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all text-xl backdrop-blur-md"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsEditingTag(true);
                        setTempTag('');
                      }}
                      className="bg-white/10 text-white/70 hover:text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10 hover:border-white/20 flex items-center gap-2 backdrop-blur-md"
                    >
                      <Tag size={14} />
                      + Add a tag
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isEditingTag && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full mb-1 left-0 bg-white rounded-[2rem] shadow-2xl p-2 flex items-center gap-2 border border-black/5 z-[60] w-[320px]"
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="Tag name..."
                        value={tempTag}
                        onChange={(e) => setTempTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addTag(tempTag);
                          if (e.key === 'Escape') setIsEditingTag(false);
                        }}
                        className="flex-1 bg-transparent px-6 py-3 outline-none font-bold text-[#1E2330]"
                      />
                      <button 
                        onClick={() => addTag(tempTag)}
                        className="bg-[#1E2330] hover:bg-black text-white px-6 py-3 rounded-full font-black text-sm whitespace-nowrap shadow-lg shadow-black/10"
                      >
                        Add tag
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 relative z-10">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${link.slug}`);
                  setCopiedId(link.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="flex-1 md:w-20 md:h-20 aspect-square bg-white text-[#1E2330] rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl font-bold"
                title="Copy URL"
              >
                {copiedId === link.id ? <CheckCircle2 size={28} /> : <Copy size={28} />}
              </button>
              <div 
                onClick={() => {
                  const qrChannel = link.channels?.find(c => c.name === 'QR');
                  setSelectedQR({ 
                    slug: qrChannel?.short_url || link.slug, 
                    name: qrChannel ? 'QR' : 'Direct' 
                  });
                }}
                className="flex-1 md:w-20 md:h-20 aspect-square bg-white/10 text-white rounded-[2rem] flex items-center justify-center border border-white/20 cursor-pointer overflow-hidden p-4 shadow-xl backdrop-blur-md hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                title="Enlarge QR Code"
              >
                <QRCodeSVG 
                  value={`${window.location.origin}/${link.channels?.find(c => c.name === 'QR')?.short_url || link.slug}`} 
                  size={128} 
                  bgColor="#ffffff" 
                  fgColor="#1E2330" 
                  level="H"
                  imageSettings={{
                    src: Icon_B,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowMore(!showMore)}
                  className="p-4 text-white/40 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                >
                  <MoreVertical size={28} />
                </button>
                
                <AnimatePresence>
                  {showMore && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-4 w-56 bg-[#1A1A1A] border border-white/5 rounded-3xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                      >
                        <button 
                          onClick={async () => {
                            if (!confirm('Are you sure you want to delete this link?')) return;
                            const token = localStorage.getItem('token');
                            await fetch(`/api/links/${link.id}`, { 
                              method: 'DELETE',
                              headers: token ? { Authorization: `Bearer ${token}` } : {},
                            });
                            navigate('/dashboard');
                          }}
                          className="w-full text-left px-8 py-5 text-red-500 hover:text-white hover:bg-red-500 font-bold transition-all flex items-center gap-4 group"
                        >
                          <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                          Delete link
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Button-style Navigation */}
      <div className="overflow-x-auto mb-14 pb-2 scrollbar-hide">
        <div className="flex items-center gap-4 overflow-visible py-3 px-1">
        {['Performance', 'Behavior', 'Channels'].map((tab, i) => {
          const isActive = activeTab === tab.toLowerCase();
          return (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              whileHover={{ 
                rotate: i % 2 === 0 ? 2 : -2,
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
              className={`px-10 py-4 rounded-full font-black text-lg transition-all border-2 shadow-sm whitespace-nowrap ${
                isActive 
                  ? 'bg-[#1E2330] text-white border-[#1E2330]' 
                  : 'bg-white text-[#1E2330] border-gray-100 hover:border-gray-200'
              }`}
            >
              {tab}
            </motion.button>
          );
        })}
        <motion.button 
          onClick={cycleColor}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-[#1E2330] hover:border-[#1E2330] hover:text-black transition-all shadow-sm shrink-0"
          title="Change card color"
        >
          <Palette size={24} />
        </motion.button>
        </div>
      </div>

      {/* Performance Tab Content */}
      {activeTab === 'performance' && (
        <div className="space-y-16">
          {/* Main Chart */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
              <h3 className="text-2xl font-black">Performance over time</h3>
              <div className="flex bg-[#DDE0E2] p-1.5 rounded-2xl shadow-sm border border-black/5">
                {[
                  { id: '24h', label: '24h' },
                  { id: '7d', label: '7d' },
                  { id: '30d', label: '30d' },
                  { id: '60d', label: '60d' }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => handleTimeframeChange(tf.id)}
                    className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                      timeframe === tf.id 
                        ? 'bg-[#1A1A1A] text-white shadow-lg' 
                        : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
            <motion.div 
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-[#DDE0E2] p-8 md:p-12 rounded-[3rem] shadow-sm border border-black/5 min-h-[450px]"
            >
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(() => {
                    const now = new Date();
                    const dates = [];
                    const rangeMap: Record<string, number> = { '24h': 24, '7d': 7, '30d': 30, '60d': 60 };
                    const days = rangeMap[timeframe] || 7;

                    // 1. Create a map of existing click data for quick lookup
                    const clickMap: Record<string, number> = {};
                    analytics.timeline.forEach(p => {
                      clickMap[p.date] = p.count;
                    });

                    // 2. Generate the full range of points
                    if (timeframe === '24h') {
                      // Hourly points for the last 24 hours
                      for(let i = 24; i >= 0; i--) {
                        const d = new Date(now.getTime() - i * 3600000);
                        // Format to match SQLite strftime('%Y-%m-%d %H') in UTC
                        const year = d.getUTCFullYear();
                        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(d.getUTCDate()).padStart(2, '0');
                        const hour = String(d.getUTCHours()).padStart(2, '0');
                        const key = `${year}-${month}-${day} ${hour}`;
                        
                        // We store the original Date object or ISO for the formatter to use local time
                        dates.push({ 
                          date: d.toISOString(), 
                          count: clickMap[key] || 0 
                        });
                      }
                    } else {
                      // Daily points for the last X days
                      for(let i = days; i >= 0; i--) {
                        const d = new Date(now);
                        d.setDate(d.getDate() - i);
                        const dateStr = d.toISOString().split('T')[0];
                        dates.push({ date: dateStr, count: clickMap[dateStr] || 0 });
                      }
                    }
                    return dates;
                  })()}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.12)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      minTickGap={timeframe === '24h' ? 0 : 60}
                      tickFormatter={(str) => {
                        const d = new Date(str);
                        if (isNaN(d.getTime())) return str;
                        if (timeframe === '24h') return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                      tick={{fill: '#000000', fontSize: 13, fontWeight: '700'}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#000000', fontSize: 13, fontWeight: '700'}} 
                    />
                    <Tooltip 
                      content={({ active, payload: activePayload }) => {
                        if (!active || !activePayload || !activePayload.length) return null;
                        const d = new Date(activePayload[0].payload.date);
                        return (
                          <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-1 ring-1 ring-black/5">
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">
                              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[#1E2330] font-black text-lg">
                              {timeframe === '24h' 
                                ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                                : 'Daily Total'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-2 h-2 rounded-full bg-[#1E2330]"></span>
                              <p className="font-black text-xl text-[#1E2330]">
                                {activePayload[0].value} <span className="text-sm text-gray-400 uppercase">clicks</span>
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#000000" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Core Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
            <div className="flex flex-col gap-8">
              <h3 className="text-xl font-bold text-center">Total visits</h3>
              <div className="bg-[#DDE0E2] p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center min-h-[450px] shadow-sm">
                <p className="text-8xl font-black text-[#1A1A1A] mb-8 leading-none tracking-tighter">{analytics.totalVisits}</p>
                <p className="text-[#1A1A1A]/40 font-bold px-6 leading-tight">Donuts. Share the link to get this number up!</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-8">
              <h3 className="text-xl font-bold text-center">Total unique visitors</h3>
              <div className="bg-[#DDE0E2] p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center min-h-[450px] shadow-sm">
                <p className="text-8xl font-black text-[#1A1A1A] mb-8 leading-none tracking-tighter">{analytics.uniqueVisits || 0}</p>
                <p className="text-[#1A1A1A]/40 font-bold px-6 leading-tight">Your true audience reach.</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h3 className="text-xl font-bold text-center">By referrer</h3>
              <BehaviorCard data={analytics.clicksByReferrer} dataKey="referrer" columns={['Platform', 'Visits']} className="!h-[450px]" />
            </div>
          </div>

          {/* Behavior Breakdown Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8">
            <div className="flex flex-col gap-8">
              <h3 className="text-xl font-bold text-center">By device</h3>
              <BehaviorCard 
                data={(() => {
                  // Show all detected devices, but ensure our main ones have a default 0 if missing
                  const merged: Record<string, number> = { 'Phone': 0, 'Tablet': 0, 'Desktop': 0 };
                  analytics.clicksByDevice.forEach(d => {
                    merged[d.device] = d.count;
                  });
                  return Object.entries(merged)
                    .map(([device, count]) => ({ device, count }))
                    .sort((a, b) => b.count - a.count);
                })()} 
                dataKey="device" 
                columns={['Device', 'Visits']} 
                className="!h-[450px]" 
              />
            </div>
            <div className="flex flex-col gap-8">
              <h3 className="text-xl font-bold text-center">By marketing channel</h3>
              <BehaviorCard 
                data={(() => {
                  // Show all channels (Direct, QR, and any custom ones like Instagram/Facebook)
                  const merged: Record<string, number> = { 'Direct': 0, 'QR': 0 };
                  analytics.clicksByChannel.forEach(c => {
                    merged[c.name] = c.count;
                  });
                  return Object.entries(merged)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);
                })()} 
                dataKey="name" 
                columns={['Channel', 'Visits']} 
                className="!h-[450px]" 
              />
            </div>
          </div>

          {/* Geographic Breakdown - Unified Headers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="md:col-span-1 flex items-center justify-center">
              <h3 className="text-xl font-bold tracking-tight">By city</h3>
            </div>
            <div className="md:col-span-2 flex justify-between items-center px-4 relative">
              <span className="flex-1"></span>
              <h3 className="text-xl font-bold tracking-tight text-center">By country</h3>
              <div className="flex-1 flex justify-end">
                {/* Custom View Toggle Dropdown */}
                <div className="relative group/dropdown">
                  <button className="bg-white border-2 border-gray-100 text-sm font-black rounded-2xl px-6 py-2.5 flex items-center gap-3 hover:border-gray-200 transition-all shadow-sm shrink-0">
                    {geoView === 'map' ? 'Map' : 'Table'} <ChevronDown size={14} className="text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-[60]">
                    <button 
                      onClick={() => setGeoView('map')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${geoView === 'map' ? 'bg-gray-100 text-[#1E2330]' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      Map
                    </button>
                    <button 
                      onClick={() => setGeoView('table')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${geoView === 'table' ? 'bg-gray-100 text-[#1E2330]' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Breakdown - Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* By City - 1 part */}
            <div className="md:col-span-1">
              <BehaviorCard data={analytics.clicksByCity} dataKey="city" columns={['City', 'Visits']} emptyMsg="No data... yet!" className="!h-[450px]" />
            </div>
            
            {/* By Country Map - 2 parts */}
            <div className="md:col-span-2 relative">
              <div className="bg-[#DDE0E2] rounded-[2.5rem] overflow-hidden flex flex-col relative h-[450px] shadow-sm p-0 m-0 border-none">
                {geoView === 'map' ? (
                  <div className="w-full h-full relative p-0 m-0 overflow-hidden">
                    <InteractiveMap data={analytics.clicksByCountry} onHover={setHoveredCountry} />
                  </div>
                ) : (
                  <BehaviorCard data={analytics.clicksByCountry} dataKey="country" columns={['Country', 'Visits']} className="!h-full" />
                )}
              </div>

              {/* Tooltip OUTSIDE the clipping container */}
              {hoveredCountry && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute bg-white text-black px-8 py-4 rounded-[2rem] shadow-xl z-[70] pointer-events-none flex flex-row items-center gap-12 border border-gray-100 min-w-[240px] justify-between"
                  style={{ 
                    left: hoveredCountry.x, 
                    top: hoveredCountry.y - 60, 
                    transform: 'translateX(-50%)'
                  }}
                >
                  <span className="text-lg font-bold tracking-tight">{hoveredCountry.name}</span>
                  <span className="text-lg font-medium opacity-90">{hoveredCountry.count ?? 0} visits</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Behavior Tab Content */}
      {activeTab === 'behavior' && (
        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-4 mb-10">
               <div className="w-12 h-1 bg-[#1E2330] rounded-full"></div>
               <h2 className="text-4xl font-black tracking-tight">Behavior & SEO</h2>
            </div>
            <div className="bg-[#DDE0E2] p-8 md:p-12 rounded-[3rem] shadow-sm border border-black/5">
              <SEOAnalyzer url={link.original_url} />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="UTM Tags" 
              desc="Simple & easy customisation of UTM tags" 
              icon="🏷️" 
              btnColor="bg-[#DDE0E2] text-[#1E2330]"
            />
            <FeatureCard 
              title="Cloaking" 
              desc="Keep your links looking sleek by keeping our URL in the address bar" 
              icon="🎭" 
              btnColor="bg-[#DDE0E2] text-[#1E2330]"
            />
            <FeatureCard 
              title="Rules" 
              desc="Create rules that give different experiences to different people" 
              icon="⚡" 
              btnColor="bg-[#DDE0E2] text-[#1E2330]"
            />
          </section>
        </div>
      )}

      {/* Channels Tab Content */}
      {activeTab === 'channels' && (
        <div className="space-y-12">
          <div className="bg-[#DDE0E2] rounded-[2.5rem] shadow-sm border border-black/5 overflow-hidden">
            <div className="p-8 md:p-10 border-b-2 border-black/80">
              <h3 className="text-2xl font-black">My channels</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-widest font-black">
                  <tr>
                    <th className="p-6 pl-10">Channel name</th>
                    <th className="p-6">Channel URL</th>
                    <th className="p-6">Performance</th>
                    <th className="p-6 pr-10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {link.channels.map(channel => {
                    const perf = analytics.channelPerformance?.find(p => p.channel_id === channel.id) || { clicks_1d: 0, clicks_7d: 0, clicks_30d: 0 };
                    return (
                      <tr key={channel.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="p-6 pl-10 font-black text-lg text-[#1E2330]">{channel.name}</td>
                        <td className="p-6">
                          <a href={`/${channel.short_url}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-bold decoration-2 underline-offset-4 hover:underline">
                            live.fyi/{channel.short_url}
                          </a>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-6">
                            <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">1d</span> <span className="font-black text-lg">{perf.clicks_1d}</span></div>
                            <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">7d</span> <span className="font-black text-lg">{perf.clicks_7d}</span></div>
                            <div className="flex flex-col"><span className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">30d</span> <span className="font-black text-lg">{perf.clicks_30d}</span></div>
                          </div>
                        </td>
                        <td className="p-6 pr-10">
                          <div className="flex gap-3 justify-end">
                            <button onClick={() => copyToClipboard(channel.short_url, channel.id)} className="w-12 h-12 flex items-center justify-center hover:bg-white bg-gray-100 rounded-2xl transition-all shadow-sm text-[#1E2330]" title="Copy URL">
                              {copiedId === channel.id ? <CheckCircle2 size={20} className="text-green-600" /> : <Copy size={20} />}
                            </button>
                            <button onClick={() => setSelectedQR({ slug: channel.short_url, name: channel.name })} className="w-12 h-12 flex items-center justify-center hover:bg-white bg-gray-100 rounded-2xl transition-all shadow-sm text-[#1E2330]" title="Enlarge QR Code">
                              <QrCode size={20} />
                            </button>
                            <button 
                              onClick={() => handleDeleteChannel(channel.id, channel.name)}
                              disabled={channel.name === 'Direct'}
                              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm ${
                                channel.name === 'Direct' 
                                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                                  : 'hover:bg-red-500 hover:text-white bg-red-50 text-red-600'
                              }`} 
                              title={channel.name === 'Direct' ? "Cannot delete primary channel" : "Delete"}
                            >
                              <Trash2 size={20} />
                            </button>
                            <div className="hidden">
                              <QRCodeSVG id={`qr-${channel.short_url}`} value={`${window.location.origin}/${channel.short_url}`} size={1024} level="H" includeMargin={true} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-8">Create another channel for:</h3>
            <div className="flex flex-wrap gap-3 mb-12">
              {['Instagram', 'TikTok', 'Print ads', 'Billboards', 'Emails', 'YouTube', 'Text messages', 'Twitch', 'Facebook'].map(preset => (
                <button key={preset} onClick={() => handleAddChannel(preset)} className="px-6 py-3 bg-[#F3F3F1] hover:bg-[#E9EAE8] rounded-full font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-sm">
                  {preset}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddChannel(newChannelName); }} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Create a custom Channel" 
                value={newChannelName} 
                onChange={e => setNewChannelName(e.target.value)} 
                className="flex-1 px-8 py-5 bg-[#F3F3F1] border-2 border-transparent rounded-[1.5rem] outline-none focus:border-[#1E2330] font-bold transition-all text-lg" 
              />
              <button type="submit" disabled={!newChannelName} className="px-10 py-5 bg-[#1E2330] hover:bg-black text-white rounded-[1.5rem] font-black text-lg disabled:opacity-50 transition-all shadow-xl hover:translate-y-[-2px] active:translate-y-[0px]">
                Create Channel
              </button>
            </form>
          </div>
          
          <div className="bg-[#1E2330] p-10 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <h3 className="text-2xl font-black mb-6 relative z-10">What is a channel?</h3>
            <p className="font-medium text-lg text-white/70 leading-relaxed mb-6 relative z-10">Channels let you track where your traffic comes from by creating unique short URLs for the same destination.</p>
            <p className="font-medium text-lg text-white/70 leading-relaxed mb-6 relative z-10">For example, if you're sharing a link on social media, in an email campaign, or in a text message, you can create a different channel URL for each. This way, you'll know exactly which source is driving traffic.</p>
            <p className="font-medium text-lg text-white/70 leading-relaxed mb-8 relative z-10">💡 <span className="text-[#D2E823]">Pro tip:</span> Every link automatically comes with a built-in "QR" channel! Generate QR codes from that channel's unique URL to properly track QR code scans.</p>
          </div>
        </div>
      )}

      {/* Interactive QR Code Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" 
            onClick={() => setSelectedQR(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-8 max-w-sm w-full relative"
            >
              <button 
                onClick={() => setSelectedQR(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center transition-colors text-xl font-bold"
              >
                ×
              </button>
              
              <div className="text-center mt-4">
                <p className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-2">{selectedQR.name} Channel</p>
                <h3 className="text-3xl font-black text-[#1E2330] tracking-tighter mb-2">Scan & Go</h3>
                <p className="font-bold text-indigo-500">live.fyi/{selectedQR.slug}</p>
              </div>

              <div className="bg-[#1E2330] p-6 rounded-[2rem] shadow-inner">
                <QRCodeCanvas 
                  id={`large-qr-${selectedQR.slug}`}
                  value={`${window.location.origin}/${selectedQR.slug}`} 
                  size={320} 
                  bgColor="#ffffff" 
                  fgColor="#1E2330" 
                  level="H" 
                  imageSettings={{
                    src: Icon_B,
                    height: 52,
                    width: 52,
                    excavate: true,
                  }}
                />
              </div>

              <button 
                onClick={() => downloadLargeQR(selectedQR.slug)}
                className="w-full flex items-center justify-center gap-3 bg-[#1E2330] hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                <Download size={20} />
                Download PNG
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BehaviorCard({ data, dataKey, columns, emptyMsg = "Nothing yet. Have you shared your link anywhere?", className = "" }: { data: any[], dataKey: string, columns: string[], emptyMsg?: string, className?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.05)" }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`bg-[#DDE0E2] rounded-[2.5rem] overflow-hidden flex flex-col p-10 transition-colors ${className}`}
    >
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 flex flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.length === 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6 pb-6 border-b-2 border-black sticky top-0 bg-[#DDE0E2] z-20">
                <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">{columns[0]}</span>
                <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">{columns[1]}</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-[#1A1A1A]/30 font-bold text-center p-8 leading-tight">
                {emptyMsg}
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="text-[#1A1A1A] text-xl font-bold tracking-tight sticky top-0 bg-[#DDE0E2] z-20">
                <tr>
                  <th className="pb-8 border-b-3 border-black font-bold uppercase-none">{columns[0]}</th>
                  <th className="pb-8 text-right border-b-3 border-black font-bold uppercase-none">{columns[1]}</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {/* Spacer for sticky header */}
                <tr className="h-4"><td></td><td></td></tr>
                {data.map((item, i) => (
                  <tr key={i} className="group/row">
                    <td className="py-5 font-bold text-[#1A1A1A] group-hover/row:opacity-100 opacity-90 transition-opacity">
                      {item[dataKey] || 'Direct'}
                    </td>
                    <td className="py-5 text-right font-black text-[#1A1A1A]">
                      {item.count ?? item.clicks ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({ title, desc, icon, btnColor = "bg-[#F3F3F1] text-[#1E2330]" }: { title: string, desc: string, icon: React.ReactNode, btnColor?: string }) {
  return (
    <motion.div 
      whileHover={{ rotate: 1, y: -8, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group transition-all"
    >
      <div className="absolute top-6 right-6 bg-[#D2E823] text-[#1E2330] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
        Coming soon!
      </div>
      <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform origin-left">{icon}</div>
      <h3 className="text-2xl font-black mb-4 text-[#1E2330] tracking-tight">{title}</h3>
      <p className="text-gray-500 font-bold text-lg mb-12 flex-1 leading-snug">{desc}</p>
      <motion.button 
        whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-5 ${btnColor} hover:bg-[#1A1A1A] hover:text-white rounded-[1.5rem] font-black transition-all shadow-inner text-lg`}
      >
        Register Interest
      </motion.button>
    </motion.div>
  );
}

function SEOAnalyzer({ url }: { url: string }) {
  const [seoData, setSeoData] = useState<{ 
    title: string, 
    description: string, 
    image: string,
    aiSuggestions?: { suggestedTitle: string, suggestedDescription: string }
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyze();
  }, [url]);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(api('/api/seo-analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        setSeoData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!seoData) return 0;
    let score = 0;
    if (seoData.title && seoData.title.trim().length > 0) score += 30;
    if (seoData.description && seoData.description.trim().length > 0) score += 35;
    if (seoData.image && seoData.image.trim().length > 0) score += 35;
    return score;
  };

  const auditScore = calculateScore();

  if (loading) return <div className="flex items-center gap-4 text-gray-500 font-black text-xl py-20 px-4"><Loader2 className="animate-spin" size={32} /> ANALYZING SEO PERFORMANCE...</div>;
  if (!seoData) return <div className="text-gray-500 font-bold text-lg py-20 px-4">Could not analyze URL.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h4 className="font-black text-2xl mb-10 text-[#1E2330] flex items-center gap-3">
          Audit Score <span className={`px-3 py-1 rounded-xl text-lg font-black ${auditScore >= 80 ? 'text-emerald-500 bg-emerald-50' : auditScore >= 60 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50'}`}>{auditScore}/100</span>
        </h4>
        <div className="space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 text-slate-400 overflow-hidden shadow-inner border border-gray-200">
              {seoData.image ? <img src={seoData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => {(e.target as any).style.display = 'none'}} /> : '🖼️'}
            </div>
            <div>
              <p className="font-black text-[#1E2330] text-lg">{seoData.image ? 'Cover Image Detected' : 'No Cover Image'}</p>
              <p className="text-gray-500 font-medium">Essential for high click-through rates on social platforms.</p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-gray-200">
              <Search size={24} className="text-[#1E2330]/40" />
            </div>
            <div>
              <p className="font-black text-[#1E2330] text-lg">{seoData.title ? 'Title Tag Present' : 'Missing Title'}</p>
              <p className="text-gray-500 font-medium truncate max-w-xs">{seoData.title || 'Add a title to improve visibility.'}</p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-gray-200">
              <Search size={24} className="text-[#1E2330]/40" />
            </div>
            <div>
              <p className="font-black text-[#1E2330] text-lg">{seoData.description ? 'Meta Description Found' : 'Missing Description'}</p>
              <p className="text-gray-500 font-medium truncate max-w-xs">{seoData.description || 'Add a description to improve visibility.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <h4 className="font-black text-2xl mb-10 text-[#1E2330]">Search Engines</h4>
        <div className="bg-[#EBEDF0] border border-black/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col">
          <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[#1E2330] text-sm font-black">G</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#1E2330]/40 uppercase tracking-widest">Google Preview</p>
                <p className="text-xs text-[#1E2330]/60 font-bold lowercase">{new URL(url).hostname}</p>
              </div>
            </div>
          </div>
          <div className="p-10 flex-1 flex flex-col justify-center">
            <h5 className="text-2xl font-black text-[#1a0dab] hover:underline cursor-pointer tracking-tight mb-4 line-clamp-2">
              {(seoData.aiSuggestions?.suggestedTitle || seoData.title || 'No Title')
                .replace(/Linktree/gi, 'Live.fyi')
                .replace(/tr\.ee/gi, 'live.fyi')}
            </h5>
            <p className="text-lg text-[#4d5156] font-medium leading-relaxed line-clamp-3">
              {(seoData.aiSuggestions?.suggestedDescription || seoData.description || 'No description available for this page.')
                .replace(/Linktree/gi, 'Live.fyi')
                .replace(/tr\.ee/gi, 'live.fyi')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function InteractiveMap({ data, onHover }: { data: any[], onHover: (d: any) => void }) {
  const statsMap = data.reduce((acc, curr) => {
    try {
      // Convert 'IN' -> 'India' for map matching
      const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
      const fullName = curr.country === 'Unknown' ? 'Unknown' : regionNames.of(curr.country);
      if (fullName) acc[fullName] = curr.count;
    } catch (e) {
      acc[curr.country] = curr.count;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full h-full flex items-center justify-center p-0 m-0 overflow-hidden border-none outline-none bg-[#DDE0E2]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ 
          scale: 195,
          center: [0, 22] 
        }}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%", outline: "none", display: "block" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies
              .filter(geo => geo.properties?.name !== "Antarctica")
              .map((geo) => {
                const count = statsMap[geo.id] || statsMap[geo.properties?.name] || 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(e) => {
                      const container = (e.currentTarget as any).closest('.relative');
                      if (container) {
                        const rect = container.getBoundingClientRect();
                        onHover({
                          name: geo.properties.name,
                          count,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        });
                      }
                    }}
                    onMouseLeave={() => onHover(null)}
                    style={{
                      default: {
                        fill: count > 0 ? "#1E2330" : "#94A3B8",
                        outline: "none",
                        stroke: "#EBEDF0",
                        strokeWidth: 0.5,
                        transition: "all 0.3s"
                      },
                      hover: {
                        fill: count > 0 ? "#000000" : "#64748B",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#000000",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}


