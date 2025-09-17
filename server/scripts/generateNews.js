import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import News from '../models/News.js';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI Configuration
const apiKey = process.env.OPENAI_API_KEY;
const primaryModel = process.env.OPENAI_PRIMARY_MODEL || 'gpt-4o-mini';
const fallbackModel = process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo';
const maxTokensPerArticle = parseInt(process.env.MAX_TOKENS_PER_ARTICLE) || 800;
const dailyTokenQuota = parseInt(process.env.DAILY_TOKEN_QUOTA) || 200000;

const openai = new OpenAI({ apiKey });

// Gemini Configuration (for future image generation)
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Token tracking
let dailyTokenUsage = 0;
let lastResetDate = new Date().toDateString();

const resetDailyTokens = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyTokenUsage = 0;
    lastResetDate = today;
    console.log('🔄 Daily token usage reset');
  }
};

const checkTokenQuota = (estimatedTokens) => {
  resetDailyTokens();
  if (dailyTokenUsage + estimatedTokens > dailyTokenQuota) {
    throw new Error(`⚠️ Daily token quota (${dailyTokenQuota}) would be exceeded. Used: ${dailyTokenUsage}, Requested: ${estimatedTokens}`);
  }
};



// Indian states and major cities
const locations = [
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'] },
  { state: 'Delhi', cities: ['New Delhi', 'Delhi'] },
  { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Udaipur', 'Jodhpur'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Durgapur', 'Siliguri'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra'] },
  { state: 'Haryana', cities: ['Gurgaon', 'Faridabad', 'Chandigarh'] },
  { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar'] }
];

const categories = [
  'politics', 'sports', 'technology', 'entertainment', 
  'business', 'health', 'education', 'crime', 'weather'
];

const generateNewsPrompt = (category, location) => {
  const prompts = {
    politics: `Generate a realistic Indian political news article about ${location.city}, ${location.state}. Include current political developments, government policies, or local political events. Make it engaging and informative.`,
    sports: `Create an Indian sports news article related to ${location.city}, ${location.state}. Cover local sports events, achievements, or sports infrastructure developments.`,
    technology: `Write a technology news article about IT developments, startups, or digital initiatives in ${location.city}, ${location.state}. Focus on innovation and technological progress.`,
    entertainment: `Generate an entertainment news article about Bollywood, regional cinema, or cultural events in ${location.city}, ${location.state}.`,
    business: `Create a business news article about economic developments, new business launches, or market trends in ${location.city}, ${location.state}.`,
    health: `Write a health-related news article about medical developments, health initiatives, or wellness programs in ${location.city}, ${location.state}.`,
    education: `Generate an education news article about schools, colleges, educational policies, or academic achievements in ${location.city}, ${location.state}.`,
    crime: `Create a crime news article about law enforcement activities or public safety measures in ${location.city}, ${location.state}. Keep it factual and responsible.`,
    weather: `Write a weather-related news article about climate conditions, monsoon updates, or weather alerts for ${location.city}, ${location.state}.`
  };

  return prompts[category] || prompts['politics'];
};

const generateImagePrompt = (title, category) => {
  return `Create a professional news image for an article titled "${title}" in the ${category} category. The image should be suitable for an Indian news website, with clean composition and relevant visual elements.`;
};

const generateNewsArticle = async (category, location) => {
  try {
    checkTokenQuota(maxTokensPerArticle);
    
    const prompt = generateNewsPrompt(category, location);
    let model = primaryModel;

    const completion = await openai.chat.completions.create({
      model,
      max_tokens: maxTokensPerArticle,
      messages: [
        {
          role: "system",
          content: "You are a professional Indian news writer. Generate realistic, engaging news articles with proper structure. Keep responses concise but informative."
        },
        {
          role: "user",
          content: `${prompt}\n\nRespond in JSON format:
          {
            "title": "Engaging news headline",
            "content": "Full article content (250-400 words)",
            "excerpt": "Brief summary (40-80 words)",
            "tags": ["tag1", "tag2", "tag3"],
            "seoTitle": "SEO optimized title",
            "seoDescription": "SEO meta description",
            "seoKeywords": ["keyword1", "keyword2", "keyword3"]
          }`
        }
      ],
      temperature: 0.7
    });

    // Track token usage
    const tokensUsed = completion.usage?.total_tokens || maxTokensPerArticle;
    dailyTokenUsage += tokensUsed;
    console.log(`📊 Tokens used: ${tokensUsed}, Daily total: ${dailyTokenUsage}/${dailyTokenQuota}`);

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    if (error.message.includes('quota')) {
      throw error;
    }
    
    // Try fallback model
    console.log(`⚠️ Primary model failed, trying ${fallbackModel}...`);
    try {
      const completion = await openai.chat.completions.create({
        model: fallbackModel,
        max_tokens: maxTokensPerArticle,
        messages: [
          {
            role: "system",
            content: "Generate a concise Indian news article in JSON format."
          },
          {
            role: "user",
            content: generateNewsPrompt(category, location)
          }
        ],
        temperature: 0.7
      });
      
      const tokensUsed = completion.usage?.total_tokens || maxTokensPerArticle;
      dailyTokenUsage += tokensUsed;
      
      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (fallbackError) {
      console.error('Both models failed:', fallbackError);
      throw fallbackError;
    }
  }
};

const generateNewsImage = async (title, category) => {
  // For now, skip image generation to focus on text content
  // Gemini's image generation API is still evolving
  console.log(`🖼️ Skipping image generation for: ${title.substring(0, 40)}...`);
  
  // Return a placeholder image URL based on category
  const placeholderImages = {
    politics: 'https://via.placeholder.com/800x600/dc2626/ffffff?text=Politics+News',
    sports: 'https://via.placeholder.com/800x600/16a34a/ffffff?text=Sports+News',
    technology: 'https://via.placeholder.com/800x600/2563eb/ffffff?text=Tech+News',
    entertainment: 'https://via.placeholder.com/800x600/9333ea/ffffff?text=Entertainment',
    business: 'https://via.placeholder.com/800x600/eab308/ffffff?text=Business+News',
    health: 'https://via.placeholder.com/800x600/ec4899/ffffff?text=Health+News',
    education: 'https://via.placeholder.com/800x600/6366f1/ffffff?text=Education+News',
    crime: 'https://via.placeholder.com/800x600/ef4444/ffffff?text=Crime+News',
    weather: 'https://via.placeholder.com/800x600/06b6d4/ffffff?text=Weather+News'
  };
  
  return placeholderImages[category] || placeholderImages.politics;
};



export const generateInitialNews = async () => {
  try {
    console.log('Ensuring 5 articles per category (40 total)...');
    
    // Check existing articles per category
    const categoryStats = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const existingCounts = {};
    categoryStats.forEach(stat => {
      existingCounts[stat._id] = stat.count;
    });
    
    // Validate API key
    if (!apiKey || apiKey.includes('your-api-key')) {
      throw new Error('❌ Valid OpenAI API key required. Please update OPENAI_API_KEY in your .env file.');
    }
    
    console.log('✅ Valid API keys found. Generating real AI news...');

    let totalGenerated = 0;
    
    for (const category of categories) {
      const existing = existingCounts[category] || 0;
      const needed = Math.max(0, 5 - existing);
      
      if (needed === 0) {
        console.log(`Category ${category}: Already has ${existing} articles`);
        continue;
      }
      
      console.log(`Category ${category}: Generating ${needed} real AI articles (has ${existing})`);
      
      for (let i = 0; i < needed; i++) {
        try {
          const location = locations[Math.floor(Math.random() * locations.length)];
          const city = location.cities[Math.floor(Math.random() * location.cities.length)];
          const selectedLocation = { state: location.state, city };

          console.log(`🤖 Generating AI article ${i + 1}/${needed} for ${category} in ${city}...`);
          const article = await generateNewsArticle(category, selectedLocation);
          
          const trending = (existing + i) === 1;
          const featured = (existing + i) === 0;

          const newsData = {
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            category,
            state: selectedLocation.state,
            city: selectedLocation.city,
            imageUrl: '',
            tags: article.tags || [],
            trending,
            featured,
            seoTitle: article.seoTitle || article.title,
            seoDescription: article.seoDescription || article.excerpt,
            seoKeywords: article.seoKeywords || [],
            generationMetadata: {
              model: primaryModel,
              generatedAt: new Date(),
              tokensUsed: dailyTokenUsage
            }
          };

          const news = new News(newsData);
          await news.save();
          totalGenerated++;

          console.log(`✅ Generated: ${article.title.substring(0, 60)}...`);
          
          // Delay to avoid rate limiting and manage token usage
          await new Promise(resolve => setTimeout(resolve, 3000));
          
        } catch (error) {
          console.error(`Error generating article for ${category}:`, error);
          continue;
        }
      }
    }

    if (totalGenerated === 0) {
      throw new Error('❌ Failed to generate any real news articles. Check your OpenAI API keys and internet connection.');
    }
    
    console.log(`✅ Successfully generated ${totalGenerated} real AI news articles`);

  } catch (error) {
    console.error('❌ Error in generateInitialNews:', error.message);
    throw error; // No sample data fallback - must use real AI
  }
};

export const generateDailyNews = async (count = 50) => {
  try {
    console.log(`Starting generation of ${count} news articles with ${primaryModel}...`);
    
    for (let i = 0; i < count; i++) {
      try {
        // Check token quota before generating
        checkTokenQuota(maxTokensPerArticle);
        
        // Select random category and location
        const category = categories[Math.floor(Math.random() * categories.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const city = location.cities[Math.floor(Math.random() * location.cities.length)];
        
        const selectedLocation = { state: location.state, city };

        // Generate article
        console.log(`📝 Generating article ${i + 1}/${count}: ${category} from ${city}...`);
        const article = await generateNewsArticle(category, selectedLocation);
        
        // Generate image
        const imageUrl = await generateNewsImage(article.title, category);

        // Determine if article should be trending or featured
        const trending = Math.random() < 0.15; // 15% chance
        const featured = Math.random() < 0.1;  // 10% chance

        // Create news document
        const newsData = {
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          category,
          state: selectedLocation.state,
          city: selectedLocation.city,
          imageUrl: imageUrl || '',
          imagePrompt: imageUrl ? generateImagePrompt(article.title, category) : '',
          tags: article.tags || [],
          trending,
          featured,
          seoTitle: article.seoTitle || article.title,
          seoDescription: article.seoDescription || article.excerpt,
          seoKeywords: article.seoKeywords || [],
          generationMetadata: {
            model: primaryModel,
            generatedAt: new Date(),
            tokensUsed: dailyTokenUsage
          }
        };

        const news = new News(newsData);
        await news.save();

        console.log(`✅ Generated: ${article.title.substring(0, 50)}... (${category})`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        if (error.message.includes('quota')) {
          console.log(`⚠️ Daily token quota reached. Generated ${i} articles.`);
          break;
        }
        console.error(`Error generating article ${i + 1}:`, error.message);
        continue;
      }
    }

    console.log(`✅ Daily news generation completed. Token usage: ${dailyTokenUsage}/${dailyTokenQuota}`);
  } catch (error) {
    console.error('Error in generateDailyNews:', error);
    throw error;
  }
};

if (process.argv.includes('--run')) {
  generateDailyNews().then(() => process.exit(0));
} {
