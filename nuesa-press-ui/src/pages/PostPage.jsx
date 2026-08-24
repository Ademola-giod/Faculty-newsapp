
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { getTokenWithFallback } from '../utils/authHelpers';
import { ArrowLeft, Heart, Bookmark, Share2, CheckCircle2 } from 'lucide-react';

import CommentsSection from '../components/feed/CommentsSection';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
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

const loadLS = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
};

const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAccessTokenSilently, loginWithPopup, loginWithRedirect } = useAuth0();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => loadLS(LS_BOOKMARKS));
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dbUserId, setDbUserId] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchMe = async () => {
      try {
        const token = await getTokenWithFallback({
          getAccessTokenSilently,
          loginWithPopup,
          loginWithRedirect,
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: 'openid profile email offline_access'
          }
        });
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!cancelled) setDbUserId(data.id);
      } catch (err) {
        console.error('fetchMe:', err);
      }
    };

    fetchMe();
    return () => { cancelled = true; };
  }, [user, getAccessTokenSilently, loginWithPopup, loginWithRedirect]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data);
        setLikeCount(data.metrics?.likes?.length || 0);
        setLiked(
          dbUserId ? Boolean(data.metrics?.likes?.includes(dbUserId)) : false
        );
      } catch (err) {
        console.error(err);
        setError('This story could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, dbUserId]);

  const toggleLike = async (e) => {
    e?.stopPropagation();
    if (!post) return;

    const wasLiked = liked;
    const prevCount = likeCount;

    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    try {
      const token = await getTokenWithFallback({
        getAccessTokenSilently,
        loginWithPopup,
        loginWithRedirect,
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: 'openid profile email offline_access'
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/like`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      setLiked(Boolean(data.liked));
      setLikeCount(Number(data.likes ?? 0));
    } catch (err) {
      console.error('Like error:', err);
      setLiked(wasLiked);
      setLikeCount(prevCount);
    }
  };

  const toggleBookmark = (e) => {
    e?.stopPropagation();
    if (!post) return;

    const next = { ...bookmarkedPosts, [post._id]: !bookmarkedPosts[post._id] };
    if (!next[post._id]) delete next[post._id];
    setBookmarkedPosts(next);
    saveLS(LS_BOOKMARKS, next);
  };

  const sharePost = async () => {
    if (!post) return;

    const url = `${window.location.origin}/post/${post._id}`;
    const data = { title: post.title, text: stripHtml(post.content).slice(0, 120), url };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      prompt('Copy this link:', url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading story…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-base font-bold text-slate-800">Story not available</p>
        <p className="text-xs text-slate-400">{error || 'This story could not be loaded.'}</p>
        <button
          onClick={() => navigate('/feed')}
          className="mt-2 bg-blue-600 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-16">
      {/* Top Bar matching Screen 3 */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/feed')}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <ArrowLeft size={16} className="text-slate-700" />
          </button>
          <span className="font-bold text-slate-800 text-sm">{post.category || 'Global'}</span>
          <button
            onClick={sharePost}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
          >
            <Share2 size={16} className="text-slate-700" />
          </button>
        </div>
      </div>

      <article className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Title & Metadata */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{post.title}</h1>
          <p className="text-xs text-slate-400 mt-2">
            Posted {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Hero Image */}
        {post.image?.url && (
          <div className="rounded-2xl overflow-hidden shadow-xs h-56 w-full">
            <img src={post.image.url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Author / Publisher Bar */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
              {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-sm text-slate-900">{post.authorName || 'News Desk'}</span>
              <CheckCircle2 size={15} className="text-blue-500 fill-blue-500/10" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full transition ${liked ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full transition ${bookmarkedPosts[post._id] ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Bookmark size={18} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div
          className="prose prose-slate text-sm leading-relaxed text-slate-600 pt-2 prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Comments Section Container */}
      <div className="max-w-md mx-auto px-4 mt-8 pt-6 border-t border-slate-100">
        <CommentsSection
          expandedPost={post}
          user={user}
          getAccessTokenSilently={getAccessTokenSilently}
        />
      </div>
    </div>
  );
};

export default PostPage;




// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useAuth0 } from '@auth0/auth0-react';
// import { getTokenWithFallback } from '../utils/authHelpers';
// import { X, Heart, Bookmark, Share2, Eye } from 'lucide-react';

// import CommentsSection from '../components/feed/CommentsSection';

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
// const LS_BOOKMARKS = 'nuesa_bookmarked_posts';

// const stripHtml = (html = '') =>
//   html
//     .replace(/<[^>]*>?/gm, '')
//     .replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'")
//     .replace(/\s+/g, ' ')
//     .trim();

// const loadLS = (key) => {
//   try {
//     return JSON.parse(localStorage.getItem(key) || '{}');
//   } catch {
//     return {};
//   }
// };

// const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// const relTime = (date) => {
//   const h = Math.floor((Date.now() - new Date(date)) / 3600000);
//   if (h < 1) return 'Just now';
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   if (d < 7) return `${d}d ago`;
//   return new Date(date).toLocaleDateString();
// };

// const PostPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, getAccessTokenSilently, loginWithPopup, loginWithRedirect } = useAuth0();

//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [bookmarkedPosts, setBookmarkedPosts] = useState(() => loadLS(LS_BOOKMARKS));
//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);

//   // get like sync numbers from the database 
//   const [dbUserId, setDbUserId] = useState(null);

//   // get our real Mongo user id — same id space as post.metrics.likes
//   useEffect(() => {
//     if (!user) return;
//     let cancelled = false;

//     const fetchMe = async () => {
//       try {
//         const token = await getTokenWithFallback({
//           getAccessTokenSilently,
//           loginWithPopup,
//           loginWithRedirect,
//           authorizationParams: {
//             audience: import.meta.env.VITE_AUTH0_AUDIENCE,
//             scope: 'openid profile email offline_access'
//           }
//         });
//         const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const data = await res.json();
//         if (!cancelled) setDbUserId(data.id);
//       } catch (err) {
//         console.error('fetchMe:', err);
//       }
//     };

//     fetchMe();
//     return () => { cancelled = true; };
//   }, [user, getAccessTokenSilently, loginWithPopup, loginWithRedirect]);

//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(`${API_BASE_URL}/api/posts/${id}`);
//         if (!res.ok) throw new Error('Post not found');
//         const data = await res.json();
//         setPost(data);
//         setLikeCount(data.metrics?.likes?.length || 0);
//         // DB is the source of truth for "did I like this"
//         setLiked(
//           dbUserId ? Boolean(data.metrics?.likes?.includes(dbUserId)) : false
//         );
//       } catch (err) {
//         console.error(err);
//         setError('This story could not be loaded.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPost();
//   }, [id, dbUserId]);

//   useEffect(() => {
//     if (!post?._id) return;

//     const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
//     if (viewedPosts.includes(post._id)) return;

//     const incrementView = async () => {
//       try {
//         await fetch(`${API_BASE_URL}/api/posts/${post._id}/view`, { method: 'PATCH' });
//         setPost((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 metrics: { ...prev.metrics, views: (prev.metrics?.views || 0) + 1 }
//               }
//             : prev
//         );
//         sessionStorage.setItem('viewed_posts', JSON.stringify([...viewedPosts, post._id]));
//       } catch (err) {
//         console.error('View count error:', err);
//       }
//     };

//     incrementView();
//   }, [post?._id]);

//   const toggleLike = async (e) => {
//     e?.stopPropagation();
//     if (!post) return;

//     const wasLiked = liked;
//     const prevCount = likeCount;

//     // optimistic update
//     setLiked(!wasLiked);
//     setLikeCount((c) => c + (wasLiked ? -1 : 1));

//     try {
//       const token = await getTokenWithFallback({
//         getAccessTokenSilently,
//         loginWithPopup,
//         loginWithRedirect,
//         authorizationParams: {
//           audience: import.meta.env.VITE_AUTH0_AUDIENCE,
//           scope: 'openid profile email offline_access'
//         }
//       });

//       const res = await fetch(`${API_BASE_URL}/api/posts/${post._id}/like`, {
//         method: 'PATCH',
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();

//       // reconcile with the real DB response
//       setLiked(Boolean(data.liked));
//       setLikeCount(Number(data.likes ?? 0));
//     } catch (err) {
//       console.error('Like error:', err);
//       // roll back — request failed, DB state didn't change
//       setLiked(wasLiked);
//       setLikeCount(prevCount);
//     }
//   };

//   const toggleBookmark = (e) => {
//     e?.stopPropagation();
//     if (!post) return;

//     const next = { ...bookmarkedPosts, [post._id]: !bookmarkedPosts[post._id] };
//     if (!next[post._id]) delete next[post._id];
//     setBookmarkedPosts(next);
//     saveLS(LS_BOOKMARKS, next);
//   };

//   const sharePost = async () => {
//     if (!post) return;

//     const url = `${window.location.origin}/post/${post._id}`;
//     const data = { title: post.title, text: stripHtml(post.content).slice(0, 120), url };

//     if (navigator.share) {
//       try {
//         await navigator.share(data);
//         return;
//       } catch {
//         // fallback
//       }
//     }

//     try {
//       await navigator.clipboard.writeText(url);
//       alert('Link copied to clipboard!');
//     } catch {
//       prompt('Copy this link:', url);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
//         <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
//         <p className="text-sm text-slate-500 font-semibold">Loading story…</p>
//       </div>
//     );
//   }

//   if (error || !post) {
//     return (
//       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3 px-6 text-center">
//         <p className="text-lg font-black text-slate-800">Story not available</p>
//         <p className="text-sm text-slate-500">{error || 'This story could not be loaded.'}</p>
//         <button
//           onClick={() => navigate('/feed')}
//           className="mt-2 bg-blue-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-950 transition"
//         >
//           Back to feed
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 text-slate-900">
//       <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
//         <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
//           <button
//             onClick={() => navigate('/feed')}
//             className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-900 transition"
//           >
//             <X size={18} /> Back
//           </button>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={toggleLike}
//               className={`flex items-center gap-1.5 text-sm font-bold transition ${liked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
//             >
//               <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
//               {likeCount}
//             </button>
//             <button
//               onClick={toggleBookmark}
//               className={`transition ${bookmarkedPosts[post._id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
//             >
//               <Bookmark size={17} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
//             </button>
//             <button
//               onClick={sharePost}
//               className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-bold px-4 py-1.5 rounded-full hover:bg-blue-950 transition"
//             >
//               <Share2 size={14} /> Share
//             </button>
//           </div>
//         </div>
//       </div>

//       {post.image?.url && (
//         <div className="w-full h-[260px] md:h-[400px] overflow-hidden">
//           <img src={post.image.url} alt={post.title} className="w-full h-full object-cover" />
//         </div>
//       )}

//       <article className="max-w-3xl mx-auto px-4 py-8">
//         <div className="flex items-center gap-3 mb-4">
//           <span className="bg-blue-50 text-blue-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
//             {post.category}
//           </span>
//           <span className="text-xs text-slate-400 font-semibold">{relTime(post.createdAt)}</span>
//         </div>

//         <h1 className="text-2xl md:text-4xl font-black leading-tight text-slate-900 mb-4">{post.title}</h1>

//         <div className="flex items-center gap-3 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-200">
//           <Eye size={13} />
//           <span>{post.metrics?.views || 0} views</span>
//           <span>·</span>
//           <Heart size={13} />
//           <span>{likeCount} likes</span>
//         </div>

//         <div
//           className="prose prose-slate prose-base max-w-none break-words overflow-hidden prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:break-words prose-a:text-blue-800 prose-a:font-semibold prose-a:break-all prose-strong:text-slate-900 prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto prose-pre:overflow-x-auto prose-code:break-words prose-li:text-slate-700"
//           dangerouslySetInnerHTML={{ __html: post.content }}
//         />

//         <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={toggleLike}
//               className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${liked ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'}`}
//             >
//               <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
//               {liked ? 'Liked' : 'Like'} · {likeCount}
//             </button>
//             <button
//               onClick={toggleBookmark}
//               className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${bookmarkedPosts[post._id] ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'}`}
//             >
//               <Bookmark size={15} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
//               {bookmarkedPosts[post._id] ? 'Saved' : 'Save'}
//             </button>
//           </div>
//           <button
//             onClick={sharePost}
//             className="flex items-center gap-2 bg-blue-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-blue-950 transition"
//           >
//             <Share2 size={14} /> Share this post
//           </button>
//         </div>
//       </article>

//       <CommentsSection
//         expandedPost={post}
//         user={user}
//         getAccessTokenSilently={getAccessTokenSilently}
//       />
//     </div>
//   );
// };

// export default PostPage;

// // import { useEffect, useState } from "react";

// // import { useParams } from "react-router-dom";

// // const API_URL = import.meta.env.VITE_BACKEND_URL;

// // function PostPage() {

// //   const { id } = useParams();

// //   const [post, setPost] = useState(null);

// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {

// //     const fetchPost = async () => {

// //       try {

// //         const response = await fetch(`${API_URL}/api/posts/${id}`);

// //         const data = await response.json();

// //         setPost(data);

// //       } catch (error) {

// //         console.error(error);

// //       } finally {

// //         setLoading(false);

// //       }

// //     };

// //     fetchPost();

// //   }, [id]);

// //   if (loading) {

// //     return <h1>Loading...</h1>;

// //   }

// //   if (!post) {

// //     return <h1>Post not found.</h1>;

// //   }

// //   return (

// //     <div className="max-w-4xl mx-auto p-8">

// //       <h1 className="text-4xl font-black">

// //         {post.title}

// //       </h1>

// //       {post.image?.url && (

// //         <img

// //           src={post.image.url}

// //           alt={post.title}

// //           className="w-full rounded-2xl mt-6"

// //         />

// //       )}

// //       <div

// //         className="mt-8"

// //         dangerouslySetInnerHTML={{

// //           __html: post.content

// //         }}

// //       />

// //     </div>

// //   );

// // }

// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useAuth0 } from '@auth0/auth0-react';
// import { getTokenWithFallback } from '../utils/authHelpers';
// import { X, Heart, Bookmark, Share2, Eye } from 'lucide-react';

// import CommentsSection from '../components/feed/CommentsSection';

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
// const LS_LIKES = 'nuesa_liked_posts';
// const LS_BOOKMARKS = 'nuesa_bookmarked_posts';

// const stripHtml = (html = '') =>
//   html
//     .replace(/<[^>]*>?/gm, '')
//     .replace(/&nbsp;/g, ' ')
//     .replace(/&amp;/g, '&')
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'")
//     .replace(/\s+/g, ' ')
//     .trim();

// const loadLS = (key) => {
//   try {
//     return JSON.parse(localStorage.getItem(key) || '{}');
//   } catch {
//     return {};
//   }
// };

// const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// const relTime = (date) => {
//   const h = Math.floor((Date.now() - new Date(date)) / 3600000);
//   if (h < 1) return 'Just now';
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   if (d < 7) return `${d}d ago`;
//   return new Date(date).toLocaleDateString();
// };

// const PostPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user, getAccessTokenSilently, loginWithPopup, loginWithRedirect } = useAuth0();

//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [likedPosts, setLikedPosts] = useState(() => loadLS(LS_LIKES));
//   const [bookmarkedPosts, setBookmarkedPosts] = useState(() => loadLS(LS_BOOKMARKS));
//   const [likeCount, setLikeCount] = useState(0);

//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(`${API_BASE_URL}/api/posts/${id}`);
//         if (!res.ok) throw new Error('Post not found');
//         const data = await res.json();
//         setPost(data);
//         setLikeCount(data.metrics?.likes?.length || 0);
//       } catch (err) {
//         console.error(err);
//         setError('This story could not be loaded.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPost();
//   }, [id]);

//   useEffect(() => {
//     if (!post?._id) return;

//     const viewedPosts = JSON.parse(sessionStorage.getItem('viewed_posts') || '[]');
//     if (viewedPosts.includes(post._id)) return;

//     const incrementView = async () => {
//       try {
//         await fetch(`${API_BASE_URL}/api/posts/${post._id}/view`, { method: 'PATCH' });
//         setPost((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 metrics: { ...prev.metrics, views: (prev.metrics?.views || 0) + 1 }
//               }
//             : prev
//         );
//         sessionStorage.setItem('viewed_posts', JSON.stringify([...viewedPosts, post._id]));
//       } catch (err) {
//         console.error('View count error:', err);
//       }
//     };

//     incrementView();
//   }, [post?._id]);

//   const toggleLike = async (e) => {
//     e?.stopPropagation();
//     if (!post) return;

//     const prev = { ...likedPosts };
//     const wasLiked = !!prev[post._id];
//     const next = { ...prev, [post._id]: !wasLiked };
//     if (wasLiked) delete next[post._id];

//     setLikedPosts(next);
//     saveLS(LS_LIKES, next);
//     setLikeCount((count) => count + (wasLiked ? -1 : 1));

//     try {
//       const token = await getTokenWithFallback({
//         getAccessTokenSilently,
//         loginWithPopup,
//         loginWithRedirect,
//         authorizationParams: {
//           audience: import.meta.env.VITE_AUTH0_AUDIENCE,
//           scope: 'openid profile email offline_access'
//         }
//       });

//       if (token) {
//         await fetch(`${API_BASE_URL}/api/posts/${post._id}/like`, {
//           method: 'PATCH',
//           headers: { Authorization: `Bearer ${token}` }
//         });
//       }
//     } catch (err) {
//       setLikedPosts(prev);
//       saveLS(LS_LIKES, prev);
//       setLikeCount((count) => count + (wasLiked ? 1 : -1));
//       console.error('Like error:', err);
//     }
//   };

//   const toggleBookmark = (e) => {
//     e?.stopPropagation();
//     if (!post) return;

//     const next = { ...bookmarkedPosts, [post._id]: !bookmarkedPosts[post._id] };
//     if (!next[post._id]) delete next[post._id];
//     setBookmarkedPosts(next);
//     saveLS(LS_BOOKMARKS, next);
//   };

//   const sharePost = async () => {
//     if (!post) return;

//     const url = `${window.location.origin}/post/${post._id}`;
//     const data = { title: post.title, text: stripHtml(post.content).slice(0, 120), url };

//     if (navigator.share) {
//       try {
//         await navigator.share(data);
//         return;
//       } catch {
//         // fallback
//       }
//     }

//     try {
//       await navigator.clipboard.writeText(url);
//       alert('Link copied to clipboard!');
//     } catch {
//       prompt('Copy this link:', url);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
//         <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
//         <p className="text-sm text-slate-500 font-semibold">Loading story…</p>
//       </div>
//     );
//   }

//   if (error || !post) {
//     return (
//       <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-3 px-6 text-center">
//         <p className="text-lg font-black text-slate-800">Story not available</p>
//         <p className="text-sm text-slate-500">{error || 'This story could not be loaded.'}</p>
//         <button
//           onClick={() => navigate('/feed')}
//           className="mt-2 bg-blue-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-950 transition"
//         >
//           Back to feed
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 text-slate-900">
//       <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
//         <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
//           <button
//             onClick={() => navigate('/feed')}
//             className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-900 transition"
//           >
//             <X size={18} /> Back
//           </button>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={toggleLike}
//               className={`flex items-center gap-1.5 text-sm font-bold transition ${likedPosts[post._id] ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}
//             >
//               <Heart size={17} fill={likedPosts[post._id] ? 'currentColor' : 'none'} />
//               {likeCount}
//             </button>
//             <button
//               onClick={toggleBookmark}
//               className={`transition ${bookmarkedPosts[post._id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
//             >
//               <Bookmark size={17} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
//             </button>
//             <button
//               onClick={sharePost}
//               className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-bold px-4 py-1.5 rounded-full hover:bg-blue-950 transition"
//             >
//               <Share2 size={14} /> Share
//             </button>
//           </div>
//         </div>
//       </div>

//       {post.image?.url && (
//         <div className="w-full h-[260px] md:h-[400px] overflow-hidden">
//           <img src={post.image.url} alt={post.title} className="w-full h-full object-cover" />
//         </div>
//       )}

//       <article className="max-w-3xl mx-auto px-4 py-8">
//         <div className="flex items-center gap-3 mb-4">
//           <span className="bg-blue-50 text-blue-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
//             {post.category}
//           </span>
//           <span className="text-xs text-slate-400 font-semibold">{relTime(post.createdAt)}</span>
//         </div>

//         <h1 className="text-2xl md:text-4xl font-black leading-tight text-slate-900 mb-4">{post.title}</h1>

//         <div className="flex items-center gap-3 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-200">
//           <Eye size={13} />
//           <span>{post.metrics?.views || 0} views</span>
//           <span>·</span>
//           <Heart size={13} />
//           <span>{likeCount} likes</span>
//         </div>

//         <div
//           className="prose prose-slate prose-base max-w-none break-words overflow-hidden prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:break-words prose-a:text-blue-800 prose-a:font-semibold prose-a:break-all prose-strong:text-slate-900 prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto prose-pre:overflow-x-auto prose-code:break-words prose-li:text-slate-700"
//           dangerouslySetInnerHTML={{ __html: post.content }}
//         />

//         <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={toggleLike}
//               className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${likedPosts[post._id] ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'}`}
//             >
//               <Heart size={15} fill={likedPosts[post._id] ? 'currentColor' : 'none'} />
//               {likedPosts[post._id] ? 'Liked' : 'Like'} · {likeCount}
//             </button>
//             <button
//               onClick={toggleBookmark}
//               className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${bookmarkedPosts[post._id] ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'}`}
//             >
//               <Bookmark size={15} fill={bookmarkedPosts[post._id] ? 'currentColor' : 'none'} />
//               {bookmarkedPosts[post._id] ? 'Saved' : 'Save'}
//             </button>
//           </div>
//           <button
//             onClick={sharePost}
//             className="flex items-center gap-2 bg-blue-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-blue-950 transition"
//           >
//             <Share2 size={14} /> Share this post
//           </button>
//         </div>
//       </article>

//       <CommentsSection
//         expandedPost={post}
//         user={user}
//         getAccessTokenSilently={getAccessTokenSilently}
//       />
//     </div>
//   );
// };

// export default PostPage;