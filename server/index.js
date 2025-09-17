import express from 'express';
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
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize server
const initializeServer = async () => {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-news-blog');
    console.log('Connected to MongoDB');
    
    // Check if database has sufficient news data (40 articles minimum)
    const newsCount = await News.countDocuments();
    console.log(`Found ${newsCount} news articles in database`);
    
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
    
    // Start the server after database is ready
    await startServer();
    
    // Setup cron jobs after server starts
    setupCronJobs();
    
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
  // Schedule daily news generation at 6 AM IST
  cron.schedule('0 6 * * *', async () => {
    console.log('Starting daily news generation...');
    try {
      await generateDailyNews();
      console.log('Daily news generation completed');
    } catch (error) {
      console.error('Error in daily news generation:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Schedule trending news updates every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    console.log('Updating trending news...');
    try {
      await generateDailyNews(10); // Generate 10 trending articles
      console.log('Trending news update completed');
    } catch (error) {
      console.error('Error in trending news update:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
  
  console.log('Cron jobs scheduled successfully');
};

// Initialize everything
initializeServer();