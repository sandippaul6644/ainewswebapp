import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';

import newsRoutes from './routes/news.js';
import { generateDailyNews } from './scripts/generateNews.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-news-blog')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});