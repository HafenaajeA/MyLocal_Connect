import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, PlusCircle, LogOut, Menu, X, MessageCircle, Shield, Building2, MapPin } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 glass-card-premium border-0 border-b border-white/20 shadow-lg z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with 20px left spacing */}
          <Link to="/" className="flex-shrink-0 group ml-5">
            <h1 className="text-2xl font-bold gradient-text group-hover:scale-110 transition-all duration-500 hover:drop-shadow-lg">
              MyLocal Connect
            </h1>
          </Link>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
            >
              <Home size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            
            <Link 
              to="/businesses" 
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
            >
              <Building2 size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative">
                Businesses
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
          </div>

          {/* Right side navigation for authenticated users */}
          <div className="hidden md:flex items-center space-x-6 mr-8">
            {isAuthenticated && (
              <>
                <Link 
                  to="/create-post" 
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
                >
                  <PlusCircle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative">
                    Create Post
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                {user?.role === 'vendor' && (
                  <Link 
                    to="/add-business" 
                    className="flex items-center gap-2 text-emerald-700 hover:text-emerald-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
                  >
                    <MapPin size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative">
                      Add Business
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                )}
                <Link 
                  to="/chat" 
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
                >
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative">
                    Messages
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin-dashboard" 
                    className="flex items-center gap-2 text-red-700 hover:text-red-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
                  >
                    <Shield size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative">
                      Admin
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
                >
                  <User size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative">
                    Profile
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Section with Tailwind styles */}
          <div className="hidden md:flex items-center space-x-6 mr-5">
            {isAuthenticated ? (
              <div className="flex items-center space-x-8">
                <span className="text-gray-700 text-sm font-medium">
                  Welcome, {user?.firstName}!
                </span>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 border border-gray-300 hover:border-indigo-500 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-modern px-4 py-2 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-300"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20 py-4 space-y-2">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={20} />
              Home
            </Link>

            <Link 
              to="/businesses" 
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Building2 size={20} />
              Businesses
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/create-post" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusCircle size={20} />
                  Create Post
                </Link>
                {user?.role === 'vendor' && (
                  <Link 
                    to="/add-business" 
                    className="flex items-center gap-3 px-4 py-3 text-emerald-700 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MapPin size={20} />
                    Add Business
                  </Link>
                )}
                <Link 
                  to="/chat" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageCircle size={20} />
                  Messages
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin-dashboard" 
                    className="flex items-center gap-3 px-4 py-3 text-red-700 hover:text-red-600 hover:bg-red-50/50 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield size={20} />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-all duration-300 w-full text-left"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-3 px-4 py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
