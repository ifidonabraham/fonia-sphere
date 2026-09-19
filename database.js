const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = path.join(__dirname, 'fonia.db');
const db = new DatabaseSync(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      banner TEXT DEFAULT '',
      role TEXT DEFAULT 'Member',
      company TEXT DEFAULT 'Fonia Labs',
      location TEXT DEFAULT 'Lagos, Nigeria',
      website TEXT DEFAULT 'https://fonia-labs.vercel.app',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      tag TEXT DEFAULT 'General',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM users').get().cnt;
  if (count > 0) return;

  console.log('Seeding initial Fonia Labs network data...');

  const insertUser = db.prepare(`
    INSERT INTO users (username, name, bio, avatar, banner, role, company, location, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    {
      username: 'ifidonabraham',
      name: 'Ifidon Abraham',
      bio: 'Founder & Lead Architect @ Fonia Labs. Where Ideas Become Companies. Building the next generation of venture-scale digital products and platforms 🚀',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      role: 'Founder & Builder',
      company: 'Fonia Labs',
      location: 'Lagos & Global',
      website: 'https://fonia-labs.vercel.app'
    },
    {
      username: 'fontech_lead',
      name: 'FonTech Engineering',
      bio: 'Software production and digital services wing under Fonia Labs. Building production web platforms, 3D landing pages, and enterprise dashboards.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      role: 'Core Company',
      company: 'FonTech',
      location: 'Lagos, Nigeria',
      website: 'https://fontech-site.vercel.app'
    },
    {
      username: 'dokito_health',
      name: 'Dokito Care',
      bio: 'Transforming health access, digital record management, and clinic navigation across Africa. Health at your fingertips 🏥',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
      role: 'HealthTech Platform',
      company: 'Dokito',
      location: 'Lagos, Nigeria',
      website: 'https://dokito.vercel.app'
    },
    {
      username: 'omega_estate',
      name: 'OmegaEstate Hub',
      bio: 'Property discovery and real estate technology for a cleaner, verified property finding experience 🏡',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      role: 'PropTech Venture',
      company: 'OmegaEstate',
      location: 'Lagos, Nigeria',
      website: 'https://omegaestate.vercel.app'
    },
    {
      username: 'smaid_logistics',
      name: 'SMaid Retail & Ops',
      bio: 'Making supermarket shopping, smart queueing, and rapid delivery support frictionless 🛒',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80',
      role: 'Logistics Platform',
      company: 'SMaid',
      location: 'Lagos, Nigeria',
      website: 'https://smaid.vercel.app'
    },
    {
      username: 'tola_dev',
      name: 'Tola Adebayo',
      bio: 'Fullstack builder & Fonia ecosystem developer. Excited about high-performance web systems and AI tools!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      role: 'Community Builder',
      company: 'Fonia Labs',
      location: 'Abuja, Nigeria',
      website: 'https://fonia-labs.vercel.app'
    }
  ];

  for (const u of users) {
    insertUser.run(u.username, u.name, u.bio, u.avatar, u.banner, u.role, u.company, u.location, u.website);
  }

  // Insert sample follows
  const insertFollow = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
  // Alex follows FonTech, Dokito, OmegaEstate
  insertFollow.run(1, 2);
  insertFollow.run(1, 3);
  insertFollow.run(1, 4);
  // FonTech follows Alex, Dokito
  insertFollow.run(2, 1);
  insertFollow.run(2, 3);
  // Dokito follows Alex, FonTech, SMaid
  insertFollow.run(3, 1);
  insertFollow.run(3, 2);
  insertFollow.run(3, 5);
  // Tola follows Alex, FonTech, Dokito, OmegaEstate
  insertFollow.run(6, 1);
  insertFollow.run(6, 2);
  insertFollow.run(6, 3);
  insertFollow.run(6, 4);

  // Insert sample posts
  const insertPost = db.prepare(`
    INSERT INTO posts (user_id, content, image_url, tag, created_at)
    VALUES (?, ?, ?, ?, datetime('now', ?))
  `);

  insertPost.run(
    1,
    'Welcome to Fonia Sphere! 🌐 We built this social platform for all founders, engineers, and creators in the Fonia Labs network. Here you can showcase your launches, share progress, and collaborate across our ventures.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    '#FoniaLabs',
    '-10 hours'
  );

  insertPost.run(
    2,
    'FonTech has officially shipped the new responsive design system! ⚡ Featuring deep obsidian dark modes, cyan ambient lighting, and sub-second page loads. What do you all think?',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    '#FonTech',
    '-8 hours'
  );

  insertPost.run(
    3,
    'Big milestone for Dokito Care: over 1,200 patient-clinic navigations completed this month across Lagos! Making emergency access simple and direct for everyone.',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80',
    '#Dokito',
    '-5 hours'
  );

  insertPost.run(
    4,
    'OmegaEstate v2 now features verified landlord tags and interactive neighborhood discovery. Finding clean apartments without middleman extortion is finally becoming reality.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    '#OmegaEstate',
    '-3 hours'
  );

  insertPost.run(
    6,
    'Pairing with the team on a new community leaderboard. Love how fast Express and SQLite feel in Node 22! #buildinpublic #webdev',
    '',
    '#buildinpublic',
    '-1 hour'
  );

  // Insert likes
  const insertLike = db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)');
  insertLike.run(1, 2);
  insertLike.run(1, 3);
  insertLike.run(1, 4);
  insertLike.run(1, 6);
  insertLike.run(2, 1);
  insertLike.run(2, 6);
  insertLike.run(3, 1);
  insertLike.run(3, 2);
  insertLike.run(4, 1);
  insertLike.run(5, 1);
  insertLike.run(5, 2);

  // Insert comments
  const insertComment = db.prepare(`
    INSERT INTO comments (post_id, user_id, content, created_at)
    VALUES (?, ?, ?, datetime('now', ?))
  `);

  insertComment.run(1, 2, 'Incredible work on the network launch! Excited to connect our builders.', '-9 hours');
  insertComment.run(1, 3, 'Dokito is proud to be part of the Fonia Labs family 💙', '-8 hours');
  insertComment.run(2, 1, 'The cyan glow and contrast ratio look razor sharp.', '-7 hours');
  insertComment.run(3, 4, 'Massive congratulations to the Dokito team! Genuine impact on lives.', '-4 hours');
  insertComment.run(5, 1, 'Keep pushing, Tola! Love the momentum.', '-30 minutes');

  console.log('Fonia Labs initial seed completed.');
}

// Queries Helper Functions

function getAllUsers(currentUserId = null) {
  const users = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
      ) THEN 1 ELSE 0 END AS is_following
    FROM users u
    ORDER BY u.id ASC
  `).all(currentUserId, currentUserId);
  return users;
}

