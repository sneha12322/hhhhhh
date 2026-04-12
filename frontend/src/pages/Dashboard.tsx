import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Copy, Trash2, Search, QrCode, CheckCircle2, MoreVertical, Tag, Download } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import Icon_B from '../assets/Icon_B.png';
import { api } from '../lib/api';

interface LinkData {
  id: string;
  original_url: string;
  slug: string;
  title: string | null;
  tags: string[];
  created_at: string;
  channels?: any[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showAddTagId, setShowAddTagId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [selectedQR, setSelectedQR] = useState<LinkData | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showAddTagId && !(e.target as HTMLElement).closest('.tag-container')) {
        setShowAddTagId(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showAddTagId]);

  useEffect(() => {
    fetchLinks();

    // Check for success param from landing
    const params = new URLSearchParams(location.search);
    if (params.get('success')) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        // Clean URL
        navigate(location.pathname, { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
     const handleRefresh = () => {
       fetchLinks();
       setShowSuccessToast(true);
       setTimeout(() => setShowSuccessToast(false), 4000);
     };
     window.addEventListener('link-created', handleRefresh);
     return () => window.removeEventListener('link-created', handleRefresh);
  }, []);

  const addTag = async (id: string, tag: string) => {
    if (!tag.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/links/${id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tag: tag.trim() }),
      });
      fetchLinks();
      setNewTag('');
      // Don't close input (setShowAddTagId(null) removed)
    } catch (e) {
      console.error(e);
    }
  };

  const downloadLargeQR = (slug: string) => {
    const canvas = document.getElementById(`large-qr-${slug}`) as HTMLCanvasElement;
    if (canvas) {
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext("2d");
      
      if (ctx) {
        ctx.fillStyle = "#1E2330"; // Match visual background
        // Fill background
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        // Draw the cleanly rendered QR canvas
        ctx.drawImage(canvas, 0, 0);
      }
      
      const pngFile = finalCanvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${slug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    }
  };

  const deleteTag = async (id: string, tag: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/links/${id}/tags/${tag}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      fetchLinks();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLinks = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(api('/api/links'), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 401) {
      // Logout and redirect to login if token is missing/invalid
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      navigate('/login');
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error('Unexpected links data:', data);
      setLinks([]);
      return;
    }

    setLinks(data);
  };


  const copyToClipboard = (slug: string, id: string) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/links/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    fetchLinks();
  };

  const filteredLinks = links.filter(link => 
    link.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    link.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (link.title && link.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="w-full space-y-12 relative pb-20">
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-5 bg-[#1E2330] text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-between gap-10 min-w-[500px] backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#D2E823] rounded-full flex items-center justify-center text-black shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">Success!</p>
                <p className="text-white/60 font-bold text-sm leading-tight">Your new link is ready to share.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <h2 className="text-4xl font-black tracking-tighter text-[#1E2330]">
          My links
        </h2>
        <div className="relative group flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#1E2330] transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search your links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full py-3 px-12 outline-none focus:border-black/20 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Links List */}
      <div className="grid gap-6">
        <AnimatePresence>
          {filteredLinks.map((link, i) => {
            const cardColor = localStorage.getItem(`link_color_${link.id}`) || '#1E2330';
            return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ 
                rotate: 0.5, 
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
              }}
              onClick={() => navigate(`/links/${link.id}`)}
              transition={{ 
                delay: i * 0.03,
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
              style={{ backgroundColor: cardColor }}
              className="rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 group relative cursor-pointer"
            >
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight break-all">
                    live.fyi/{link.slug}
                  </h3>
                </div>
                <p className="text-gray-400 text-lg truncate mb-6 max-w-xl">
                  {link.original_url}
                </p>
                <div className="flex flex-col gap-4 relative tag-container">
                  <div className="flex flex-wrap gap-2 items-center">
                    {link.tags && link.tags.length > 0 ? (
                      <>
                        {link.tags.map((tag, idx) => (
                          <div 
                            key={idx}
                            className="bg-white/5 text-white/90 px-5 py-2 rounded-full text-sm font-bold border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 group/tag"
                          >
                            {tag}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTag(link.id, tag);
                              }}
                              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10 opacity-0 group-hover/tag:opacity-100 transition-all ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddTagId(showAddTagId === link.id ? null : link.id);
                            setNewTag('');
                          }}
                          className="w-10 h-10 rounded-full border border-white/10 hover:border-white/20 bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-all text-xl"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddTagId(link.id);
                          setNewTag('');
                        }}
                        className="bg-white/5 text-white/70 hover:text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10 hover:border-white/20 flex items-center gap-2"
                      >
                        + Add a tag
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showAddTagId === link.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-full mb-1 left-0 bg-white rounded-[2rem] shadow-2xl p-2 flex items-center gap-2 border border-black/5 z-[60] w-[320px]"
                      >
                        <input
                          autoFocus
                          type="text"
                          placeholder="Tag name..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addTag(link.id, newTag);
                            if (e.key === 'Escape') setShowAddTagId(null);
                          }}
                          className="flex-1 bg-transparent px-6 py-3 outline-none font-bold text-[#1E2330]"
                        />
                        <button 
                          onClick={() => addTag(link.id, newTag)}
                          className="bg-[#1E2330] hover:bg-black text-white px-6 py-3 rounded-full font-black text-sm whitespace-nowrap shadow-lg shadow-black/10"
                        >
                          Add tag
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 relative z-10">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(link.slug, link.id);
                  }}
                  whileTap={{ scale: 0.85 }}
                  animate={copiedId === link.id ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="flex-1 md:w-16 md:h-16 aspect-square bg-white text-[#1E2330] rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95"
                  title="Copy URL"
                >
                  {copiedId === link.id 
                    ? <CheckCircle2 size={24} />
                    : <Copy size={24} />}
                </motion.button>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    const qrSlug = link.channels?.find((c: any) => c.name === 'QR')?.short_url || `${link.slug}-qr`;
                    setSelectedQR({...link, slug: qrSlug});
                  }}
                  className="flex-1 md:w-16 md:h-16 aspect-square bg-[#2a2f3d] text-white rounded-2xl flex items-center justify-center border border-gray-700 cursor-pointer overflow-hidden p-2 hover:bg-white/20 hover:border-white/40 transition-all group/qr"
                  title="Enlarge QR Code"
                >
                  <QRCodeSVG 
                    id={`qr-${link.slug}`}
                    value={`${window.location.origin}/${link.channels?.find((c: any) => c.name === 'QR')?.short_url || `${link.slug}-qr`}`} 
                    size={48} 
                    bgColor="transparent" 
                    fgColor="#ffffff" 
                    imageSettings={{
                      src: Icon_B,
                      height: 12,
                      width: 12,
                      excavate: false,
                    }}
                  />
                </div>
              </div>
              
              {/* More Actions Menu */}
              <div className="absolute top-4 right-6 z-20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === link.id ? null : link.id);
                  }}
                  className="p-3 text-gray-500 hover:text-white bg-[#2a2f3d]/50 rounded-full transition-all"
                >
                  <MoreVertical size={20} />
                </button>
                
                <AnimatePresence>
                  {openMenuId === link.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#2a2f3d] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => {
                          setOpenMenuId(null);
                          deleteLink(link.id);
                        }}
                        className="w-full text-left px-6 py-4 text-red-400 hover:bg-red-500/10 font-bold transition-colors flex items-center gap-3"
                      >
                        <Trash2 size={18} />
                        Delete link
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
          })}
          {filteredLinks.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-6">🏜️</div>
              <p className="text-xl font-bold text-gray-400">No links found. Shorten one at the top!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

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
                <h3 className="text-3xl font-black text-[#1E2330] tracking-tighter mb-2">Scan & Go</h3>
                <p className="font-bold text-gray-400">live.fyi/{selectedQR.slug}</p>
              </div>

              <div className="bg-[#1E2330] p-6 rounded-[2rem] shadow-inner">
                <QRCodeCanvas 
                  id={`large-qr-${selectedQR.slug}`}
                  value={`${window.location.origin}/${selectedQR.slug}`} 
                  size={240} 
                  bgColor="transparent" 
                  fgColor="#ffffff" 
                  imageSettings={{
                    src: Icon_B,
                    height: 50,
                    width: 50,
                    excavate: false,
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
