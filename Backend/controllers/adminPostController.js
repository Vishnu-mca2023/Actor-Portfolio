const Post = require('../models/Post');

const createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const post = await Post.create({
      title,
      description,
      media: file ? file.filename : null,
      mediaType: file ? file.mimetype.split('/')[0] : null,
      adminId: req.admin.id // from auth middleware
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPost, getPosts };
