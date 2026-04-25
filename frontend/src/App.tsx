/**
 * live.fyi Application Root
 * Copyright (c) 2026 live.fyi
 */

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LinkDetails from './pages/LinkDetails';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import InfoPage from './pages/InfoPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log("[PrivateRoute] Checking token:", token ? `Present (${token.length} chars)` : "MISSING — will redirect to /login");
  console.log("[PrivateRoute] Current URL:", window.location.href);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <Routes>
      <Route index element={<Landing />} />
      <Route path="/login" element={<Layout><Auth /></Layout>} />
      <Route path="/auth-callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/links/:id" element={<Layout><LinkDetails /></Layout>} />
      <Route path="/info/:slug" element={<Layout><InfoPage /></Layout>} />
      <Route path="*" element={<Layout><div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full"><h1 className="text-4xl font-bold mb-4">404 - Not Found</h1><p className="text-gray-500">The page or link you are looking for does not exist.</p></div></Layout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
