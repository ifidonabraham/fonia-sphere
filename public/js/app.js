/**
 * Fonia Social Platform — Main Interactive Client Logic
 */

// Application State
const state = {
  currentUser: null,
  currentFeed: 'all',
  currentTag: '',
  currentSearch: '',
  currentView: 'feed', // 'feed' | 'profile'
  viewingUserId: null,
  profileTab: 'posts', // 'posts' | 'likes'
  cachedUsers: [],
  composerImageUrl: ''
};

// DOM References
const elements = {
  // Navigation
  navFeed: document.getElementById('nav-feed'),
  navFollowing: document.getElementById('nav-following'),
  navTrending: document.getElementById('nav-trending'),
  navProfile: document.getElementById('nav-profile'),
  btnQuickCompose: document.getElementById('btn-quick-compose'),
  
  // Current user quick widget
  userQuickProfile: document.getElementById('user-quick-profile'),
  currentUserAvatar: document.getElementById('current-user-avatar'),
  currentUserName: document.getElementById('current-user-name'),
  currentUserHandle: document.getElementById('current-user-handle'),
  btnSwitchAccount: document.getElementById('btn-switch-account'),

  // Feed Header & Controls
  pageTitle: document.getElementById('page-title'),
  feedTabs: document.getElementById('feed-tabs'),
  tabAll: document.getElementById('tab-all'),
  tabFollowing: document.getElementById('tab-following'),
  tabTrending: document.getElementById('tab-trending'),
  searchInput: document.getElementById('search-input'),
  categoryScroller: document.getElementById('category-scroller'),

  // Composer
  composerCard: document.getElementById('composer-card'),
  composerAvatar: document.getElementById('composer-avatar'),
  postContentInput: document.getElementById('post-content-input'),
  postTagSelect: document.getElementById('post-tag-select'),
  btnAttachFile: document.getElementById('btn-attach-file'),
  fileInput: document.getElementById('file-input'),
  btnAttachUrl: document.getElementById('btn-attach-url'),
  imageUrlInputBox: document.getElementById('image-url-input-box'),
  composerPreviewContainer: document.getElementById('composer-preview-container'),
  composerPreviewImg: document.getElementById('composer-preview-img'),
  btnRemovePreview: document.getElementById('btn-remove-preview'),
  btnSubmitPost: document.getElementById('btn-submit-post'),

  // Containers
  feedContainer: document.getElementById('feed-container'),
  profileView: document.getElementById('profile-view'),

  // Profile View Elements
  profileBanner: document.getElementById('profile-banner'),
  profileAvatar: document.getElementById('profile-avatar'),
  profileName: document.getElementById('profile-name'),
  profileRoleBadge: document.getElementById('profile-role-badge'),
  profileHandle: document.getElementById('profile-handle'),
  profileBio: document.getElementById('profile-bio'),
  profileLocation: document.getElementById('profile-location'),
  profileWebsite: document.getElementById('profile-website'),
  profileJoined: document.getElementById('profile-joined'),
  profileStatPosts: document.getElementById('profile-stat-posts'),
  profileStatFollowers: document.getElementById('profile-stat-followers'),
  profileStatFollowing: document.getElementById('profile-stat-following'),
  profileActionBtnContainer: document.getElementById('profile-action-btn-container'),
  profileTabPosts: document.getElementById('profile-tab-posts'),
  profileTabLikes: document.getElementById('profile-tab-likes'),
  profilePostsContainer: document.getElementById('profile-posts-container'),

  // Right Widgets
  ecosystemList: document.getElementById('ecosystem-list'),
  whoToFollowList: document.getElementById('who-to-follow-list'),

  // Modals
  modalOverlay: document.getElementById('modal-overlay'),
  editProfileModal: document.getElementById('edit-profile-modal'),
  switchAccountModal: document.getElementById('switch-account-modal'),
  userListModal: document.getElementById('user-list-modal'),
  userListModalTitle: document.getElementById('user-list-modal-title'),
  userListModalContent: document.getElementById('user-list-modal-content'),

  // Edit Profile Form
  editName: document.getElementById('edit-name'),
  editBio: document.getElementById('edit-bio'),
  editRole: document.getElementById('edit-role'),
  editCompany: document.getElementById('edit-company'),
  editLocation: document.getElementById('edit-location'),
  editWebsite: document.getElementById('edit-website'),
  editAvatar: document.getElementById('edit-avatar'),
  editBanner: document.getElementById('edit-banner'),
  formEditProfile: document.getElementById('form-edit-profile'),

  // New Account Form
  formNewAccount: document.getElementById('form-new-account'),
  newUsername: document.getElementById('new-username'),
  newName: document.getElementById('new-name'),
  newBio: document.getElementById('new-bio'),
  userSwitchList: document.getElementById('user-switch-list'),

  // Toast
  toastContainer: document.getElementById('toast-container')
};

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
async function initApp() {
  setupEventListeners();
  await loadCurrentUser();
  await Promise.all([
    loadFeed(),
    loadEcosystemWidget(),
    loadWhoToFollowWidget()
  ]);
}