function getUserById(id, currentUserId = null) {
  const user = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
      ) THEN 1 ELSE 0 END AS is_following
    FROM users u
    WHERE u.id = ?
  `).get(currentUserId, currentUserId, id);
  return user;
}

function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

function createUser({ username, name, bio = '', avatar = '', role = 'Member', company = 'Fonia Labs' }) {
  const insert = db.prepare(`
    INSERT INTO users (username, name, bio, avatar, role, company)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = insert.run(username, name, bio, avatar, role, company);
  return getUserById(result.lastInsertRowid);
}

function updateUser(id, { name, bio, avatar, banner, role, company, location, website }) {
  const stmt = db.prepare(`
    UPDATE users
    SET name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar),
        banner = COALESCE(?, banner),
        role = COALESCE(?, role),
        company = COALESCE(?, company),
        location = COALESCE(?, location),
        website = COALESCE(?, website)
    WHERE id = ?
  `);
  stmt.run(name, bio, avatar, banner, role, company, location, website, id);
  return getUserById(id);
}

function getPosts({ feed = 'all', tag = null, search = null, userId = null, currentUserId = null }) {
  let query = `
    SELECT p.*,
      u.username, u.name as user_name, u.avatar as user_avatar, u.role as user_role, u.company as user_company,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?
      ) THEN 1 ELSE 0 END AS user_has_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params = [currentUserId, currentUserId];

  if (userId) {
    query += ' AND p.user_id = ?';
    params.push(userId);
  }

  if (tag) {
    query += ' AND (p.tag LIKE ? OR p.content LIKE ?)';
    params.push(`%${tag}%`, `%${tag}%`);
  }

  if (search) {
    query += ' AND (p.content LIKE ? OR u.name LIKE ? OR u.username LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (feed === 'following' && currentUserId) {
    query += ` AND p.user_id IN (
      SELECT following_id FROM follows WHERE follower_id = ?
    )`;
    params.push(currentUserId);
  }

  if (feed === 'trending') {
    query += ' ORDER BY (likes_count * 2 + comments_count * 3) DESC, p.created_at DESC';
  } else {
    query += ' ORDER BY p.created_at DESC';
  }

  return db.prepare(query).all(...params);
}

function getLikedPosts(userId, currentUserId = null) {
  const query = `
    SELECT p.*,
      u.username, u.name as user_name, u.avatar as user_avatar, u.role as user_role, u.company as user_company,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?
      ) THEN 1 ELSE 0 END AS user_has_liked
    FROM likes l
    JOIN posts p ON l.post_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE l.user_id = ?
    ORDER BY l.created_at DESC
  `;
  return db.prepare(query).all(currentUserId, currentUserId, userId);
}

function createPost({ userId, content, imageUrl = '', tag = 'General' }) {
  const insert = db.prepare(`
    INSERT INTO posts (user_id, content, image_url, tag)
    VALUES (?, ?, ?, ?)
  `);
  const res = insert.run(userId, content, imageUrl, tag);
  return getPostById(res.lastInsertRowid, userId);
}

function getPostById(id, currentUserId = null) {
  const query = `
    SELECT p.*,
      u.username, u.name as user_name, u.avatar as user_avatar, u.role as user_role, u.company as user_company,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?
      ) THEN 1 ELSE 0 END AS user_has_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `;
  return db.prepare(query).get(currentUserId, currentUserId, id);
}

function deletePost(id, userId) {
  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(id);
  if (!post) return { error: 'Post not found', status: 404 };
  if (post.user_id !== userId) return { error: 'Unauthorized to delete this post', status: 403 };
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  return { success: true };
}

function getComments(postId) {
  const query = `
    SELECT c.*,
      u.username, u.name as user_name, u.avatar as user_avatar, u.role as user_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  return db.prepare(query).all(postId);
}

