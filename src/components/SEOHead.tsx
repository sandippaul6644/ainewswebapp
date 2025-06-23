import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const defaultTitle = 'AI News India - Latest News Powered by Artificial Intelligence';
const defaultDescription = 'Get the latest news from across India powered by artificial intelligence. Politics, Sports, Technology, Entertainment, Business and more.';
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://your-domain.com';
const siteName = 'AI News India';

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  article
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image || `${siteUrl}/og-image.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'NewsArticle' : 'WebSite',
    name: siteName,
    url: siteUrl,
    ...(type === 'article' && article && {
      headline: title,
      description: fullDescription,
      image: fullImage,
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime,
      author: {
        '@type': 'Organization',
        name: 'AI News India'
      },
      publisher: {
        '@type': 'Organization',
        name: 'AI News India',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`
        }
      },
      articleSection: article.section,
      keywords: article.tags?.join(', ')
    })
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content="AI News India" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />

      {/* Article specific Open Graph tags */}
      {type === 'article' && article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="en-IN" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* AdSense Auto Ads */}
      {import.meta.env.VITE_ADSENSE_CLIENT_ID && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
      )}
    </Helmet>
  );
}