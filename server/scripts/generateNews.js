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

// Token and Image tracking
let dailyTokenUsage = 0;
let dailyImageUsage = 0;
let lastResetDate = new Date().toDateString();
const dailyImageQuota = parseInt(process.env.DAILY_IMAGE_QUOTA) || 50;
const imageGenerationEnabled = process.env.IMAGE_GENERATION_ENABLED === 'true';

const resetDailyCounters = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyTokenUsage = 0;
    dailyImageUsage = 0;
    lastResetDate = today;
    console.log('🔄 Daily usage counters reset');
  }
};

const checkTokenQuota = (estimatedTokens) => {
  resetDailyCounters();
  if (dailyTokenUsage + estimatedTokens > dailyTokenQuota) {
    throw new Error(`⚠️ Daily token quota (${dailyTokenQuota}) would be exceeded. Used: ${dailyTokenUsage}, Requested: ${estimatedTokens}`);
  }
};

const checkImageQuota = () => {
  resetDailyCounters();
  if (dailyImageUsage >= dailyImageQuota) {
    throw new Error(`⚠️ Daily image quota (${dailyImageQuota}) exceeded. Used: ${dailyImageUsage}`);
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

const generateNewsImage = async (title, category, location) => {
  try {
    const keywords = extractImageKeywords(title, category, location);
    const searchQuery = keywords[0]; // Use primary keyword
    
    // Try Pexels API first
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (pexelsApiKey) {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=10`, {
        headers: { 'Authorization': pexelsApiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)];
          console.log(`📸 Using Pexels image for: ${searchQuery}`);
          return randomPhoto.src.large;
        }
      }
    }
    
    // Fallback to Unsplash
    const fallbackUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchQuery)}`;
    console.log(`📸 Using Unsplash fallback for: ${searchQuery}`);
    return fallbackUrl;
    
  } catch (error) {
    console.error('❌ Stock image fetch failed:', error.message);
    const keywords = extractImageKeywords(title, category, location);
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(keywords[0])}`;
  }
};

const createImagePrompt = (title, category, location) => {
  const basePrompts = {
    politics: "A professional news photograph showing Indian government buildings, political rally, or official meeting",
    sports: "A dynamic sports photograph showing Indian athletes, cricket stadium, or sporting event", 
    technology: "A modern technology photograph showing Indian IT office, computers, or digital innovation",
    entertainment: "A vibrant entertainment photograph showing Bollywood cinema, cultural event, or festival",
    business: "A professional business photograph showing Indian corporate office, startup, or economic activity",
    health: "A clean medical photograph showing Indian hospital, healthcare workers, or wellness program",
    education: "An inspiring education photograph showing Indian school, students, or learning environment",
    crime: "A serious news photograph showing Indian police, security measures, or law enforcement",
    weather: "A dramatic weather photograph showing Indian monsoon, climate, or natural conditions"
  };
  
  const basePrompt = basePrompts[category] || basePrompts.politics;
  
  // Extract key elements from title
  const titleWords = title.toLowerCase().split(' ').slice(0, 5).join(' ');
  
  // Create comprehensive prompt
  const prompt = `${basePrompt} related to "${titleWords}" in ${location?.city || 'India'}, ${location?.state || 'India'}. Professional news photography style, high quality, realistic, suitable for Indian news website, natural lighting, no text overlay.`;
  
  return prompt.substring(0, 400); // DALL-E prompt limit
};

const extractImageKeywords = (title, category, location) => {
  const keywords = [category];
  
  if (location && location.city) {
    keywords.push(location.city);
  }
  
  const titleWords = title.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(word => 
      word.length > 3 && 
      !['news', 'latest', 'announces', 'launches', 'amid', 'with', 'from', 'this', 'that', 'will', 'have', 'been'].includes(word)
    )
    .slice(0, 3);
  
  keywords.push(...titleWords);
  keywords.push('india');
  
  return keywords.slice(0, 5);
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

          // Generate image
          const imageUrl = await generateNewsImage(article.title, category, selectedLocation);
          
          const newsData = {
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            category,
            state: selectedLocation.state,
            city: selectedLocation.city,
            imageUrl: imageUrl || '',
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
        
        // Generate AI image for the article
        const imageUrl = await generateNewsImage(article.title, category, selectedLocation);

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
        
        // Add delay to avoid rate limiting (both text and image generation)
        await new Promise(resolve => setTimeout(resolve, 5000));
        
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
}
