import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Star, 
  MessageCircle,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  UserPlus,
  ShoppingBag
} from 'lucide-react';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBusinesses: 0,
    totalReviews: 0,
    newUsersThisMonth: 0,
    newBusinessesThisMonth: 0,
    flaggedReviews: 0,
    activeChats: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: `+${stats.newUsersThisMonth} this month`,
      icon: Users,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Total Vendors',
      value: stats.totalVendors,
      change: 'Active vendors',
      icon: ShoppingBag,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Total Businesses',
      value: stats.totalBusinesses,
      change: `+${stats.newBusinessesThisMonth} this month`,
      icon: Building2,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      change: `${stats.flaggedReviews} flagged`,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      title: 'Active Chats',
      value: stats.activeChats,
      change: 'Real-time conversations',
      icon: MessageCircle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Platform Overview
          </h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg 
                       hover:shadow-xl transition-all duration-300 hover:bg-white/15 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex items-center space-x-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {card.title}
              </h3>
              
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {card.value.toLocaleString()}
              </p>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.change}
              </p>
              
              {/* Progress bar for visual appeal */}
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${card.color}`}
                  style={{ width: `${Math.min((card.value / Math.max(...statCards.map(c => c.value))) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10
                        hover:bg-white/20 transition-all duration-200">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-200">New user registration</p>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>5 minutes ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10
                        hover:bg-white/20 transition-all duration-200">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-200">New business added</p>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>2 hours ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10
                        hover:bg-white/20 transition-all duration-200">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-200">Review flagged for moderation</p>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>4 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
