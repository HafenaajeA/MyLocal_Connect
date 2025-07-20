import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Users, Building2, Star, Shield, ChevronRight, 
  Sparkles, TrendingUp, Activity, Crown
} from 'lucide-react';
import UserManagement from '../components/Admin/UserManagement';
import BusinessManagement from '../components/Admin/BusinessManagement';
import ReviewManagement from '../components/Admin/ReviewManagement';
import AdminStats from '../components/Admin/AdminStats';
import LoadingSpinner from '../components/LoadingSpinner';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const tabs = [
    { 
      id: 'stats', 
      label: 'Dashboard', 
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600',
      description: 'Overview & Analytics'
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      description: 'User Management'
    },
    { 
      id: 'businesses', 
      label: 'Businesses', 
      icon: Building2,
      color: 'from-purple-500 to-violet-600',
      description: 'Business Listings'
    },
    { 
      id: 'reviews', 
      label: 'Reviews', 
      icon: Star,
      color: 'from-yellow-500 to-orange-600',
      description: 'Review Management'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage and monitor your platform</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Admin
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-r ${tab.color} flex items-center justify-center mb-3 ${
                      isActive ? 'scale-110 shadow-lg' : 'group-hover:scale-105'
                    } transition-all duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`font-semibold mb-1 ${
                      isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                    }`}>
                      {tab.label}
                    </h3>
                    <p className="text-sm text-gray-500">{tab.description}</p>
                  </div>
                  
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          {/* Content Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {(() => {
                const activeTabData = tabs.find(tab => tab.id === activeTab);
                const IconComponent = activeTabData?.icon;
                return (
                  <>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${activeTabData?.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{activeTabData?.label}</h2>
                      <p className="text-sm text-gray-600">{activeTabData?.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* Content Body */}
          <div className="p-8">
            {activeTab === 'stats' && <AdminStats />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'businesses' && <BusinessManagement />}
            {activeTab === 'reviews' && <ReviewManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
