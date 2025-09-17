import React, { useState, useEffect } from 'react';
import { Settings, X, RefreshCw, Database, Server, Wifi } from 'lucide-react';
import axios from 'axios';

interface ServerInfo {
  port: number;
  status: string;
  environment: string;
  timestamp: string;
  mongodb: string;
}

interface NewsStats {
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function DevInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [newsStats, setNewsStats] = useState<NewsStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchServerInfo();
      fetchNewsStats();
    }
  }, [isOpen]);

  const fetchServerInfo = async () => {
    try {
      const response = await axios.get('/api/server-info');
      setServerInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch server info:', error);
    }
  };

  const fetchNewsStats = async () => {
    try {
      const response = await axios.get('/api/news?limit=1');
      setNewsStats(response.data);
    } catch (error) {
      console.error('Failed to fetch news stats:', error);
    }
  };

  const generateNews = async () => {
    setIsGenerating(true);
    try {
      await axios.post('/api/generate-news', { count: 5 });
      await fetchNewsStats();
      alert('News generated successfully!');
    } catch (error) {
      alert('Failed to generate news. Check console for details.');
      console.error('News generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Development Info"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-xl border p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Development Info
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Server Info */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-2">
            <Server className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-medium">Server Status</span>
          </div>
          {serverInfo ? (
            <div className="space-y-1 text-xs">
              <div>Port: {serverInfo.port}</div>
              <div>Environment: {serverInfo.environment}</div>
              <div className="flex items-center">
                <Database className="w-3 h-3 mr-1" />
                MongoDB: {serverInfo.mongodb}
              </div>
            </div>
          ) : (
            <div className="text-red-500">Server offline</div>
          )}
        </div>

        {/* News Stats */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-2">
            <Wifi className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">News Database</span>
          </div>
          {newsStats ? (
            <div className="text-xs">
              Total Articles: {newsStats.total}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">Loading...</div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={generateNews}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate 5 News Articles'
            )}
          </button>
          
          <button
            onClick={() => {
              fetchServerInfo();
              fetchNewsStats();
            }}
            className="w-full bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Info
          </button>
        </div>

        {/* URLs */}
        <div className="bg-blue-50 p-3 rounded text-xs">
          <div className="font-medium mb-1">Quick Links:</div>
          <div>Frontend: http://localhost:5173</div>
          <div>Backend: http://localhost:{serverInfo?.port || 3001}</div>
          <div>API Health: /api/health</div>
        </div>
      </div>
    </div>
  );
}