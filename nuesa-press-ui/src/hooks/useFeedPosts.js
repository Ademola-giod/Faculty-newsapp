import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  initializeSocketListeners,
  removeSocketListeners,
} from "../sockets/socketListeners";
import { useAuth0 } from "@auth0/auth0-react";
import { getTokenWithFallback } from "../utils/authHelpers";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const LS_LIKES = "nuesa_liked_posts";
const LS_BOOKMARKS = "nuesa_bookmarked_posts";

// ==========================================
// HELPERS
// ==========================================

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const loadLS = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const saveLS = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

const relTime = (date) => {
  const h = Math.floor((Date.now() - new Date(date)) / 3600000);

  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;

  const d = Math.floor(h / 24);

  if (d < 7) return `${d}d ago`;

  return new Date(date).toLocaleDateString();
};

// ==========================================
// SHARE POST
// ==========================================

// const sharePost = async (post) => {
//   const url = `${window.location.origin}/post/${post._id}`;

//   const data = {
//     title: post.title,
//     text: stripHtml(post.content).slice(0, 120),
//     url,
//   };

//   if (navigator.share) {
//     try {
//       await navigator.share(data);
//       return;
//     } catch {
//       // User cancelled or browser failed.
//     }
//   }

//   try {
//     await navigator.clipboard.writeText(url);
//     alert("Link copied to clipboard!");
//   } catch {
//     prompt("Copy this link:", url);
//   }
// };

