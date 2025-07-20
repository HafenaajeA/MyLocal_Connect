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
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'vendor' && user.role !== 'admin') {
      toast.error('Only vendors can add businesses');
      navigate('/');
      return;
    }

    if (isEditing) {
      fetchBusiness();
    }
  }, [id, isEditing, user, navigate]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/businesses/${id}`
      );

      if (!response.ok) {
        throw new Error('Business not found');
      }

      const data = await response.json();
      
      // Check if user owns this business or is admin
      if (data.owner._id !== user.id && user.role !== 'admin') {
        toast.error('You can only edit your own businesses');
        navigate('/businesses');
        return;
      }

      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Failed to load business details');
      navigate('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('hours.')) {
      const day = name.split('.')[1];
      setBusiness(prev => ({
        ...prev,
        hours: {
          ...prev.hours,
          [day]: value
        }
      }));
    } else {
      setBusiness(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    
    if (business.images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`Image ${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setBusiness(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setBusiness(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addService = () => {
    if (newService.trim() && !business.services.includes(newService.trim())) {
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

  const validateForm = () => {
    const required = ['name', 'description', 'category', 'address'];
    const missing = required.filter(field => !business[field].trim());
    
    if (missing.length > 0) {
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    if (business.email && !/\S+@\S+\.\S+/.test(business.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (business.website && !business.website.startsWith('http')) {
      setBusiness(prev => ({
        ...prev,
        website: `https://${prev.website}`
      }));
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      
      // Add business data
      Object.keys(business).forEach(key => {
        if (key === 'images') {
          // Handle images separately
          return;
        } else if (key === 'services') {
          formData.append(key, JSON.stringify(business[key]));
        } else if (key === 'hours') {
          formData.append(key, JSON.stringify(business[key]));
        } else {
          formData.append(key, business[key]);
        }
      });

      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append('images', file);
      });

      // Add existing image URLs for editing
      if (isEditing) {
        formData.append('existingImages', JSON.stringify(business.images));
      }

      const url = isEditing 
        ? `${import.meta.env.VITE_SERVER_URL}/api/businesses/${id}`
        : `${import.meta.env.VITE_SERVER_URL}/api/businesses`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
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
    return <LoadingSpinner />;
  }

  return (
    <div className="add-edit-business">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>{isEditing ? 'Edit Business' : 'Add New Business'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="business-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Business Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={business.name}
              onChange={handleInputChange}
              placeholder="Enter your business name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={business.description}
              onChange={handleInputChange}
              placeholder="Describe your business, services, and what makes you special"
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={business.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={business.address}
                onChange={handleInputChange}
                placeholder="Business address"
                required
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={business.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={business.email}
                onChange={handleInputChange}
                placeholder="business@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={business.website}
              onChange={handleInputChange}
              placeholder="www.yourbusiness.com"
            />
          </div>
        </section>

        {/* Images */}
        <section className="form-section">
          <h2>Images</h2>
          <p className="section-description">Add up to 5 images to showcase your business</p>
          
          <div className="image-upload">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="images" className="upload-button">
              <Camera size={20} />
              Add Images
            </label>
          </div>

          {business.images.length > 0 && (
            <div className="image-preview">
              {business.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Business ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="remove-image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Services */}
        <section className="form-section">
          <h2>Services</h2>
          <p className="section-description">List the services you offer</p>
          
          <div className="service-input">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Enter a service"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
            />
            <button type="button" onClick={addService} className="add-service-btn">
              <Plus size={16} />
              Add
            </button>
          </div>

          {business.services.length > 0 && (
            <div className="services-list">
              {business.services.map((service, index) => (
                <div key={index} className="service-item">
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="remove-service"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Business Hours */}
        <section className="form-section">
          <h2>Business Hours</h2>
          <p className="section-description">Set your operating hours (leave blank for closed days)</p>
          
          <div className="hours-grid">
            {Object.keys(dayNames).map(day => (
              <div key={day} className="hours-item">
                <label htmlFor={`hours.${day}`}>{dayNames[day]}</label>
                <input
                  type="text"
                  id={`hours.${day}`}
                  name={`hours.${day}`}
                  value={business.hours[day]}
                  onChange={handleInputChange}
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
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
  );
};

export default AddEditBusiness;
