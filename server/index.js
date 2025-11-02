import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

import newsRoutes from './routes/news.js';
import { generateDailyNews, generateInitialNews } from './scripts/generateNews.js';
import News from './models/News.js';

dotenv.config();

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Simple server start function
const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      resolve(server);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the process or use a different port.`);
        console.log('Run: npm run kill-port');
      } else {
        console.error('Server error:', error);
      }
      reject(error);
    });
  });
};

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  // Handle React Router
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }
  });
}

// Initialize server
const initializeServer = async () => {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-news-blog');
    console.log('Connected to MongoDB');
    
    // Check if database has sufficient news data (40 articles minimum)
    const newsCount = await News.countDocuments();
    console.log(`Found ${newsCount} news articles in database`);
    
    // Skip initial generation to start server immediately
    console.log(`Found ${newsCount} news articles in database. Starting server...`);
    
    // Uncomment below to generate initial news (will delay server start)
    /*
    if (newsCount < 40) {
      console.log(`📊 Insufficient news data (${newsCount}/40). Generating real AI news for all categories...`);
      try {
        await generateInitialNews();
        const newCount = await News.countDocuments();
        console.log(`✅ Real AI news generation completed. Total articles: ${newCount}`);
      } catch (error) {
        console.error('❌ Failed to generate real AI news:', error.message);
        console.log('⚠️ Server will continue but with limited content. Please check your OpenAI API keys.');
      }
    } else {
      console.log('✅ Sufficient news data found. Server ready.');
    }
    */
    
    // Start the server after database is ready
    await startServer();
    
    // Setup cron jobs after server starts
    // setupCronJobs(); // Disabled to prevent API hanging
    
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

// Routes (temporarily disabled to debug)
// app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works', timestamp: new Date().toISOString() });
});

// Test MongoDB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const count = await News.countDocuments();
    res.json({ message: 'Database works', count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple news test route
app.get('/api/test-news', async (req, res) => {
  try {
    const news = await News.findOne().select('title category');
    res.json({ message: 'News query works', sample: news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server info endpoint
app.get('/api/server-info', (req, res) => {
  res.json({
    port: PORT,
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Manual news generation endpoint
app.post('/api/generate-news', async (req, res) => {
  try {
    const { count = 5 } = req.body;
    console.log(`Manual news generation requested for ${count} articles`);
    
    await generateDailyNews(count);
    res.json({ 
      success: true, 
      message: `Successfully generated ${count} news articles`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual news generation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Setup cron jobs
const setupCronJobs = () => {
  // Generate articles immediately when server starts
  setTimeout(async () => {
    console.log('Starting initial news generation...');
    try {
      await generateDailyNews(9); // Generate 9 articles immediately
      console.log('Initial news generation completed');
    } catch (error) {
      console.error('Error in initial news generation:', error);
    }
  }, 5000); // Wait 5 seconds after server start

  // Schedule news generation every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Starting hourly news generation...');
    try {
      await generateDailyNews(9); // Generate 9 articles every hour
      console.log('Hourly news generation completed');
    } catch (error) {
      console.error('Error in hourly news generation:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
  
  console.log('Hourly news generation scheduled successfully');
};

// Initialize everything
initializeServer();