async function loadCurrentUser() {
  const savedUserId = localStorage.getItem('fonia_current_user_id');
  const res = await api.getUsers();
  if (res.success && res.users.length > 0) {
    state.cachedUsers = res.users;
    let target = null;
    if (savedUserId) {
      target = res.users.find(u => u.id === parseInt(savedUserId));
    }
    state.currentUser = target || res.users[0];
    localStorage.setItem('fonia_current_user_id', state.currentUser.id);
    updateCurrentUserUI();
  }
}

function updateCurrentUserUI() {
  if (!state.currentUser) return;
  elements.currentUserAvatar.src = state.currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
  elements.currentUserName.textContent = state.currentUser.name;
  elements.currentUserHandle.textContent = `@${state.currentUser.username}`;
  elements.composerAvatar.src = state.currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
}

// ----------------------------------------------------
// FEED LOADING & RENDERING
// ----------------------------------------------------
async function loadFeed() {
  elements.feedContainer.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--muted);">
      <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid var(--line); border-top-color: var(--cyan); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 14px; font-size: 14px;">Streaming Fonia Network posts...</p>
    </div>
  `;

  try {
    const res = await api.getPosts({
      feed: state.currentFeed,
      tag: state.currentTag,
      search: state.currentSearch,
      currentUserId: state.currentUser ? state.currentUser.id : null
    });

    if (!res.success || !res.posts) {
      elements.feedContainer.innerHTML = `<p style="text-align:center; padding: 30px; color: var(--muted);">Failed to load posts.</p>`;
      return;
    }

    if (res.posts.length === 0) {
      elements.feedContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; background: var(--card); border-radius: var(--radius-lg); border: 1px solid var(--line);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="1.8" style="margin-bottom: 12px; opacity: 0.85;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="font-size: 18px; color: #fff; margin-bottom: 6px;">No posts found</h3>
          <p style="font-size: 14px; color: var(--muted); max-width: 380px; margin: 0 auto;">
            ${state.currentFeed === 'following' 
              ? "You aren't following anyone with posts yet, or they haven't posted. Check out who to follow in the sidebar!" 
              : "No posts match the current filter or search query. Be the first to share an update!"}
          </p>
        </div>
      `;
      return;
    }

    elements.feedContainer.innerHTML = '';
    res.posts.forEach(post => {
      elements.feedContainer.appendChild(createPostElement(post));
    });
  } catch (err) {
    elements.feedContainer.innerHTML = `<p style="text-align:center; padding: 30px; color: var(--muted);">Error loading feed: ${err.message}</p>`;
  }
}

