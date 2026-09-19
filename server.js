const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DB schema & seeds
db.initDb();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Storage Configuration (Memory Storage ensures zero filesystem dependency on Vercel & serverless)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Local uploads directory (if present)
const uploadDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadDir)) {
  app.use('/uploads', express.static(uploadDir));
}

// Fonia Labs Ecosystem Showcase Data
const foniaEcosystem = [
  {
    name: 'FonTech',
    slug: 'fontech',
    category: 'Software Production & Digital Services',
    tagline: 'Building websites, apps, and platforms for businesses.',
    url: 'https://fontech-site.vercel.app',
    tag: '#FonTech',
    tier: 'Core Company',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dokito',
    slug: 'dokito',
    category: 'Health Technology',
    tagline: 'Digital health access, support, and care navigation.',
    url: 'https://dokito.vercel.app',
    tag: '#Dokito',
    tier: 'Featured Company',
    avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'OmegaEstate',
    slug: 'omegaestate',
    category: 'Property Technology',
    tagline: 'Organized and transparent real estate discovery.',
    url: 'https://omegaestate.vercel.app',
    tag: '#OmegaEstate',
    tier: 'Featured Company',
    avatar: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'SMaid',
    slug: 'smaid',
    category: 'Retail & Logistics Support',
    tagline: 'Making supermarket shopping, queueing & delivery easier.',
    url: 'https://smaid.vercel.app',
    tag: '#SMaid',
    tier: 'Featured Company',
    avatar: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seek',
    slug: 'seek',
    category: 'Opportunity Discovery',
    tagline: 'Discover, organize, and act on career & funding opportunities.',
    url: 'https://seek-beryl.vercel.app',
    tag: '#Seek',
    tier: 'Featured Company',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'ContractFeed',
    slug: 'contractfeed',
    category: 'Contract & Tender Intelligence',
    tagline: 'Procurement intelligence and commercial contract alerts.',
    url: 'https://contractfeed.vercel.app',
    tag: '#ContractFeed',
    tier: 'Growth Company',
    avatar: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&auto=format&fit=crop&q=80'
  },
  {
    name: 'Deadline Dungeon',
    slug: 'deadline-dungeon',
    category: 'Game & Productivity',
    tagline: 'A gamified battle against task procrastination.',
    url: 'https://deadline-dungeon-phi.vercel.app',
    tag: '#DeadlineDungeon',
    tier: 'Labs Product',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80'
  }
];

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Ecosystem
app.get('/api/fonia/ecosystem', (req, res) => {
  res.json({ success: true, companies: foniaEcosystem });
});

// File Upload (Base64 Data URL avoids serverless ephemeral filesystem loss)
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    res.json({ success: true, url: dataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users
app.get('/api/users', (req, res) => {
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const users = db.getAllUsers(currentUserId);
  res.json({ success: true, users });
});

app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const user = db.getUserById(userId, currentUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user });
});

app.post('/api/users', (req, res) => {
  const { username, name, bio, avatar, role, company } = req.body;
  if (!username || !name) {
    return res.status(400).json({ error: 'Username and Name are required' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const existing = db.getUserByUsername(cleanUsername);
  if (existing) {
    return res.json({ success: true, user: existing, message: 'Existing user loaded' });
  }

  try {
    const newUser = db.createUser({
      username: cleanUsername,
      name: name.trim(),
      bio: bio || 'Builder in the Fonia Labs network.',
      avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
      role: role || 'Member',
      company: company || 'Fonia Labs'
    });
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, bio, avatar, banner, role, company, location, website } = req.body;
  try {
    const updated = db.updateUser(userId, { name, bio, avatar, banner, role, company, location, website });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/posts', (req, res) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const posts = db.getPosts({ userId, currentUserId });
  res.json({ success: true, posts });
});

app.get('/api/users/:id/likes', (req, res) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const posts = db.getLikedPosts(userId, currentUserId);
  res.json({ success: true, posts });
});

app.get('/api/users/:id/followers', (req, res) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const followers = db.getUserFollowers(userId, currentUserId);
  res.json({ success: true, followers });
});

app.get('/api/users/:id/following', (req, res) => {
  const userId = parseInt(req.params.id);
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const following = db.getUserFollowing(userId, currentUserId);
  res.json({ success: true, following });
});

app.post('/api/users/:id/follow', (req, res) => {
  const targetUserId = parseInt(req.params.id);
  const followerId = parseInt(req.body.followerId);

  if (!followerId) {
    return res.status(400).json({ error: 'followerId is required' });
  }

  const result = db.toggleFollow(followerId, targetUserId);
  if (result.error) {
    return res.status(result.status || 400).json({ error: result.error });
  }

  res.json({ success: true, ...result });
});

// Posts
app.get('/api/posts', (req, res) => {
  const feed = req.query.feed || 'all';
  const tag = req.query.tag || null;
  const search = req.query.search || null;
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;

  const posts = db.getPosts({ feed, tag, search, currentUserId });
  res.json({ success: true, posts });
});

app.get('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
  const post = db.getPostById(postId, currentUserId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ success: true, post });
});

app.post('/api/posts', (req, res) => {
  const { userId, content, imageUrl, tag } = req.body;
  if (!userId || !content || !content.trim()) {
    return res.status(400).json({ error: 'User ID and Content are required' });
  }

  try {
    const newPost = db.createPost({
      userId: parseInt(userId),
      content: content.trim(),
      imageUrl: imageUrl || '',
      tag: tag || 'General'
    });
    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = parseInt(req.body.userId);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required to verify ownership' });
  }

  const result = db.deletePost(postId, userId);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json({ success: true, message: 'Post deleted successfully' });
});

app.post('/api/posts/:id/like', (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = parseInt(req.body.userId);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const result = db.toggleLike(postId, userId);
  res.json({ success: true, ...result });
});

// Comments
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const comments = db.getComments(postId);
  res.json({ success: true, comments });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const { userId, content } = req.body;

  if (!userId || !content || !content.trim()) {
    return res.status(400).json({ error: 'userId and content are required' });
  }

  try {
    const comment = db.createComment({
      postId,
      userId: parseInt(userId),
      content: content.trim()
    });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', (req, res) => {
  const commentId = parseInt(req.params.id);
  const userId = parseInt(req.body.userId);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const result = db.deleteComment(commentId, userId);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.json({ success: true, message: 'Comment deleted successfully' });
});

// Favicon routes
app.get(['/favicon.ico', '/favicon.png'], (req, res) => {
  const faviconPath = path.join(__dirname, 'public', 'assets', 'favicon.svg');
  if (fs.existsSync(faviconPath)) {
    return res.sendFile(faviconPath);
  }
  res.status(204).end();
});

// Fallback to index.html for Single-Page Application routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

// Export app for Vercel Serverless Function runtime
module.exports = app;

// Start server when run directly (local development or standalone node)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Fonia Social Platform is live!`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`⚡ Fonia Labs Network Engine Ready`);
    console.log(`=========================================`);
  });
}
