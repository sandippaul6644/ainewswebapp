import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['politics', 'sports', 'technology', 'entertainment', 'business', 'health', 'education', 'crime', 'weather', 'trending'],
    index: true
  },
  subcategory: {
    type: String,
    index: true
  },
  state: {
    type: String,
    index: true
  },
  city: {
    type: String,
    index: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePrompt: {
    type: String
  },
  tags: [{
    type: String,
    index: true
  }],
  source: {
    type: String,
    default: 'AI Generated'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  generationMetadata: {
    apiKeyUsed: String,
    generatedAt: Date,
    model: String
  }
}, {
  timestamps: true
});

// Create compound indexes for better query performance
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ trending: 1, publishedAt: -1 });
newsSchema.index({ featured: 1, publishedAt: -1 });
newsSchema.index({ state: 1, category: 1, publishedAt: -1 });

// Generate slug before saving
newsSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
  }
  next();
});

export default mongoose.model('News', newsSchema);