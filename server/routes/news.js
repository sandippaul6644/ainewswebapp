import express from 'express';
import News from '../models/News.js';

const router = express.Router();

// Get all news with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      state,
      trending,
      featured,
      search
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (state) filter.state = state;
    if (trending === 'true') filter.trending = true;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const news = await News.find(filter)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const total = await News.countDocuments(filter);

    res.json({
      news,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single news article
router.get('/:slug', async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });
    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    // Increment views
    await News.findByIdAndUpdate(news._id, { $inc: { views: 1 } });

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending news
router.get('/trending/latest', async (req, res) => {
  try {
    const trending = await News.find({ trending: true })
      .sort({ publishedAt: -1 })
      .limit(10)
      .select('-content');

    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured news
router.get('/featured/latest', async (req, res) => {
  try {
    const featured = await News.find({ featured: true })
      .sort({ publishedAt: -1 })
      .limit(6)
      .select('-content');

    res.json(featured);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get news by category
router.get('/category/:category', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const { category } = req.params;

    const news = await News.find({ category })
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const total = await News.countDocuments({ category });

    res.json({
      news,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      category
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories with counts
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await News.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          latest: { $max: '$publishedAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update news engagement
router.patch('/:id/engagement', async (req, res) => {
  try {
    const { action } = req.body; // 'like' or 'share'
    const updateField = action === 'like' ? 'likes' : 'shares';

    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { [updateField]: 1 } },
      { new: true }
    );

    res.json({ [updateField]: news[updateField] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;