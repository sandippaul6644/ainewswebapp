import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Clock, ArrowRight } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import AdSense from '../components/AdSense';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchNews, fetchTrendingNews, fetchFeaturedNews } from '../services/api';

interface NewsItem {
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
}

export default function Home() {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [latest, trending, featured] = await Promise.all([
          fetchNews({ limit: 12 }),
          fetchTrendingNews(),
          fetchFeaturedNews()
        ]);

        setLatestNews(latest.news);
        setTrendingNews(trending);
        setFeaturedNews(featured);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SEOHead />
      
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with Featured News */}
        {featuredNews.length > 0 && (
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
              <div className="relative p-8 md:p-12 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-sm font-medium uppercase tracking-wide">Featured Story</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {featuredNews[0].title}
                </h1>
                <p className="text-xl opacity-90 mb-6 max-w-3xl">
                  {featuredNews[0].excerpt}
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {featuredNews[0].city}, {featuredNews[0].state}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {featuredNews[0].category.charAt(0).toUpperCase() + featuredNews[0].category.slice(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Trending News Section */}
        {trendingNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
              </div>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center text-blue-600 font-semibold cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingNews.slice(0, 6).map((news, index) => (
                <NewsCard key={news._id} news={news} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Ad Space */}
        <AdSense slot="sidebar" />

        {/* Latest News Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestNews.map((news, index) => (
              <NewsCard key={news._id} news={news} index={index} />
            ))}
          </div>
        </section>

        {/* Bottom Ad Space */}
        <AdSense slot="footer" />

        {/* Stats Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Powered by Artificial Intelligence
              </h3>
              <p className="text-gray-600">
                Real-time news generation with advanced AI technology
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Daily Articles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">9</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">28</div>
                <div className="text-gray-600">States Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Auto Updates</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}