const sharePost = async (post) => {
  const url = `${window.location.origin}/post/${post._id}`;
  const excerpt = stripHtml(post.content).slice(0, 200).trim();
  const category = post.category ? post.category.toUpperCase() : '';

  const message =
`*${category}: ${post.title}*

_${excerpt}…_

${url}

For more information, kindly join NUESA Press fan page:
https://chat.whatsapp.com/FGCScEHL0m44SjJTdSTU

*©️NUESA PRESS UI, POWER THROUGH THE PEN*`;

  if (navigator.share) {
    try {
      await navigator.share({ text: message });
      return;
    } catch {
      // fall back to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(message);
    alert('Post copied to clipboard!');
  } catch {
    prompt('Copy this message:', message);
  }
};

// ==========================================
// HOOK
// ==========================================

export const useFeedPosts = ({ getAccessTokenSilently }) => {
  const { loginWithPopup, loginWithRedirect } = useAuth0();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] =
    useState("Recommended");

  const [activeMenu, setActiveMenu] = useState("feed");

  const [searchQuery, setSearchQuery] = useState("");

  const [expandedPost, setExpandedPost] = useState(null);

  const [likedPosts, setLikedPosts] = useState(() =>
    loadLS(LS_LIKES)
  );

  const [bookmarkedPosts, setBookmarkedPosts] = useState(() =>
    loadLS(LS_BOOKMARKS)
  );

  const [likeCounts, setLikeCounts] = useState({});

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(false);

  const [categories, setCategories] = useState(["Recommended"]);

  // ==========================================
  // FETCH POSTS
  // ==========================================

  const fetchPosts = useCallback(
    async ({ append = false, pageNumber = 1 } = {}) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const params = {
          page: pageNumber,
          limit: 10,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (
          activeCategory &&
          activeCategory !== "Recommended"
        ) {
          params.category = activeCategory;
        }

        console.log(
          "Fetching posts:",
          `${API_BASE_URL}/api/posts`,
          params
        );

        const res = await axios.get(
          `${API_BASE_URL}/api/posts`,
          {
            params,
            timeout: 15000,
            withCredentials: true,
          }
        );

        const payload = res.data?.posts || [];

        const ranked = payload
          .map((post) => ({ ...post }))
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );

        setPosts((prev) =>
          append ? [...prev, ...ranked] : ranked
        );

        setFilteredPosts((prev) =>
          append ? [...prev, ...ranked] : ranked
        );

        setPage(res.data?.page || pageNumber);

        setHasMore(Boolean(res.data?.hasMore));

        const counts = {};

        ranked.forEach((post) => {
          counts[post._id] =
            post.metrics?.likes?.length || 0;
        });

        setLikeCounts((prev) => ({
          ...prev,
          ...counts,
        }));
      } catch (err) {
        console.error("fetchPosts:", err);

        if (err.response?.status === 429) {
          setError(
            "Too many requests. Please wait a moment and try again."
          );
        } else if (err.response?.status === 503) {
          setError(
            "The news server is temporarily unavailable. Please try again shortly."
          );
        } else {
          setError(
            "Could not load posts. Please check your connection and try again."
          );
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, searchQuery]
  );

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/categories`,
        {
          // timeout: 15000,
          withCredentials: true,
        }
      );

      const categoryNames = Array.isArray(res.data)
        ? res.data
            .map((category) => category.name)
            .filter(Boolean)
        : [];

      setCategories([
        "Recommended",
        ...categoryNames,
      ]);
    } catch (err) {
      console.error("fetchCategories:", err);

      if (err.response?.status === 429) {
        console.warn(
          "Categories request was rate limited."
        );
      }
    }
  }, []);

  // ==========================================
  // TOGGLE LIKE
  // ==========================================

  const toggleLike = useCallback(
    async (postId, e) => {
      e?.stopPropagation();

      const previous = { ...likedPosts };

      const wasLiked = Boolean(previous[postId]);

      const optimisticValue = !wasLiked;

      const next = {
        ...previous,
        [postId]: optimisticValue,
      };

      if (wasLiked) {
        delete next[postId];
      }

      // Optimistic UI
      setLikedPosts(next);
      saveLS(LS_LIKES, next);

      setLikeCounts((current) => ({
        ...current,
        [postId]:
          (current[postId] || 0) +
          (wasLiked ? -1 : 1),
      }));

      try {
        console.log("Getting token for like request...");

        const token = await getTokenWithFallback({
          getAccessTokenSilently,
          loginWithPopup,
          loginWithRedirect,

          authorizationParams: {
            audience:
              import.meta.env.VITE_AUTH0_AUDIENCE,
            scope:
              "openid profile email offline_access",
          },
        });

        console.log("Token received");

        const res = await axios.patch(
          `${API_BASE_URL}/api/posts/${postId}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
            timeout: 15000,
          }
        );

        const liked = Boolean(res.data?.liked);

        const likes = Number(
          res.data?.likes || 0
        );

        setLikedPosts((current) => {
          const updated = {
            ...current,
            [postId]: liked,
          };

          if (!liked) {
            delete updated[postId];
          }

          saveLS(LS_LIKES, updated);

          return updated;
        });

        setLikeCounts((current) => ({
          ...current,
          [postId]: likes,
        }));
      } catch (err) {
        console.warn(
          "Backend like request failed:",
          err?.response?.status,
          err?.message
        );

        // Roll back optimistic UI
        setLikedPosts(previous);
        saveLS(LS_LIKES, previous);

        setLikeCounts((current) => ({
          ...current,
          [postId]:
            (current[postId] || 0) +
            (wasLiked ? 1 : -1),
        }));
      }
    },
    [
      getAccessTokenSilently,
      loginWithPopup,
      loginWithRedirect,
      likedPosts,
    ]
  );

  // ==========================================
  // TOGGLE BOOKMARK
  // ==========================================

  const toggleBookmark = useCallback(
    (postId, e) => {
      e?.stopPropagation();

      const next = {
        ...bookmarkedPosts,
        [postId]: !bookmarkedPosts[postId],
      };

      if (!next[postId]) {
        delete next[postId];
      }

      setBookmarkedPosts(next);

      saveLS(LS_BOOKMARKS, next);
    },
    [bookmarkedPosts]
  );

  // ==========================================
  // INITIAL POSTS FETCH
  // ==========================================

  useEffect(() => {
    setPosts([]);
    setFilteredPosts([]);
    setPage(1);

    fetchPosts({
      append: false,
      pageNumber: 1,
    });
  }, [fetchPosts]);

  // ==========================================
  // FETCH CATEGORIES ON MOUNT
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ==========================================
  // KEEP FILTERED POSTS IN SYNC
  // ==========================================

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  // ==========================================
  // INCREMENT VIEW COUNT
  // ==========================================

  useEffect(() => {
    if (!expandedPost?._id) return;

    const viewedPosts = JSON.parse(
      sessionStorage.getItem("viewed_posts") || "[]"
    );

    if (viewedPosts.includes(expandedPost._id)) {
      return;
    }

    const incrementView = async () => {
      try {
        await axios.patch(
          `${API_BASE_URL}/api/posts/${expandedPost._id}/view`,
          {},
          {
            timeout: 15000,
            withCredentials: true,
          }
        );

        setPosts((prev) =>
          prev.map((post) =>
            post._id === expandedPost._id
              ? {
                  ...post,
                  metrics: {
                    ...post.metrics,
                    views:
                      (post.metrics?.views || 0) + 1,
                  },
                }
              : post
          )
        );

        setExpandedPost((prev) => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            views:
              (prev.metrics?.views || 0) + 1,
          },
        }));

        sessionStorage.setItem(
          "viewed_posts",
          JSON.stringify([
            ...viewedPosts,
            expandedPost._id,
          ])
        );
      } catch (err) {
        console.error(
          "View count error:",
          err?.response?.status,
          err?.message
        );
      }
    };

    incrementView();
  }, [expandedPost]);

  // ==========================================
  // SOCKET.IO
  // ==========================================

  useEffect(() => {
    initializeSocketListeners({
      fetchPosts,
      setLikeCounts,
      setPosts,
    });

    return () => {
      removeSocketListeners();
    };
  }, [fetchPosts]);

  // ==========================================
  // HERO POSTS
  // ==========================================

  const showHero =
    activeCategory === "Recommended" &&
    !searchQuery &&
    filteredPosts.length > 0;

  const featuredPosts = useMemo(() => {
    if (
      !showHero ||
      filteredPosts.length === 0
    ) {
      return [];
    }

    const recentWindowMs =
      12 * 60 * 60 * 1000;

    const now = Date.now();

    const recentPosts = filteredPosts.filter(
      (post) => {
        const createdAt =
          new Date(post.createdAt).getTime();

        return (
          !Number.isNaN(createdAt) &&
          now - createdAt <= recentWindowMs
        );
      }
    );

    const sourcePosts =
      recentPosts.length > 0
        ? recentPosts
        : filteredPosts;

    return [...sourcePosts]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [filteredPosts, showHero]);

  const heroPost =
    showHero
      ? featuredPosts[0] || null
      : null;

  const gridPosts = showHero
    ? filteredPosts.filter(
        (post) =>
          post._id !== heroPost?._id
      )
    : filteredPosts;

  // ==========================================
  // LOAD MORE
  // ==========================================

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;

    fetchPosts({
      append: true,
      pageNumber: page + 1,
    });
  }, [
    hasMore,
    loadingMore,
    page,
    fetchPosts,
  ]);

  // ==========================================
  // RETURN
  // ==========================================

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

    loadMore,

    hasMore,

    toggleLike,
    toggleBookmark,

    sharePost,
    relTime,

    showHero,
    heroPost,
    featuredPosts,
    gridPosts,
  };
};

export {
  sharePost,
  relTime,
  stripHtml,
};