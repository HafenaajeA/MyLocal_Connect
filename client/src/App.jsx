import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import BusinessListings from './pages/BusinessListings';
import BusinessDetails from './pages/BusinessDetails';
import AddEditBusiness from './pages/AddEditBusiness';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './components/Chat/Chat';

const queryClient = new QueryClient();

// Component to conditionally render footer
const ConditionalFooter = () => {
  const location = useLocation();
  
  // Routes where footer should be hidden
  const hideFooterRoutes = ['/login', '/register'];
  
  // Don't render footer on auth pages
  if (hideFooterRoutes.includes(location.pathname)) {
    return null;
  }
  
  return <Footer />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <ChatProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="app">
                <Navbar />
                <main className="main-content pt-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile/:id?" element={<Profile />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/post/:id" element={<PostDetails />} />
                    <Route path="/businesses" element={<BusinessListings />} />
                    <Route path="/business/:id" element={<BusinessDetails />} />
                    <Route path="/add-business" element={<AddEditBusiness />} />
                    <Route path="/edit-business/:id" element={<AddEditBusiness />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  </Routes>
                </main>
                <ConditionalFooter />
                <Toaster position="top-right" />
              </div>
            </Router>
          </ChatProvider>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
