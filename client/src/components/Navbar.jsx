import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, PlusCircle, LogOut, Menu, X, MessageCircle, Shield } from 'lucide-react';
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
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <h1>MyLocal Connect</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            <Link to="/" className="nav-link">
              <Home size={20} />
              Home
            </Link>
            
            {isAuthenticated && (
              <>
                <Link to="/create-post" className="nav-link">
                  <PlusCircle size={20} />
                  Create Post
                </Link>
                <Link to="/chat" className="nav-link">
                  <MessageCircle size={20} />
                  Messages
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link admin-link">
                    <Shield size={20} />
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="nav-link">
                  <User size={20} />
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="navbar-auth desktop-nav">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="welcome-text">
                  Welcome, {user?.firstName}!
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="mobile-nav">
            <Link 
              to="/" 
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={20} />
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/create-post" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusCircle size={20} />
                  Create Post
                </Link>
                <Link 
                  to="/chat" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageCircle size={20} />
                  Messages
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="mobile-nav-link admin-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield size={20} />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/profile" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="mobile-nav-link mobile-logout"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
        }

        .navbar-brand {
          text-decoration: none;
          color: #1e293b;
          font-weight: bold;
        }

        .navbar-brand h1 {
          font-size: 20px;
          margin: 0;
          color: #3b82f6;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #475569;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #3b82f6;
        }

        .navbar-auth {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .welcome-text {
          color: #475569;
          font-size: 14px;
        }

        .auth-links {
          display: flex;
          gap: 12px;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
        }

        .mobile-nav {
          display: none;
          padding: 16px 0;
          border-top: 1px solid #e2e8f0;
          background: white;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          text-decoration: none;
          color: #475569;
          font-weight: 500;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .mobile-nav-link:hover {
          color: #3b82f6;
        }

        .mobile-logout {
          color: #ef4444;
        }

        .mobile-logout:hover {
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .mobile-nav {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
