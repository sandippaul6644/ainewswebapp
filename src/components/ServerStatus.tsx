import React, { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff, Database } from 'lucide-react';
import axios from 'axios';

interface ServerInfo {
  port: number;
  status: string;
  environment: string;
  timestamp: string;
  mongodb: string;
}

export default function ServerStatus() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await axios.get('/api/server-info', { timeout: 5000 });
        setServerInfo(response.data);
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
        setServerInfo(null);
      }
    };

    // Check immediately
    checkServerStatus();

    // Check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!serverInfo && !isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">Server Offline</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2 mb-1">
        <Server className="w-4 h-4" />
        <span className="text-sm font-medium">Server Running</span>
      </div>
      
      {serverInfo && (
        <div className="text-xs space-y-1">
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3" />
            <span>Port: {serverInfo.port}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Database className="w-3 h-3" />
            <span>DB: {serverInfo.mongodb}</span>
          </div>
          
          <div className="text-xs opacity-75">
            {serverInfo.environment}
          </div>
        </div>
      )}
    </div>
  );
}