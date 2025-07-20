import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, MapPin, Mail, Heart, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-6">
              <Link to="/" className="inline-block">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MyLocal Connect
                </h2>
              </Link>
              <p className="mt-4 text-gray-300 text-lg leading-relaxed max-w-md">
                Connecting communities, supporting local businesses, and building stronger neighborhoods together.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-3 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                <Link 
                  to="/businesses" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2"
                >
                  <Building2 size={16} />
                  Businesses
                </Link>
                <Link 
                  to="/create-post" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Create Post
                </Link>
                <Link 
                  to="/chat" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Messages
                </Link>
                <Link 
                  to="/profile" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 sm:mt-0">
            <h3 className="text-lg font-semibold text-white mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Phone</p>
                  <a 
                    href="tel:+264816599224" 
                    className="text-white hover:text-blue-400 transition-colors duration-300 font-medium"
                  >
                    +264 81 659 9224
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Address</p>
                  <address className="text-white not-italic leading-relaxed">
                    PO BOX 15678<br />
                    Oluno, Ondangwa<br />
                    Namibia
                  </address>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Email</p>
                  <a 
                    href="mailto:almandocode@gmail.com" 
                    className="text-white hover:text-blue-400 transition-colors duration-300 font-medium"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Links */}
          <div className="mt-8 sm:mt-0">
            <h3 className="text-lg font-semibold text-white mb-6">Connect With Us</h3>
            <div className="space-y-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                Follow our journey and stay updated with the latest community news.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
              </div>
              
              {/* Newsletter */}
              <div className="mt-6">
                <p className="text-gray-300 text-sm mb-3">Stay connected with your community</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-r-none sm:rounded-l-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 min-w-0"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg sm:rounded-l-none sm:rounded-r-lg transition-all duration-300 font-medium whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-center sm:text-left">
              <p className="text-gray-300 text-sm sm:text-base">
                © {currentYear} MyLocal Connect. All rights reserved.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Developed with <Heart className="inline w-4 h-4 text-red-500 mx-1" /> by{' '}
                <span className="text-white font-medium">Almando Hafenaaje</span>
              </p>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 text-xs sm:text-sm">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 whitespace-nowrap">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 whitespace-nowrap">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 whitespace-nowrap">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
