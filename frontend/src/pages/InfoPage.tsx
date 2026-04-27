import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Shield, Users, Zap, QrCode, Globe, CreditCard, RotateCcw } from 'lucide-react';

const contentMap: Record<string, { title: string; body: string; icon: any; category: string }> = {
  'what-does-a-short-link-do': {
    title: 'What does a short link do?',
    category: 'Help & Info',
    icon: <Zap className="text-yellow-500" size={48} />,
    body: 'A short link (also known as a vanity URL or shortened URL) takes a long, cumbersome web address and condenses it into a neat, shareable link. It redirects anyone who clicks it to the original destination. Short links are perfect for social media, print ads, and tracking engagement. They make your links look professional and trustworthy while saving precious character space on platforms like X (formerly Twitter).',
  },
  'how-do-url-shorteners-work': {
    title: 'How do URL shorteners work?',
    category: 'Help & Info',
    icon: <Globe className="text-blue-500" size={48} />,
    body: 'When you click a short link, your browser sends a request to the shortener\'s server. The server looks up the corresponding long URL in its database and sends back a "301 Redirect" or "302 Redirect" instruction, telling your browser to go to the final destination. This redirection process happens in a fraction of a second, so the user experience remains seamless while allowing the shortener to count the click and gather analytics.',
  },
  'how-to-get-a-qr-code-for-a-link': {
    title: 'How to get a QR code for a link',
    category: 'Help & Info',
    icon: <QrCode className="text-purple-500" size={48} />,
    body: 'At live.fyi, every link you shorten automatically generates a high-quality QR code. You can find this by going to your link\'s analytics page and clicking the "Channels" tab. Every link comes with a built-in "QR" channel. From there, you can view the QR code and download it as a high-resolution PNG file, perfect for print marketing, business cards, or restaurant menus.',
  },
  'how-to-shorten-a-url': {
    title: 'How to shorten a URL',
    category: 'Help & Info',
    icon: <BookOpen className="text-emerald-500" size={48} />,
    body: 'Shortening a URL with live.fyi is incredibly simple. Just paste your long URL into the input field on our home page or dashboard, click the "Shorten link" button, and you\'re done! Your new, shortened URL will be ready to copy and share immediately. If you\'re signed in, your new link will automatically be saved to your dashboard where you can track its performance.',
  },
  'about': {
    title: 'About live.fyi',
    category: 'Company',
    icon: <Users className="text-indigo-500" size={48} />,
    body: 'live.fyi was built to make link management faster, smarter, and more beautiful. We believe that sharing links should be a premium experience, whether you\'re a creator, a small business, or a large enterprise. Our mission is to provide the world\'s most intuitive and powerful link shortening and analytics platform, helping you understand your audience better and share your content more effectively.',
  },
  'careers': {
    title: 'Careers',
    category: 'Company',
    icon: <Users className="text-orange-500" size={48} />,
    body: 'We\'re always looking for talented individuals who are passionate about the modern web, high-performance systems, and great design. We value creativity, speed, and a user-first mindset. While we don\'t have any open positions right now, we\'re growing fast! Feel free to check back later or follow us for updates on future opportunities.',
  },
  'trust-legal': {
    title: 'Trust & Legal',
    category: 'Company',
    icon: <Shield className="text-slate-500" size={48} />,
    body: 'We take security, reliability, and compliance seriously. Our infrastructure is built on world-class cloud platforms to ensure your links are always fast, secure, and available. We implement industry-standard security practices to protect your data and your users. For detailed information regarding our terms of service and legal compliance, please reach out to our legal team.',
  },
  'privacy-notice': {
    title: 'Privacy Notice',
    category: 'Company',
    icon: <Shield className="text-red-500" size={48} />,
    body: 'Your privacy is paramount at live.fyi. We only collect the data necessary to provide you with the best analytics and link management service possible. This includes basic information like click counts, device types, and approximate geographic locations. we never sell your personal data to third parties. We are committed to transparency and giving you control over your information.',
  },
  'pricing': {
    title: 'Pricing Plans',
    category: 'Company',
    icon: <CreditCard className="text-emerald-500" size={48} />,
    body: 'live.fyi is currently in a public beta phase. All features, including unlimited link shortening, real-time analytics, and custom QR codes, are available to all users for free. In the future, we may introduce premium plans for high-volume users and advanced enterprise features, but our core mission remains providing a high-quality free experience for everyone.',
  },
  'refund-policy': {
    title: 'Refund Policy',
    category: 'Company',
    icon: <RotateCcw className="text-amber-500" size={48} />,
    body: 'Since live.fyi is currently free to use, there are no charges or subscription fees, and therefore no refunds are applicable. If we introduce paid services in the future, we will provide a clear and fair refund policy. If you have any questions about your account or features, please contact our support team.',
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    category: 'Company',
    icon: <Shield className="text-slate-500" size={48} />,
    body: 'By using live.fyi, you agree to our terms of service. Our platform is designed for legitimate link shortening and analytics. You may not use live.fyi for any illegal activities, including but not limited to phishing, malware distribution, or spam. We reserve the right to disable any links that violate our safety policies or damage the reputation of our platform. Users are responsible for the content of the links they create.',
  }
};

export default function InfoPage() {
  const { slug } = useParams();
  const pageContent = slug ? contentMap[slug] : null;

  if (!pageContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full">
        <h1 className="text-4xl font-black mb-4">Page not found</h1>
        <p className="text-gray-500 font-bold mb-8">The information you're looking for doesn't exist yet.</p>
        <Link to="/" className="bg-[#1E2330] text-white px-8 py-3 rounded-full font-black">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1E2330] mb-12 font-bold transition-all hover:-translate-x-1"
      >
        <ArrowLeft size={18} /> Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-gray-100"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
            {pageContent.icon}
          </div>
          <p className="text-[10px] font-black text-[#1E2330]/40 uppercase tracking-[0.2em] mb-4">
            {pageContent.category}
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1E2330]">
            {pageContent.title}
          </h1>
        </div>

        <div className="prose prose-xl max-w-none">
          <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
            {pageContent.body}
          </p>
        </div>

        <div className="mt-16 pt-16 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h4 className="text-lg font-black mb-2">Still need help?</h4>
            <p className="text-gray-500 font-bold">Our support team is here to help you 24/7.</p>
          </div>
          <Link 
            to="/login"
            className="bg-[#1E2330] hover:bg-black text-white px-10 py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl hover:-translate-y-1"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
