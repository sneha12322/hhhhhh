/**
 * live.fyi Application Root
 * Copyright (c) 2026 live.fyi
 */

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LinkDetails from './pages/LinkDetails';
import Auth from './pages/Auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isPublicRoute = location.pathname === '/';

  if (isPublicRoute) {
    return (
      <Routes>
        <Route index element={<Landing />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/links/:id" element={<LinkDetails />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
