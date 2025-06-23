import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, TrendingUp, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const categories = [
    'Politics', 'Sports', 'Technology', 'Entertainment', 
    'Business', 'Health', 'Education', 'Weather'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <Globe className="w-8 h-8 text-blue-400" />
                <TrendingUp className="w-4 h-4 text-green-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI News India</h3>
                <p className="text-xs text-gray-400">Powered by AI</p>
              </div>
            </Link>
            <p className="text-gray-300 text-sm">
              India's first AI-powered news platform delivering real-time, comprehensive news coverage across all states and categories.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-400 cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/category/${category.toLowerCase()}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/category/trending" className="text-gray-300 hover:text-white transition-colors">Trending</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">news@ainewsindia.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Mumbai, India</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2">Newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg text-sm transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 AI News India. All rights reserved. Powered by ChatGPT.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <span className="text-gray-400">🤖 100% AI Generated Content</span>
            <span className="text-gray-400">📱 Mobile Optimized</span>
            <span className="text-gray-400">🚀 Auto Updated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}