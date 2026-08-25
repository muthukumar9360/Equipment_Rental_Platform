import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProductsPage from './pages/ProductsPage';
import ProviderPreview from './pages/ProviderPreview';
import ProductDetails from './pages/ProductDetails';
import AdminVerificationCenter from './pages/AdminVerificationCenter';
import RecentActivityPage from './pages/RecentActivityPage';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen bg-light text-dark font-sans ${isAuthPage ? '' : 'pt-20'}`}>
      {!isAuthPage && <Navbar />}

      <main className={isAuthPage ? '' : 'max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0'}>
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/preview/:id" element={<ProviderPreview />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<RecentActivityPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/verifications" element={<AdminVerificationCenter />} />
        </Routes>
      </main>
      
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