function createComment({ postId, userId, content }) {
  const insert = db.prepare(`
    INSERT INTO comments (post_id, user_id, content)
    VALUES (?, ?, ?)
  `);
  const res = insert.run(postId, userId, content);
  const comment = db.prepare(`
    SELECT c.*,
      u.username, u.name as user_name, u.avatar as user_avatar, u.role as user_role
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(res.lastInsertRowid);
  return comment;
}

function deleteComment(commentId, userId) {
  const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(commentId);
  if (!comment) return { error: 'Comment not found', status: 404 };
  if (comment.user_id !== userId) return { error: 'Unauthorized to delete this comment', status: 403 };
  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  return { success: true };
}

function toggleLike(postId, userId) {
  const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  let liked = false;
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
    liked = false;
  } else {
    db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
    liked = true;
  }
  const likesCount = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId).count;
  return { liked, likesCount };
}

function toggleFollow(followerId, targetUserId) {
  if (followerId === targetUserId) {
    return { error: 'Cannot follow yourself', status: 400 };
  }
  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, targetUserId);
  let following = false;
  if (existing) {
    db.prepare('DELETE FROM follows WHERE id = ?').run(existing.id);
    following = false;
  } else {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(followerId, targetUserId);
    following = true;
  }
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(targetUserId).count;
  return { following, followersCount };
}

function getUserFollowers(userId, currentUserId = null) {
  const query = `
    SELECT u.*,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
      ) THEN 1 ELSE 0 END AS is_following
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = ?
    ORDER BY f.created_at DESC
  `;
  return db.prepare(query).all(currentUserId, currentUserId, userId);
}

function getUserFollowing(userId, currentUserId = null) {
  const query = `
    SELECT u.*,
      CASE WHEN ? IS NOT NULL AND EXISTS(
        SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
      ) THEN 1 ELSE 0 END AS is_following
    FROM follows f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `;
  return db.prepare(query).all(currentUserId, currentUserId, userId);
}

module.exports = {
  db,
  initDb,
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  getPosts,
  getPostById,
  getLikedPosts,
  createPost,
  deletePost,
  getComments,
  createComment,
  deleteComment,
  toggleLike,
  toggleFollow,
  getUserFollowers,
  getUserFollowing
};
