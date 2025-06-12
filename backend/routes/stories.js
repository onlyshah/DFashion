const express = require('express');
const Story = require('../models/Story');
const { auth, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/stories
// @desc    Get all active stories
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get stories that haven't expired
    const stories = await Story.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('user', 'username fullName avatar socialStats')
    .populate('products.product', 'name price images brand')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Group stories by user
    const groupedStories = {};
    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: []
        };
      }
      groupedStories[userId].stories.push(story);
    });

    const result = Object.values(groupedStories);

    res.json({
      success: true,
      stories: stories,
      storyGroups: result
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/stories/user/:userId
// @desc    Get stories by user
// @access  Public
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('user', 'username fullName avatar')
    .populate('products.product', 'name price images brand')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      stories: stories
    });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stories
// @desc    Create new story
// @access  Private
router.post('/', [
  auth,
  body('media.type').isIn(['image', 'video']).withMessage('Invalid media type'),
  body('media.url').isURL().withMessage('Invalid media URL'),
  body('caption').optional().isLength({ max: 500 }).withMessage('Caption too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const storyData = {
      ...req.body,
      user: req.user._id
    };

    const story = new Story(storyData);
    await story.save();

    await story.populate('user', 'username fullName avatar');
    await story.populate('products.product', 'name price images brand');

    res.status(201).json({
      message: 'Story created successfully',
      story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stories/:id/view
// @desc    Mark story as viewed
// @access  Private
router.post('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user already viewed
    const alreadyViewed = story.viewers.some(
      viewer => viewer.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push({ user: req.user._id });
      story.analytics.views += 1;
      await story.save();
    }

    res.json({ message: 'Story viewed' });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stories/:id/like
// @desc    Like/unlike story
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const likeIndex = story.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      story.likes.splice(likeIndex, 1);
      story.analytics.likes -= 1;
    } else {
      // Like
      story.likes.push({ user: req.user._id });
      story.analytics.likes += 1;
    }

    await story.save();

    res.json({ 
      message: likeIndex > -1 ? 'Story unliked' : 'Story liked',
      likesCount: story.likes.length
    });
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/stories/:id/share
// @desc    Share story
// @access  Private
router.post('/:id/share', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (!story.settings.allowSharing) {
      return res.status(403).json({ message: 'Sharing not allowed for this story' });
    }

    story.shares.push({ user: req.user._id });
    story.analytics.shares += 1;
    await story.save();

    res.json({ message: 'Story shared successfully' });
  } catch (error) {
    console.error('Share story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/stories/:id
// @desc    Delete story
// @access  Private (Own stories only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user owns the story
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