function createPostElement(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  const isOwner = state.currentUser && state.currentUser.id === post.user_id;
  const timeFormatted = formatTimeAgo(post.created_at);

  // Format hashtags in content
  const formattedContent = escapeHtml(post.content).replace(/#([A-Za-z0-9_-]+)/g, (match) => {
    return `<span class="hashtag" data-tag="${match}">${match}</span>`;
  });

  card.innerHTML = `
    <div class="post-header">
      <div class="post-author-lockup" data-user-id="${post.user_id}">
        <img class="post-author-avatar" src="${post.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" alt="${escapeHtml(post.user_name)}" />
        <div class="post-author-info">
          <div class="post-author-name-row">
            <span class="post-author-name">${escapeHtml(post.user_name)}</span>
            <span class="post-author-role-badge">${escapeHtml(post.user_role || 'Builder')}</span>
          </div>
          <div class="post-meta-row">
            <span>@${escapeHtml(post.username)}</span>
            <span>•</span>
            <span class="post-time">${timeFormatted}</span>
            ${post.tag && post.tag !== 'General' ? `<span class="post-tag-badge">${escapeHtml(post.tag)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="post-header-actions">
        ${isOwner ? `
          <button class="btn-post-menu btn-delete-post" title="Delete Post" data-post-id="${post.id}">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    </div>

    <div class="post-content">${formattedContent}</div>

    ${post.image_url ? `
      <div class="post-media">
        <img class="post-media-img" src="${post.image_url}" alt="Post attachment" loading="lazy" />
      </div>
    ` : ''}

    <div class="post-footer">
      <div class="post-metrics-left">
        <button class="btn-metric btn-like ${post.user_has_liked ? 'liked' : ''}" data-post-id="${post.id}">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="like-count">${post.likes_count}</span>
        </button>

        <button class="btn-metric btn-comment" data-post-id="${post.id}">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span class="comment-count">${post.comments_count}</span>
        </button>

        <button class="btn-metric btn-share" data-post-id="${post.id}" title="Share Post">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>

    <!-- Collapsible Comments Section -->
    <div class="comments-section" id="comments-section-${post.id}">
      <div class="comment-composer">
        <img class="comment-input-avatar" src="${state.currentUser ? state.currentUser.avatar : ''}" alt="Avatar" />
        <input type="text" class="comment-input" placeholder="Add a comment for the Fonia network..." />
        <button class="btn-comment-submit" data-post-id="${post.id}">Reply</button>
      </div>
      <div class="comments-list" id="comments-list-${post.id}">
        <!-- Comments loaded dynamically -->
      </div>
    </div>
  `;

  // Attach Post Handlers
  // 1. Author Click -> Open Profile
  const authorLockup = card.querySelector('.post-author-lockup');
  authorLockup.addEventListener('click', () => {
    openProfileView(post.user_id);
  });

  // 2. Hashtag Click -> Filter Feed
  card.querySelectorAll('.hashtag').forEach(tagEl => {
    tagEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = tagEl.dataset.tag;
      selectCategoryTag(tag);
    });
  });

  // 3. Like Button Toggle
  const likeBtn = card.querySelector('.btn-like');
  likeBtn.addEventListener('click', async () => {
    if (!state.currentUser) {
      showToast('Please select an account to like posts');
      return;
    }
    const res = await api.toggleLike(post.id, state.currentUser.id);
    if (res.success) {
      const countEl = likeBtn.querySelector('.like-count');
      countEl.textContent = res.likesCount;
      if (res.liked) {
        likeBtn.classList.add('liked');
        showToast('Post liked! ❤️');
      } else {
        likeBtn.classList.remove('liked');
      }
    }
  });

  // 4. Comment Button Toggle
  const commentBtn = card.querySelector('.btn-comment');
  const commentsSection = card.querySelector(`#comments-section-${post.id}`);
  commentBtn.addEventListener('click', () => {
    const isOpen = commentsSection.classList.contains('open');
    if (isOpen) {
      commentsSection.classList.remove('open');
      commentBtn.classList.remove('active-thread');
    } else {
      commentsSection.classList.add('open');
      commentBtn.classList.add('active-thread');
      loadComments(post.id);
    }
  });

  // 5. Submit Comment
  const commentInput = card.querySelector('.comment-input');
  const commentSubmitBtn = card.querySelector('.btn-comment-submit');
  const handleCommentSubmit = async () => {
    const text = commentInput.value.trim();
    if (!text) return;
    if (!state.currentUser) {
      showToast('Please select an account to comment');
      return;
    }
    const res = await api.createComment({
      postId: post.id,
      userId: state.currentUser.id,
      content: text
    });
    if (res.success && res.comment) {
      commentInput.value = '';
      const listEl = card.querySelector(`#comments-list-${post.id}`);
      listEl.appendChild(createCommentElement(res.comment, post.id));
      const countEl = commentBtn.querySelector('.comment-count');
      countEl.textContent = parseInt(countEl.textContent || '0') + 1;
      showToast('Comment posted! 💬');
    }
  };

  commentSubmitBtn.addEventListener('click', handleCommentSubmit);
  commentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCommentSubmit();
  });

  // 6. Delete Post
  const deleteBtn = card.querySelector('.btn-delete-post');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        const res = await api.deletePost(post.id, state.currentUser.id);
        if (res.success) {
          card.remove();
          showToast('Post deleted.');
        } else {
          showToast(res.error || 'Failed to delete post');
        }
      }
    });
  }

  // 7. Share Post
  const shareBtn = card.querySelector('.btn-share');
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.origin + `?post=${post.id}`);
    showToast('Post link copied to clipboard! 🔗');
  });

  return card;
}

