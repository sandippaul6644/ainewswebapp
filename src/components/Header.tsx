import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Globe, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { name: 'Politics', slug: 'politics', color: 'bg-red-500' },
  { name: 'Sports', slug: 'sports', color: 'bg-green-500' },
  { name: 'Technology', slug: 'technology', color: 'bg-blue-500' },
  { name: 'Entertainment', slug: 'entertainment', color: 'bg-purple-500' },
  { name: 'Business', slug: 'business', color: 'bg-yellow-500' },
  { name: 'Health', slug: 'health', color: 'bg-pink-500' },
  { name: 'Education', slug: 'education', color: 'bg-indigo-500' },
  { name: 'Weather', slug: 'weather', color: 'bg-cyan-500' }
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <Globe className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                AI News India
              </h1>
              <p className="text-xs text-gray-500">Powered by Artificial Intelligence</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-md mx-8">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 outline-none text-gray-700"
            />
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center justify-between py-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
            >
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="relative px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-white hover:to-gray-50 text-gray-700 hover:text-gray-900 transition-all duration-200 group overflow-hidden"
              >
                <span className="relative z-10">{category.name}</span>
                <div className={`absolute inset-0 ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
              </Link>
            ))}
          </div>

          <Link
            to="/category/trending"
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Trending</span>
          </Link>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-gray-700"
                />
              </form>

              {/* Mobile Navigation */}
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    className="block px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span>{category.name}</span>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/category/trending"
                  className="block px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Trending</span>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}