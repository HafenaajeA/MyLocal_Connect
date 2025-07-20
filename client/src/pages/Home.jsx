import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { businessService } from '../services/businessService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building2, Star, MapPin, ArrowRight, ChevronLeft, ChevronRight, Users, Heart, Sparkles } from 'lucide-react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    page: 1
  });

  // Hero slider images and content
  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80",
      title: "Connect with Your Local Community",
      subtitle: "Discover amazing local businesses, events, and connect with neighbors",
      cta: "Explore Businesses"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80",
      title: "Support Local Businesses",
      subtitle: "Find the best restaurants, shops, and services in your neighborhood",
      cta: "Browse Listings"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80",
      title: "Share Your Stories",
      subtitle: "Post updates, events, and connect with your community members",
      cta: "Join Community"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const { data, isLoading, error } = useQuery(
    ['posts', filters],
    () => postService.getPosts(filters),
    {
      keepPreviousData: true,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch featured businesses
  const { data: featuredBusinesses, isLoading: businessesLoading } = useQuery(
    ['featured-businesses'],
    () => businessService.getAllBusinesses({ limit: 4, sortBy: 'rating' }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Remove the early return for loading and error - let the component render
  // if (isLoading) return <LoadingSpinner />;
  // if (error) return <div>Error loading posts</div>;

  return (
    <div className="min-h-screen -mt-16">
      {/* Hero Slider Section */}
      <div className="relative h-screen overflow-hidden pt-16">
        {/* Slider Container */}
        <div 
          className="flex transition-transform duration-1000 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative min-w-full h-full flex items-center justify-center"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="animate-fade-in-up">
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>
                  <p className="text-xl sm:text-2xl lg:text-3xl mb-8 text-gray-200 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/businesses"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
                  >
                    <Sparkles className="w-5 h-5" />
                    {slide.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 text-white hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 text-white hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Why Choose MyLocal Connect?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your one-stop platform for discovering, connecting, and thriving in your local community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Discover Local Businesses</h3>
                <p className="text-gray-600 leading-relaxed">
                  Find amazing restaurants, shops, and services right in your neighborhood. Support local entrepreneurs and discover hidden gems.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Connect with Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share updates, organize events, and build meaningful connections with your neighbors. Strengthen your local community bonds.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Share & Review</h3>
                <p className="text-gray-600 leading-relaxed">
                  Leave honest reviews, share your experiences, and help others make informed decisions about local businesses and services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Businesses Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Featured Local Businesses
            </h2>
            <p className="text-xl text-gray-600 mb-8">Discover top-rated businesses in your area</p>
            <Link 
              to="/businesses" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {businessesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
                {/* Show real businesses if available, otherwise show dummy businesses */}
                {(featuredBusinesses?.businesses?.length > 0 
                  ? featuredBusinesses.businesses.slice(0, 4)
                  : [
                    {
                      _id: 'dummy-1',
                      name: 'Sunrise Café',
                      category: 'restaurant',
                      averageRating: 4.8,
                      address: 'Downtown Ondangwa',
                      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    },
                    {
                      _id: 'dummy-2',
                      name: 'Tech Solutions Hub',
                      category: 'technology',
                      averageRating: 4.9,
                      address: 'Business District',
                      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    },
                    {
                      _id: 'dummy-3',
                      name: 'Fashion Boutique',
                      category: 'retail',
                      averageRating: 4.6,
                      address: 'Shopping Center',
                      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    },
                    {
                      _id: 'dummy-4',
                      name: 'Wellness Spa',
                      category: 'health & beauty',
                      averageRating: 4.7,
                      address: 'Wellness District',
                      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                    }
                  ]
                ).map(business => (
                  <Link 
                    key={business._id} 
                    to={`/business/${business._id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                      <div className="aspect-w-16 aspect-h-12 relative overflow-hidden">
                        {(business.images && business.images[0]) || business.image ? (
                          <img 
                            src={business.images?.[0] || business.image} 
                            alt={business.name}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors duration-300">
                            <Building2 className="w-12 h-12 text-blue-500" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {business.name}
                        </h3>
                        <p className="text-gray-600 mb-4 capitalize">{business.category}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-gray-700 font-medium">
                              {business.averageRating ? business.averageRating.toFixed(1) : 'New'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                              {business.address?.split(',')[0] || 'Local'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )) || []}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts Preview */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Latest Community Updates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay connected with what's happening in your neighborhood
            </p>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['all', 'events', 'business', 'community', 'news'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange('category', category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 capitalize ${
                    filters.category === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {category === 'all' ? 'All Posts' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto">
                <Heart className="w-16 h-16 text-red-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Unable to load posts</h3>
                <p className="text-gray-600 mb-6">There was an error loading community posts. Please try again later.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  Refresh Page
                </button>
              </div>
            </div>
          ) : data?.posts?.length > 0 ? (
            <div className="grid gap-6 mb-12">
              {data.posts.slice(0, 3).map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No posts yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share something with your community!</p>
                <Link
                  to="/create-post"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  Create First Post
                </Link>
              </div>
            </div>
          )}

          {/* Show "View More" only if there are posts and more than 3 */}
          {data?.posts?.length > 3 && (
            <div className="text-center">
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Create Your Own Post <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
