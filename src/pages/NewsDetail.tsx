import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, Heart, Share2, Clock, MapPin, Tag, 
  Facebook, Twitter, Linkedin, ArrowLeft, 
  ThumbsUp, MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import SEOHead from '../components/SEOHead';
import AdSense from '../components/AdSense';
import { fetchNewsById, updateEngagement } from '../services/api';

interface NewsArticle {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  state: string;
  city: string;
  imageUrl: string;
  imagePrompt: string;
  views: number;
  likes: number;
  shares: number;
  publishedAt: string;
  slug: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  trending?: boolean;
  featured?: boolean;
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      if (!slug) return;
      
      try {
        const data = await fetchNewsById(slug);
        setNews(data);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [slug]);

  const handleLike = async () => {
    if (!news || liked) return;
    
    try {
      await updateEngagement(news._id, 'like');
      setNews(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      setLiked(true);
    } catch (error) {
      console.error('Error liking news:', error);
    }
  };

  const handleShare = async () => {
    if (!news) return;
    
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title,
          text: news.excerpt,
          url: url,
        });
        
        if (!shared) {
          await updateEngagement(news._id, 'share');
          setNews(prev => prev ? { ...prev, shares: prev.shares + 1 } : null);
          setShared(true);
        }
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const shareOnSocial = (platform: string) => {
    if (!news) return;
    
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(news.title);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    
    if (!shared) {
      updateEngagement(news._id, 'share');
      setNews(prev => prev ? { ...prev, shares: prev.shares + 1 } : null);
      setShared(true);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">News Article Not Found</h1>
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Home
        </Link>
      </div>
    );
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

  return (
    <>
      <SEOHead
        title={news.seoTitle || news.title}
        description={news.seoDescription || news.excerpt}
        keywords={news.seoKeywords}
        image={news.imageUrl}
        url={`/news/${news.slug}`}
        type="article"
        article={{
          publishedTime: news.publishedAt,
          author: 'AI News India',
          section: news.category,
          tags: news.tags
        }}
      />

      <article className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Category and Location */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`${categoryColors[news.category]} text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
            </span>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{news.city}, {news.state}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {news.excerpt}
          </p>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between py-4 border-y border-gray-200">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{news.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{news.likes} likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="w-4 h-4" />
                <span>{news.shares} shares</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                  liked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Like</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        {news.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </motion.div>
        )}

        {/* Ad Space */}
        <AdSense slot="article" />

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none mb-8"
        >
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: news.content.replace(/\n/g, '<br><br>') 
            }}
          />
        </motion.div>

        {/* Tags */}
        {news.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Share */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Share this article</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => shareOnSocial('facebook')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => shareOnSocial('twitter')}
              className="flex items-center space-x-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => shareOnSocial('linkedin')}
              className="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        {/* AI Attribution */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">AI Generated Content</h4>
              <p className="text-gray-600 text-sm">
                This article was automatically generated using advanced AI technology. 
                Images and content are created specifically for this news story.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Ad Space */}
        <AdSense slot="footer" />
      </article>
    </>
  );
}