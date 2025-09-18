import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Share2, Clock, MapPin, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: {
    _id: string;
    title: string;
    excerpt: string;
    category: string;
    state: string;
    city: string;
    imageUrl: string;
    views: number;
    likes: number;
    shares: number;
    publishedAt: string;
    slug: string;
    tags: string[];
    trending?: boolean;
    featured?: boolean;
  };
  index?: number;
}

const categoryColors: { [key: string]: string } = {
  politics: 'bg-red-500',
  sports: 'bg-green-500',
  technology: 'bg-blue-500',
  entertainment: 'bg-purple-500',
  business: 'bg-yellow-500',
  health: 'bg-pink-500',
  education: 'bg-indigo-500',
  weather: 'bg-cyan-500',
  trending: 'bg-orange-500'
};

const getCategoryGradient = (category: string): string => {
  const gradients: { [key: string]: string } = {
    politics: 'bg-gradient-to-br from-red-500 to-red-600',
    sports: 'bg-gradient-to-br from-green-500 to-green-600',
    technology: 'bg-gradient-to-br from-blue-500 to-blue-600',
    entertainment: 'bg-gradient-to-br from-purple-500 to-purple-600',
    business: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    health: 'bg-gradient-to-br from-pink-500 to-pink-600',
    education: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    crime: 'bg-gradient-to-br from-red-600 to-red-700',
    weather: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
  };
  return gradients[category] || 'bg-gradient-to-br from-gray-500 to-gray-600';
};

export default function NewsCard({ news, index = 0 }: NewsCardProps) {
  const categoryColor = categoryColors[news.category] || 'bg-gray-500';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-white/20"
    >
      <Link to={`/news/${news.slug}`} className="block">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {news.imageUrl ? (
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                // Fallback to category-based gradient if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback gradient - always present but hidden if image loads */}
          <div 
            className={`w-full h-full ${getCategoryGradient(news.category)} flex items-center justify-center ${
              news.imageUrl ? 'hidden' : 'flex'
            }`}
            style={{ display: news.imageUrl ? 'none' : 'flex' }}
          >
            <div className="text-white text-center">
              <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75 font-medium">{news.category.toUpperCase()}</p>
              <p className="text-xs opacity-60">AI Generated News</p>
            </div>
          </div>
          
          {/* Category Badge */}
          <div className={`absolute top-4 left-4 ${categoryColor} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
            {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
          </div>

          {/* Trending/Featured Badges */}
          {news.trending && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              Trending
            </div>
          )}
          {news.featured && (
            <div className="absolute top-12 right-4 bg-gold-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              Featured
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Location & Time */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{news.city}, {news.state}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {news.title}
          </h2>

          {/* Excerpt */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {news.excerpt}
          </p>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {news.tags.slice(0, 3).map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{news.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{news.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="w-4 h-4" />
                <span>{news.shares}</span>
              </div>
            </div>
            
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
              AI Generated
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}