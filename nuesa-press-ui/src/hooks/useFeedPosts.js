import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  initializeSocketListeners,
  removeSocketListeners
} from '../sockets/socketListeners';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const LS_LIKES = 'nuesa_liked_posts';
const LS_BOOKMARKS = 'nuesa_bookmarked_posts';

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const sharePost = async (post) => {
  const url = `${window.location.origin}/post/${post._id}`;
  const data = { title: post.title, text: stripHtml(post.content).slice(0, 120), url };

  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch {
      // fall back to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  } catch {
    prompt('Copy this link:', url);
  }
};

const loadLS = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const relTime = (date) => {
  const h = Math.floor((Date.now() - new Date(date)) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

export const useFeedPosts = ({ getAccessTokenSilently }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Recommended');
  const [activeMenu, setActiveMenu] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(() => loadLS(LS_LIKES));
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => loadLS(LS_BOOKMARKS));
  const [likeCounts, setLikeCounts] = useState({});

  const categories = useMemo(
    () => ['Recommended', ...new Set(posts.map((post) => post.category).filter(Boolean))],
    [posts]
  );

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/api/posts`, { timeout: 15000 });
      const now = new Date();
      const ranked = res.data.map((post) => {
        const h = (now - new Date(post.createdAt)) / 3600000;
        const e =
          (post.metrics?.likes?.length || 0) * 3 +
          (post.metrics?.shares || 0) * 5 +
          (post.metrics?.views || 0) * 0.2;

        return { ...post, decayScore: e / Math.pow(h + 2, 1.5) };
      });

      ranked.sort((a, b) => b.decayScore - a.decayScore);
      setPosts(ranked);

      const counts = {};
      ranked.forEach((p) => {
        counts[p._id] = p.metrics?.likes?.length || 0;
      });
      setLikeCounts(counts);
    } catch (err) {
      console.error('fetchPosts:', err);
      setError('Could not load posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = useCallback(
    async (postId, e) => {
      e?.stopPropagation();

      const prev = { ...likedPosts };
      const wasLiked = !!prev[postId];
      const next = { ...prev, [postId]: !wasLiked };
      if (wasLiked) delete next[postId];

      setLikedPosts(next);
      saveLS(LS_LIKES, next);
      setLikeCounts((c) => ({ ...c, [postId]: (c[postId] || 0) + (wasLiked ? -1 : 1) }));

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          }
        });

        await axios.patch(`${API_BASE_URL}/api/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        setLikedPosts(prev);
        saveLS(LS_LIKES, prev);
        setLikeCounts((c) => ({ ...c, [postId]: (c[postId] || 0) + (wasLiked ? 1 : -1) }));
        console.error('Like error:', err);
      }
    },
    [getAccessTokenSilently, likedPosts]
  );

  const toggleBookmark = useCallback(
    (postId, e) => {
      e?.stopPropagation();
      const next = { ...bookmarkedPosts, [postId]: !bookmarkedPosts[postId] };
      if (!next[postId]) delete next[postId];
      setBookmarkedPosts(next);
      saveLS(LS_BOOKMARKS, next);
    },
    [bookmarkedPosts]
  );

  useEffect(() => {
    let r = [...posts];

    if (activeCategory !== 'Recommended') {
      r = r.filter(
        (p) => (p.category || '').toLowerCase().trim() === activeCategory.toLowerCase().trim()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((p) => {
        const kw = Array.isArray(p.keywords) ? p.keywords.join(' ').toLowerCase() : '';
        return (
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.content?.toLowerCase().includes(q) ||
          kw.includes(q)
        );
      });
    }

    setFilteredPosts(r);
  }, [posts, activeCategory, searchQuery]);

  useEffect(() => {
    if (!expandedPost?._id) return;

    const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
    if (viewedPosts.includes(expandedPost._id)) return;

    const incrementView = async () => {
      try {
        await axios.patch(`${API_BASE_URL}/api/posts/${expandedPost._id}/view`);

        setPosts((prev) =>
          prev.map((post) =>
            post._id === expandedPost._id
              ? { ...post, metrics: { ...post.metrics, views: (post.metrics?.views || 0) + 1 } }
              : post
          )
        );

        setExpandedPost((prev) => ({
          ...prev,
          metrics: { ...prev.metrics, views: (prev.metrics?.views || 0) + 1 }
        }));

        sessionStorage.setItem('viewed_posts', JSON.stringify([...viewedPosts, expandedPost._id]));
      } catch (err) {
        console.error('View count error:', err);
      }
    };

    incrementView();
  }, [expandedPost]);

  useEffect(() => {
    initializeSocketListeners({ fetchPosts, setLikeCounts, setPosts });
    return () => {
      removeSocketListeners();
    };
  }, [fetchPosts]);

  const showHero = activeCategory === 'Recommended' && !searchQuery && filteredPosts.length > 0;
  const heroPost = showHero ? filteredPosts[0] : null;
  const gridPosts = showHero ? filteredPosts.slice(1) : filteredPosts;

  return {
    posts,
    filteredPosts,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    activeMenu,
    setActiveMenu,
    searchQuery,
    setSearchQuery,
    expandedPost,
    setExpandedPost,
    likedPosts,
    bookmarkedPosts,
    likeCounts,
    categories,
    fetchPosts,
    toggleLike,
    toggleBookmark,
    sharePost,
    relTime,
    showHero,
    heroPost,
    gridPosts
  };
};

export { sharePost, relTime, stripHtml };
