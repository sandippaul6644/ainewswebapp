import OpenAI from 'openai';
import News from '../models/News.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI clients with different API keys
const apiKeys = [
  process.env.OPENAI_API_KEY_1,
  process.env.OPENAI_API_KEY_2,
  process.env.OPENAI_API_KEY_3
].filter(Boolean);

const imageApiKey = process.env.OPENAI_IMAGE_API_KEY;

let currentKeyIndex = 0;

const getOpenAIClient = () => {
  const apiKey = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return new OpenAI({ apiKey });
};

const imageClient = imageApiKey ? new OpenAI({ apiKey: imageApiKey }) : null;

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
    const openai = getOpenAIClient();
    const prompt = generateNewsPrompt(category, location);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional Indian news writer. Generate realistic, engaging news articles with proper structure including title, content, and relevant details. Ensure the content is appropriate and factual in tone."
        },
        {
          role: "user",
          content: `${prompt}\n\nPlease provide the response in the following JSON format:
          {
            "title": "Engaging news headline",
            "content": "Full article content (minimum 300 words)",
            "excerpt": "Brief summary (50-100 words)",
            "tags": ["tag1", "tag2", "tag3"],
            "seoTitle": "SEO optimized title",
            "seoDescription": "SEO meta description",
            "seoKeywords": ["keyword1", "keyword2", "keyword3"]
          }`
        }
      ],
      temperature: 0.8
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating news article:', error);
    throw error;
  }
};

const generateNewsImage = async (title, category) => {
  if (!imageClient) return null;

  try {
    const prompt = generateImagePrompt(title, category);
    
    const response = await imageClient.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
};

export const generateDailyNews = async (count = 50) => {
  try {
    console.log(`Starting generation of ${count} news articles...`);
    
    for (let i = 0; i < count; i++) {
      try {
        // Select random category and location
        const category = categories[Math.floor(Math.random() * categories.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const city = location.cities[Math.floor(Math.random() * location.cities.length)];
        
        const selectedLocation = { state: location.state, city };

        // Generate article
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
            apiKeyUsed: currentKeyIndex.toString(),
            generatedAt: new Date(),
            model: 'gpt-4'
          }
        };

        const news = new News(newsData);
        await news.save();

        console.log(`Generated: ${article.title} (${category} - ${selectedLocation.city})`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error generating article ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`Successfully generated ${count} news articles`);
  } catch (error) {
    console.error('Error in generateDailyNews:', error);
    throw error;
  }
};

if (process.argv.includes('--run')) {
  generateDailyNews().then(() => process.exit(0));
}