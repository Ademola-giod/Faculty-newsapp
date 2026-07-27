import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  initializeSocketListeners,
  removeSocketListeners
} from '../sockets/socketListeners';
import { useAuth0 } from '@auth0/auth0-react';
import { getTokenWithFallback } from '../utils/authHelpers';

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
  const { loginWithPopup, loginWithRedirect } = useAuth0();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Recommended');
  const [activeMenu, setActiveMenu] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(() => loadLS(LS_LIKES));
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => loadLS(LS_BOOKMARKS));
  const [likeCounts, setLikeCounts] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [categories, setCategories] = useState(["Recommended"]);
  // const categories = useMemo(
  //   () => ['Recommended', ...new Set(posts.map((post) => post.category).filter(Boolean))],
  //   [posts]
  // );

  const fetchPosts = useCallback(async ({ append = false, pageNumber = 1 } = {}) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params = {
        page: pageNumber,
        limit: 8,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (activeCategory && activeCategory !== 'Recommended') {
        params.category = activeCategory;
      }

      const res = await axios.get(`${API_BASE_URL}/api/posts`, { params, timeout: 15000 });
      const payload = res.data?.posts || [];

      const ranked = payload
        .map((post) => ({ ...post }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts((prev) => (append ? [...prev, ...ranked] : ranked));
      setFilteredPosts((prev) => (append ? [...prev, ...ranked] : ranked));
      setPage(res.data?.page || pageNumber);
      setHasMore(Boolean(res.data?.hasMore));

      const counts = {};
      ranked.forEach((p) => {
        counts[p._id] = p.metrics?.likes?.length || 0;
      });
      setLikeCounts((prev) => ({ ...prev, ...counts }));
    } catch (err) {
      console.error('fetchPosts:', err);
      setError('Could not load posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, searchQuery]);


  // fetch categories

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);

      setCategories([
        "Recommended",
        ...res.data.map(category => category.name)
      ]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const toggleLike = useCallback(
    async (postId, e) => {
      e?.stopPropagation();

      const prev = { ...likedPosts };
      const wasLiked = !!prev[postId];
      const optimisticValue = !wasLiked;
      const next = { ...prev, [postId]: optimisticValue };
      if (wasLiked) delete next[postId];

      setLikedPosts(next);
      saveLS(LS_LIKES, next);
      setLikeCounts((c) => ({ ...c, [postId]: (c[postId] || 0) + (wasLiked ? -1 : 1) }));

      try {

          console.log(" getting token for like request...")
          const token = await getTokenWithFallback({
            getAccessTokenSilently,
            loginWithPopup,
            loginWithRedirect,
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: 'openid profile email offline_access'
            }
          });

          console.log("token recieved:", token);

        const res = await axios.patch(`${API_BASE_URL}/api/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const liked = Boolean(res.data?.liked);
        const likes = Number(res.data?.likes || 0);

        setLikedPosts((current) => {
          const updated = { ...current, [postId]: liked };
          saveLS(LS_LIKES, updated);
          return updated;
        });
        setLikeCounts((c) => ({ ...c, [postId]: likes }));
      } catch (err) {
        console.warn('Like saved locally; backend request failed.', err?.message || err);
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

// useeffect fetch post

  useEffect(() => {
    setPosts([]);
    setFilteredPosts([]);
    setPage(1);
    fetchPosts({ append: false, pageNumber: 1 });
  }, [fetchPosts]);


  // fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

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

  const featuredPosts = useMemo(() => {
    if (!showHero || filteredPosts.length === 0) return [];

    const recentWindowMs = 12 * 60 * 60 * 1000;
    const now = Date.now();

    const recentPosts = filteredPosts.filter((post) => {
      const createdAt = new Date(post.createdAt).getTime();
      return !Number.isNaN(createdAt) && now - createdAt <= recentWindowMs;
    });

    const sourcePosts = recentPosts.length > 0 ? recentPosts : filteredPosts;

    return [...sourcePosts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [filteredPosts, showHero]);

  const heroPost = showHero ? featuredPosts[0] || null : null;

  const gridPosts = showHero
    ? filteredPosts.filter((post) => post._id !== heroPost?._id)
    : filteredPosts;

  return {
    posts,
    filteredPosts,
    loading,
    loadingMore,
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
    loadMore: () => {
      if (!hasMore || loadingMore) return;
      fetchPosts({ append: true, pageNumber: page + 1 });
    },
    hasMore,
    toggleLike,
    toggleBookmark,
    sharePost,
    relTime,
    showHero,
    heroPost,
    featuredPosts,
    gridPosts
  };
};

export { sharePost, relTime, stripHtml };
