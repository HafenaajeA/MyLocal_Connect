import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, X, Plus, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AddEditBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [business, setBusiness] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    images: [],
    services: [],
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    }
  });

  const [newService, setNewService] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const categories = [
    'Restaurant', 'Retail', 'Service', 'Healthcare', 'Technology',
    'Education', 'Entertainment', 'Fitness', 'Beauty', 'Automotive',
    'Real Estate', 'Legal', 'Financial', 'Construction', 'Other'
  ];

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  useEffect(() => {
    if (isEditing) {
      fetchBusiness();
    }
  }, [id, isEditing]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/businesses/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch business');
      }

      const data = await response.json();
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business data');
      navigate('/business-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBusiness(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBusiness(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Create preview URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setBusiness(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setBusiness(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (newService.trim()) {
      setBusiness(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index) => {
    setBusiness(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!business.name || !business.description || !business.category || !business.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      Object.keys(business).forEach(key => {
        if (key === 'images') {
          // Only append new image files
          imageFiles.forEach(file => {
            formData.append('images', file);
          });
        } else if (key === 'services') {
          formData.append('services', JSON.stringify(business.services));
        } else if (key === 'hours') {
          formData.append('hours', JSON.stringify(business.hours));
        } else {
          formData.append(key, business[key]);
        }
      });

      const url = isEditing 
        ? `${import.meta.env.VITE_SERVER_URL}/api/businesses/${id}`
        : `${import.meta.env.VITE_SERVER_URL}/api/businesses`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'Business updated successfully!' : 'Business created successfully!');
        navigate(`/business/${data._id || data.business._id}`);
      } else {
        throw new Error(data.message || 'Failed to save business');
      }
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error(error.message || 'Failed to save business');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Business' : 'Add New Business'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update your business information' : 'Share your business with the community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={business.name}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={business.description}
                  onChange={handleInputChange}
                  placeholder="Describe your business, what you offer, and what makes you unique..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={business.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={business.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={business.email}
                  onChange={handleInputChange}
                  placeholder="business@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={business.website}
                  onChange={handleInputChange}
                  placeholder="https://www.yourbusiness.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={business.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, City, State 12345"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              Business Images
            </h2>
            <p className="text-gray-600 mb-6">Add photos of your business, products, or services</p>

            <div className="mb-6">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                <Camera size={20} />
                Add Images
              </label>
            </div>

            {business.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {business.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={image} 
                        alt={`Business ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              Services
            </h2>
            <p className="text-gray-600 mb-6">List the services you offer</p>
            
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Enter a service"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button 
                type="button" 
                onClick={addService} 
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            {business.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {business.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium">{service}</span>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Business Hours */}
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              Business Hours
            </h2>
            <p className="text-gray-600 mb-6">Set your operating hours (leave blank for closed days)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(dayNames).map(day => (
                <div key={day} className="space-y-2">
                  <label htmlFor={`hours.${day}`} className="block text-sm font-medium text-gray-700">
                    {dayNames[day]}
                  </label>
                  <input
                    type="text"
                    id={`hours.${day}`}
                    name={`hours.${day}`}
                    value={business.hours[day]}
                    onChange={handleInputChange}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="small" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditing ? 'Update Business' : 'Create Business'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditBusiness;
