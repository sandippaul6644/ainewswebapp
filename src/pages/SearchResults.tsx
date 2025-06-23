import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import { searchNews } from '../services/api';

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

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await searchNews(query, { limit: 20 });
        setResults(data.news);
        setTotalResults(data.total);
      } catch (error) {
        console.error('Error searching news:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SEOHead
        title={`Search Results for "${query}"`}
        description={`Search results for ${query} on AI News India. Find the latest news articles.`}
      />

      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          </div>
          <p className="text-gray-600 mb-2">
            Search query: <span className="font-semibold">"{query}"</span>
          </p>
          <p className="text-sm text-gray-500">
            {totalResults} result{totalResults !== 1 ? 's' : ''} found
          </p>
        </motion.div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((news, index) => (
              <NewsCard key={news._id} news={news} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-2xl shadow-lg"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find any articles matching your search for "{query}".
            </p>
            <div className="text-sm text-gray-500">
              <p>Try:</p>
              <ul className="mt-2 space-y-1">
                <li>• Using different keywords</li>
                <li>• Checking your spelling</li>
                <li>• Using more general terms</li>
                <li>• Browsing our categories instead</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}