// ----------------------------------------------------
// COMMENTS LOADING & RENDERING
// ----------------------------------------------------
async function loadComments(postId) {
  const listEl = document.getElementById(`comments-list-${postId}`);
  if (!listEl) return;
  listEl.innerHTML = `<p style="font-size:12px; color: var(--muted); padding: 8px 0;">Loading replies...</p>`;

  const res = await api.getComments(postId);
  if (res.success && res.comments) {
    if (res.comments.length === 0) {
      listEl.innerHTML = `<p style="font-size:12px; color: var(--muted); padding: 8px 0;">No comments yet. Start the conversation!</p>`;
      return;
    }
    listEl.innerHTML = '';
    res.comments.forEach(comment => {
      listEl.appendChild(createCommentElement(comment, postId));
    });
  }
}

function createCommentElement(comment, postId) {
  const el = document.createElement('div');
  el.className = 'comment-item';
  el.id = `comment-${comment.id}`;

  const isOwner = state.currentUser && state.currentUser.id === comment.user_id;

  el.innerHTML = `
    <img class="comment-avatar" src="${comment.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" alt="${escapeHtml(comment.user_name)}" />
    <div class="comment-body">
      <div class="comment-header-row">
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="comment-author-name">${escapeHtml(comment.user_name)}</span>
          <span class="comment-time">${formatTimeAgo(comment.created_at)}</span>
        </div>
        ${isOwner ? `
          <button class="btn-delete-comment" title="Delete reply">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
      <div class="comment-text">${escapeHtml(comment.content)}</div>
    </div>
  `;

  if (isOwner) {
    const delBtn = el.querySelector('.btn-delete-comment');
    delBtn.addEventListener('click', async () => {
      const res = await api.deleteComment(comment.id, state.currentUser.id);
      if (res.success) {
        el.remove();
        const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
        if (postCard) {
          const countEl = postCard.querySelector('.comment-count');
          countEl.textContent = Math.max(0, parseInt(countEl.textContent || '1') - 1);
        }
        showToast('Comment deleted');
      }
    });
  }

  return el;
}

// ----------------------------------------------------
// USER PROFILE VIEW
// ----------------------------------------------------
async function openProfileView(userId) {
  state.currentView = 'profile';
  state.viewingUserId = userId;
  state.profileTab = 'posts';

  // Toggle DOM containers
  elements.feedContainer.style.display = 'none';
  elements.composerCard.style.display = 'none';
  elements.feedTabs.style.display = 'none';
  elements.categoryScroller.style.display = 'none';
  elements.profileView.style.display = 'flex';

  // Update navigation styles
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (state.currentUser && state.currentUser.id === userId) {
    elements.navProfile.classList.add('active');
  }

  // Load User Data
  const res = await api.getUser(userId, state.currentUser ? state.currentUser.id : null);
  if (!res.success || !res.user) {
    showToast('Failed to load profile');
    return;
  }

  const user = res.user;
  elements.pageTitle.innerHTML = `<span style="color:var(--muted); font-weight:600; cursor:pointer;" id="back-to-feed-btn">Feed</span> <span style="color:var(--muted);">/</span> Profile`;
  document.getElementById('back-to-feed-btn').addEventListener('click', () => switchView('feed'));

  elements.profileBanner.style.backgroundImage = `url(${user.banner || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200'})`;
  elements.profileAvatar.src = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
  elements.profileName.textContent = user.name;
  elements.profileRoleBadge.textContent = user.role || 'Member';
  elements.profileHandle.textContent = `@${user.username}`;
  elements.profileBio.textContent = user.bio || 'Building on the Fonia Labs network.';
  elements.profileLocation.textContent = user.location || 'Lagos, Nigeria';
  elements.profileJoined.textContent = `Joined ${new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`;

  if (user.website) {
    elements.profileWebsite.style.display = 'flex';
    const linkEl = elements.profileWebsite.querySelector('a');
    linkEl.href = user.website;
    linkEl.textContent = user.website.replace(/^https?:\/\//, '');
  } else {
    elements.profileWebsite.style.display = 'none';
  }

  // Stats
  elements.profileStatPosts.textContent = user.posts_count || 0;
  elements.profileStatFollowers.textContent = user.followers_count || 0;
  elements.profileStatFollowing.textContent = user.following_count || 0;

  // Actions (Edit Profile OR Follow/Unfollow)
  const isMe = state.currentUser && state.currentUser.id === user.id;
  elements.profileActionBtnContainer.innerHTML = '';

  if (isMe) {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit-profile';
    editBtn.textContent = 'Edit Profile';
    editBtn.addEventListener('click', () => openEditProfileModal(user));
    elements.profileActionBtnContainer.appendChild(editBtn);
  } else {
    const followBtn = document.createElement('button');
    followBtn.className = `btn-follow ${user.is_following ? 'following' : ''}`;
    followBtn.textContent = user.is_following ? 'Following' : 'Follow';
    followBtn.addEventListener('click', async () => {
      if (!state.currentUser) {
        showToast('Please select an account to follow users');
        return;
      }
      const fRes = await api.toggleFollow(user.id, state.currentUser.id);
      if (fRes.success) {
        elements.profileStatFollowers.textContent = fRes.followersCount;
        if (fRes.following) {
          followBtn.classList.add('following');
          followBtn.textContent = 'Following';
          showToast(`You are now following ${user.name}! 🚀`);
        } else {
          followBtn.classList.remove('following');
          followBtn.textContent = 'Follow';
          showToast(`Unfollowed ${user.name}`);
        }
        await loadWhoToFollowWidget();
      }
    });
    elements.profileActionBtnContainer.appendChild(followBtn);
  }

  // Sub Tabs Click Handlers
  elements.profileTabPosts.onclick = () => switchProfileSubTab('posts', user.id);
  elements.profileTabLikes.onclick = () => switchProfileSubTab('likes', user.id);

  // Load posts for profile
  await loadProfilePosts(user.id, 'posts');
}

async function switchProfileSubTab(tab, userId) {
  state.profileTab = tab;
  elements.profileTabPosts.classList.toggle('active', tab === 'posts');
  elements.profileTabLikes.classList.toggle('active', tab === 'likes');
  await loadProfilePosts(userId, tab);
}

async function loadProfilePosts(userId, tab = 'posts') {
  elements.profilePostsContainer.innerHTML = `
    <div style="text-align: center; padding: 30px; color: var(--muted);">
      <p style="font-size: 13px;">Loading ${tab}...</p>
    </div>
  `;

  let res;
  if (tab === 'posts') {
    res = await api.getUserPosts(userId, state.currentUser ? state.currentUser.id : null);
  } else {
    res = await api.getUserLikes(userId, state.currentUser ? state.currentUser.id : null);
  }

  if (res.success && res.posts) {
    if (res.posts.length === 0) {
      elements.profilePostsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: var(--card); border-radius: var(--radius-lg); border: 1px solid var(--line);">
          <p style="font-size: 14px; color: var(--muted);">No ${tab} to display yet.</p>
        </div>
      `;
      return;
    }
    elements.profilePostsContainer.innerHTML = '';
    res.posts.forEach(post => {
      elements.profilePostsContainer.appendChild(createPostElement(post));
    });
  }
}

// ----------------------------------------------------
// VIEW SWITCHING
// ----------------------------------------------------
function switchView(viewName) {
  state.currentView = viewName;
  if (viewName === 'feed') {
    elements.profileView.style.display = 'none';
    elements.feedContainer.style.display = 'flex';
    elements.composerCard.style.display = 'flex';
    elements.feedTabs.style.display = 'flex';
    elements.categoryScroller.style.display = 'flex';
    elements.pageTitle.innerHTML = `Fonia Sphere <span class="dot-pulse"></span>`;
    loadFeed();
  }
}

// ----------------------------------------------------
// SIDEBAR WIDGETS
// ----------------------------------------------------
async function loadEcosystemWidget() {
  const res = await api.getEcosystem();
  if (res.success && res.companies) {
    elements.ecosystemList.innerHTML = '';
    res.companies.forEach(comp => {
      const item = document.createElement('div');
      item.className = 'ecosystem-item';
      item.innerHTML = `
        <div class="ecosystem-item-left">
          <img class="ecosystem-avatar" src="${comp.avatar}" alt="${escapeHtml(comp.name)}" />
          <div class="ecosystem-meta">
            <div class="ecosystem-name">${escapeHtml(comp.name)}</div>
            <div class="ecosystem-cat">${escapeHtml(comp.category)}</div>
          </div>
        </div>
        <div class="ecosystem-tag">${escapeHtml(comp.tag)}</div>
      `;
      item.addEventListener('click', () => {
        selectCategoryTag(comp.tag);
      });
      elements.ecosystemList.appendChild(item);
    });
  }
}

async function loadWhoToFollowWidget() {
  const res = await api.getUsers(state.currentUser ? state.currentUser.id : null);
  if (res.success && res.users) {
    state.cachedUsers = res.users;
    elements.whoToFollowList.innerHTML = '';
    const otherUsers = res.users.filter(u => !state.currentUser || u.id !== state.currentUser.id);

    otherUsers.slice(0, 4).forEach(user => {
      const item = document.createElement('div');
      item.className = 'follow-item';
      item.innerHTML = `
        <div class="follow-item-user" data-user-id="${user.id}">
          <img class="follow-avatar" src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" alt="${escapeHtml(user.name)}" />
          <div class="follow-names">
            <div class="follow-name">${escapeHtml(user.name)}</div>
            <div class="follow-handle">@${escapeHtml(user.username)}</div>
          </div>
        </div>
        <button class="btn-quick-follow ${user.is_following ? 'following' : ''}" data-target-id="${user.id}">
          ${user.is_following ? 'Following' : 'Follow'}
        </button>
      `;

      item.querySelector('.follow-item-user').addEventListener('click', () => {
        openProfileView(user.id);
      });

      const followBtn = item.querySelector('.btn-quick-follow');
      followBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!state.currentUser) {
          showToast('Please select an account first');
          return;
        }
        const fRes = await api.toggleFollow(user.id, state.currentUser.id);
        if (fRes.success) {
          if (fRes.following) {
            followBtn.classList.add('following');
            followBtn.textContent = 'Following';
            showToast(`Following @${user.username}!`);
          } else {
            followBtn.classList.remove('following');
            followBtn.textContent = 'Follow';
            showToast(`Unfollowed @${user.username}`);
          }
          if (state.currentFeed === 'following') {
            loadFeed();
          }
        }
      });

      elements.whoToFollowList.appendChild(item);
    });
  }
}

// ----------------------------------------------------
// MODAL SYSTEM
// ----------------------------------------------------
function openModal(modalEl) {
  elements.modalOverlay.classList.add('open');
  elements.editProfileModal.style.display = 'none';
  elements.switchAccountModal.style.display = 'none';
  elements.userListModal.style.display = 'none';
  modalEl.style.display = 'block';
}

function closeModal() {
  elements.modalOverlay.classList.remove('open');
}

function openEditProfileModal(user) {
  elements.editName.value = user.name || '';
  elements.editBio.value = user.bio || '';
  elements.editRole.value = user.role || '';
  elements.editCompany.value = user.company || '';
  elements.editLocation.value = user.location || '';
  elements.editWebsite.value = user.website || '';
  elements.editAvatar.value = user.avatar || '';
  elements.editBanner.value = user.banner || '';
  openModal(elements.editProfileModal);
}

function openSwitchAccountModal() {
  elements.userSwitchList.innerHTML = '';
  state.cachedUsers.forEach(user => {
    const isCurrent = state.currentUser && state.currentUser.id === user.id;
    const item = document.createElement('div');
    item.className = `user-switch-item ${isCurrent ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />
        <div>
          <div style="font-weight:700; font-size:13.5px; color:#fff;">${escapeHtml(user.name)}</div>
          <div style="font-size:11.5px; color:var(--muted);">@${escapeHtml(user.username)} • ${escapeHtml(user.role || 'Member')}</div>
        </div>
      </div>
      ${isCurrent ? '<span style="color:var(--cyan); font-size:11px; font-weight:700;">ACTIVE</span>' : ''}
    `;
    item.addEventListener('click', async () => {
      state.currentUser = user;
      localStorage.setItem('fonia_current_user_id', user.id);
      updateCurrentUserUI();
      closeModal();
      showToast(`Switched account to ${user.name}! ✨`);
      if (state.currentView === 'profile' && state.viewingUserId) {
        openProfileView(state.viewingUserId);
      } else {
        loadFeed();
      }
      loadWhoToFollowWidget();
    });
    elements.userSwitchList.appendChild(item);
  });
  openModal(elements.switchAccountModal);
}

async function openFollowersModal(userId, type = 'followers') {
  elements.userListModalTitle.textContent = type === 'followers' ? 'Followers' : 'Following';
  elements.userListModalContent.innerHTML = `<p style="padding:20px; text-align:center; color:var(--muted);">Loading users...</p>`;
  openModal(elements.userListModal);

  let res;
  if (type === 'followers') {
    res = await api.getUserFollowers(userId, state.currentUser ? state.currentUser.id : null);
  } else {
    res = await api.getUserFollowing(userId, state.currentUser ? state.currentUser.id : null);
  }

  if (res.success && res[type]) {
    const list = res[type];
    if (list.length === 0) {
      elements.userListModalContent.innerHTML = `<p style="padding:30px; text-align:center; color:var(--muted);">No users to display.</p>`;
      return;
    }
    elements.userListModalContent.innerHTML = '';
    list.forEach(u => {
      const row = document.createElement('div');
      row.className = 'follow-item';
      row.style.padding = '8px 0';
      row.innerHTML = `
        <div class="follow-item-user">
          <img class="follow-avatar" src="${u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" />
          <div class="follow-names">
            <div class="follow-name">${escapeHtml(u.name)}</div>
            <div class="follow-handle">@${escapeHtml(u.username)}</div>
          </div>
        </div>
      `;
      row.querySelector('.follow-item-user').addEventListener('click', () => {
        closeModal();
        openProfileView(u.id);
      });
      elements.userListModalContent.appendChild(row);
    });
  }
}

// ----------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------
function setupEventListeners() {
  // Navigation
  elements.navFeed.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    elements.navFeed.classList.add('active');
    state.currentFeed = 'all';
    updateFeedTabUI();
    switchView('feed');
  });

  elements.navFollowing.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    elements.navFollowing.classList.add('active');
    state.currentFeed = 'following';
    updateFeedTabUI();
    switchView('feed');
  });

  elements.navTrending.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    elements.navTrending.classList.add('active');
    state.currentFeed = 'trending';
    updateFeedTabUI();
    switchView('feed');
  });

  elements.navProfile.addEventListener('click', () => {
    if (state.currentUser) openProfileView(state.currentUser.id);
  });

  elements.btnQuickCompose.addEventListener('click', () => {
    switchView('feed');
    elements.postContentInput.focus();
    elements.postContentInput.scrollIntoView({ behavior: 'smooth' });
  });

  // User Profile Quick Info
  elements.userQuickProfile.addEventListener('click', (e) => {
    if (e.target.closest('#btn-switch-account')) return;
    if (state.currentUser) openProfileView(state.currentUser.id);
  });
  elements.btnSwitchAccount.addEventListener('click', (e) => {
    e.stopPropagation();
    openSwitchAccountModal();
  });

  // Feed Tabs
  elements.tabAll.addEventListener('click', () => {
    state.currentFeed = 'all';
    updateFeedTabUI();
    loadFeed();
  });
  elements.tabFollowing.addEventListener('click', () => {
    state.currentFeed = 'following';
    updateFeedTabUI();
    loadFeed();
  });
  elements.tabTrending.addEventListener('click', () => {
    state.currentFeed = 'trending';
    updateFeedTabUI();
    loadFeed();
  });

  // Search
  let searchTimeout = null;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.currentSearch = e.target.value.trim();
      loadFeed();
    }, 350);
  });

  // Category Tag scroller pills
  elements.categoryScroller.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectCategoryTag(pill.dataset.tag || '');
    });
  });

  // Composer Attach Image file
  elements.btnAttachFile.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Uploading image to Fonia servers...');
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.url) {
        state.composerImageUrl = res.url;
        showComposerImagePreview(res.url);
        showToast('Image attached! 📷');
      } else {
        showToast(res.error || 'Image upload failed');
      }
    } catch (err) {
      showToast('Error uploading image');
    }
  });

  // Composer Attach Image URL
  elements.btnAttachUrl.addEventListener('click', () => {
    const box = elements.imageUrlInputBox;
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    if (box.style.display === 'block') box.focus();
  });

  elements.imageUrlInputBox.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      state.composerImageUrl = url;
      showComposerImagePreview(url);
    }
  });

  elements.btnRemovePreview.addEventListener('click', () => {
    state.composerImageUrl = '';
    elements.composerPreviewContainer.style.display = 'none';
    elements.imageUrlInputBox.value = '';
    elements.imageUrlInputBox.style.display = 'none';
    elements.fileInput.value = '';
  });

  // Post Submission
  elements.btnSubmitPost.addEventListener('click', async () => {
    const content = elements.postContentInput.value.trim();
    if (!content) return;
    if (!state.currentUser) {
      showToast('Please select or create an account first!');
      return;
    }

    elements.btnSubmitPost.disabled = true;
    elements.btnSubmitPost.textContent = 'Posting...';

    const res = await api.createPost({
      userId: state.currentUser.id,
      content,
      imageUrl: state.composerImageUrl,
      tag: elements.postTagSelect.value
    });

    elements.btnSubmitPost.disabled = false;
    elements.btnSubmitPost.innerHTML = `Post 🚀`;

    if (res.success && res.post) {
      elements.postContentInput.value = '';
      state.composerImageUrl = '';
      elements.composerPreviewContainer.style.display = 'none';
      elements.imageUrlInputBox.value = '';
      elements.imageUrlInputBox.style.display = 'none';
      elements.fileInput.value = '';

      showToast('Post published to Fonia Sphere! 🌟');
      // Prepend post to feed
      elements.feedContainer.prepend(createPostElement(res.post));
    } else {
      showToast(res.error || 'Failed to publish post');
    }
  });

  // Edit Profile Form Submit
  elements.formEditProfile.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.currentUser) return;

    const updatedData = {
      name: elements.editName.value.trim(),
      bio: elements.editBio.value.trim(),
      role: elements.editRole.value.trim(),
      company: elements.editCompany.value.trim(),
      location: elements.editLocation.value.trim(),
      website: elements.editWebsite.value.trim(),
      avatar: elements.editAvatar.value.trim(),
      banner: elements.editBanner.value.trim()
    };

    const res = await api.updateUser(state.currentUser.id, updatedData);
    if (res.success && res.user) {
      state.currentUser = res.user;
      updateCurrentUserUI();
      closeModal();
      showToast('Profile updated successfully! ✨');
      openProfileView(state.currentUser.id);
      loadWhoToFollowWidget();
    } else {
      showToast(res.error || 'Failed to update profile');
    }
  });

  // Create New Account Form Submit
  elements.formNewAccount.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = elements.newUsername.value.trim();
    const name = elements.newName.value.trim();
    const bio = elements.newBio.value.trim();

    if (!username || !name) {
      showToast('Username and Name are required');
      return;
    }

    const res = await api.createUser({
      username,
      name,
      bio,
      role: 'Community Builder',
      company: 'Fonia Labs'
    });

    if (res.success && res.user) {
      state.currentUser = res.user;
      localStorage.setItem('fonia_current_user_id', res.user.id);
      updateCurrentUserUI();
      closeModal();
      elements.formNewAccount.reset();
      showToast(`Welcome to Fonia Sphere, ${res.user.name}! 🎉`);
      loadFeed();
      loadWhoToFollowWidget();
    } else {
      showToast(res.error || 'Could not create account');
    }
  });

  // Stats Click -> Open Followers/Following Modal
  document.getElementById('stat-followers-box').addEventListener('click', () => {
    if (state.viewingUserId) openFollowersModal(state.viewingUserId, 'followers');
  });
  document.getElementById('stat-following-box').addEventListener('click', () => {
    if (state.viewingUserId) openFollowersModal(state.viewingUserId, 'following');
  });

  // Close modals on overlay click or close button
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) closeModal();
  });
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function updateFeedTabUI() {
  elements.tabAll.classList.toggle('active', state.currentFeed === 'all');
  elements.tabFollowing.classList.toggle('active', state.currentFeed === 'following');
  elements.tabTrending.classList.toggle('active', state.currentFeed === 'trending');
}

function selectCategoryTag(tag) {
  state.currentTag = (state.currentTag === tag) ? '' : tag;
  elements.categoryScroller.querySelectorAll('.tag-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.tag === state.currentTag);
  });
  switchView('feed');
  loadFeed();
}

function showComposerImagePreview(url) {
  elements.composerPreviewImg.src = url;
  elements.composerPreviewContainer.style.display = 'block';
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'just now';
  // SQLite date fallback
  const d = new Date(dateStr.replace(' ', 'T') + 'Z');
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (isNaN(diffSec) || diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
