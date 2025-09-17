import mongoose from 'mongoose';
import News from './server/models/News.js';
import dotenv from 'dotenv';

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-news-blog');
    console.log('Connected to MongoDB');
    
    const result = await News.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} news articles`);
    
    await mongoose.disconnect();
    console.log('Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();