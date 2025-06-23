import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import NewsDetail from './pages/NewsDetail';
import SearchResults from './pages/SearchResults';
import Footer from './components/Footer';
import AdSense from './components/AdSense';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <ScrollToTop />
          
          {/* Header AdSense */}
          <AdSense slot="header" />
          
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Footer AdSense */}
          <AdSense slot="footer" />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;