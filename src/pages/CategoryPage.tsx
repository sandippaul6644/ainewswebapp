import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import AdSense from '../components/AdSense';
import { fetchNewsByCategory } from '../services/api';

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

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const categoryColors: { [key: string]: string } = {
    politics: 'from-red-500 to-red-600',
    sports: 'from-green-500 to-green-600',
    technology: 'from-blue-500 to-blue-600',
    entertainment: 'from-purple-500 to-purple-600',
    business: 'from-yellow-500 to-yellow-600',
    health: 'from-pink-500 to-pink-600',
    education: 'from-indigo-500 to-indigo-600',
    weather: 'from-cyan-500 to-cyan-600',
    trending: 'from-orange-500 to-red-500'
  };

  useEffect(() => {
    const loadCategoryNews = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        const data = await fetchNewsByCategory(category, { page: 1, limit: 12 });
        setNews(data.news);
        setTotalPages(data.totalPages);
        setPage(1);
      } catch (error) {
        console.error('Error loading category news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryNews();
  }, [category]);

  const loadMore = async () => {
    if (!category || page >= totalPages || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await fetchNewsByCategory(category, { page: nextPage, limit: 12 });
      setNews(prev => [...prev, ...data.news]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more news:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return <div>Category not found</div>;
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  const gradientClass = categoryColors[category] || 'from-gray-500 to-gray-600';

  return (
    <>
      <SEOHead
        title={`${categoryName} News - Latest Updates`}
        description={`Latest ${categoryName.toLowerCase()} news from across India. Stay updated with AI-generated news coverage.`}
        keywords={[category, 'news', 'India', 'latest', 'updates']}
      />

      <div className="max-w-7xl mx-auto">
        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${gradientClass} rounded-3xl p-8 mb-8 text-white`}
        >
          <h1 className="text-4xl font-bold mb-2">{categoryName} News</h1>
          <p className="text-lg opacity-90">
            Latest {categoryName.toLowerCase()} updates from across India
          </p>
          <div className="mt-4 text-sm opacity-75">
            {news.length} articles available
          </div>
        </motion.div>

        {/* Ad Space */}
        <AdSense slot="header" />

        {/* News Grid */}
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {news.map((newsItem, index) => (
              <NewsCard key={newsItem._id} news={newsItem} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No news articles found in this category.</p>
          </div>
        )}

        {/* Load More Button */}
        {page < totalPages && (
          <div className="text-center mb-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More News'}
            </button>
          </div>
        )}

        {/* Bottom Ad Space */}
        <AdSense slot="footer" />
      </div>
    </>
  );
}