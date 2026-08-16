import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Footer from './components/Footer';

function App() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-light text-dark font-sans">
        <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-black">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary"><Link to="/">Equipora</Link></h1>
            <nav className="space-x-4">
              <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Marketplace</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors">Dashboard</Link>
                  <button onClick={logout} className="text-gray-600 hover:text-primary transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">Login</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
