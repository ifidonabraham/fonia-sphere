# Fonia Sphere 🌐
### The Social Network for the Fonia Labs Ecosystem

> **Fonia Labs** — *Where Ideas Become Companies.*  
> Built and founded by **Ifidon Abraham**.

---

## 📋 Overview (Task 2 Implementation)

**Fonia Sphere** is a full-stack mini social media platform designed specifically for the **Fonia Labs** venture-building ecosystem. It enables founders, builders, and ecosystem members to share project milestones, explore company updates, interact, and network.

### ✨ Implemented Features:
1. **User Profiles**:
   - Complete profile view with customizable avatar, cover banner, display name, handle, role/headline, company, bio, location, and website link.
   - Real-time counters for Posts, Followers, and Following.
   - Separate profile tabs for user's own **Posts** and **Liked Posts**.
   - Profile editor modal to update bio, headline, links, and avatars instantly.

2. **Posts & Comments**:
   - Central stream supporting rich updates with markdown-friendly text and image attachments (via file upload or image URL).
   - Feed segmentation: **Global Feed**, **Following Feed** (posts strictly from followed builders), and **Trending** (ranked dynamically by engagement score).
   - Topic tagging & quick filters: `#FoniaLabs`, `#FonTech`, `#Dokito`, `#OmegaEstate`, `#SMaid`, `#buildinpublic`.
   - Real-time search across post content, usernames, and display names.
   - Interactive comment drawer: view comments, add replies, and delete comments.
   - Post author deletion rights.

3. **Like & Follow System**:
   - One-click like toggle with animated heart icon and live counter updates.
   - Follow / Unfollow system with instantaneous follower count adjustments.
   - Interactive modal listing followers and following accounts.

4. **Multi-Account Switcher & Testing Sandbox**:
   - Quick account switcher modal to instantly change active user context among pre-seeded ecosystem companies (`Ifidon Abraham`, `FonTech Engineering`, `Dokito Care`, `OmegaEstate Hub`, `SMaid Retail & Ops`, `Tola Adebayo`).
   - Quick sign-up form to register and test new builder accounts on the fly.

5. **Ecosystem & Portfolio Showcase**:
   - Right sidebar highlighting active Fonia Labs portfolio companies (`FonTech`, `Dokito`, `OmegaEstate`, `SMaid`, `Seek`, `ContractFeed`, `Deadline Dungeon`).
   - Builder discovery widget ("Builders to Follow").
   - Official Fonia Labs badge widget and vector logo mark.

---

## 🛠️ Technology Stack

- **Frontend**: Responsive, modern Vanilla HTML5, modern CSS3 (custom cosmic obsidian dark theme with cyan and electric blue ambient lighting), and Vanilla JavaScript (ES6+ async/await). No heavy frontend build step required.
- **Backend**: **Node.js** with **Express.js 5**, `multer` for image uploads, and `cors`.
- **Database**: High-performance embedded **SQLite** via native `node:sqlite` (`DatabaseSync`), featuring schema tables for `users`, `posts`, `comments`, `likes`, and `follows` with foreign keys and cascading deletes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v22.x or later installed.

### 2. Start the Server
From the project folder (`C:\Users\PC\fonia`):
```bash
node server.js
```

The server will launch at:
```
http://localhost:3000
```

### 3. Open in Browser
Visit [http://localhost:3000](http://localhost:3000) to view and test the application!

---

## 📁 Project Structure

```
fonia/
├── database.js          # SQLite schema, seeds, and CRUD queries
├── server.js            # Express 5 REST API & static file server
├── package.json         # Dependencies (express, multer, cors)
├── fonia.db             # SQLite database file
├── uploads/             # Directory for uploaded post images
├── public/
│   ├── index.html       # Single-page social media application UI
│   ├── css/
│   │   └── style.css    # Obsidian cosmic dark theme & responsive layout
│   ├── js/
│   │   ├── api.js       # Centralized REST client
│   │   └── app.js       # Application state, UI rendering, event handling
│   └── assets/          # Fonia Labs logos, SVG marks, and badges
└── README.md            # Documentation
```
