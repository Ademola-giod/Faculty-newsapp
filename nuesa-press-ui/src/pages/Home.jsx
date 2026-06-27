// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth0 } from '@auth0/auth0-react';
// import {
//   Search, LogOut, Heart, Share2, X,
//   Bookmark, Compass, Layers, Flame, ArrowRight, Eye
// } from 'lucide-react';

// import {
//   initializeSocketListeners,
//   removeSocketListeners
// } from '../sockets/socketListeners';

// import { ADMIN_EMAILS } from '../utils/adminList';
// import BottomNav from '../components/feed/BottomNav';
// import CommentsSection from '../components/feed/CommentsSection';

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// // ─── strip HTML tags + decode entities ────────────────────────────────────────
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

// // ─── share: native sheet → copy link fallback ─────────────────────────────────
// const sharePost = async (post) => {
//   const url  = `${window.location.origin}/post/${post._id}`;
//   const data = { title: post.title, text: stripHtml(post.content).slice(0, 120), url };
//   if (navigator.share) {
//     try { await navigator.share(data); return; } catch (_) {}
//   }
//   try {
//     await navigator.clipboard.writeText(url);
//     alert('Link copied to clipboard!');
//   } catch (_) {
//     prompt('Copy this link:', url);
//   }
// };

// // ─── localStorage helpers ─────────────────────────────────────────────────────
// const LS_LIKES     = 'nuesa_liked_posts';
// const LS_BOOKMARKS = 'nuesa_bookmarked_posts';
// const loadLS  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
// const saveLS  = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// // ─── relative time ────────────────────────────────────────────────────────────
// const relTime = (date) => {
//   const h = Math.floor((Date.now() - new Date(date)) / 3600000);
//   if (h < 1) return 'Just now';
//   if (h < 24) return `${h}h ago`;
//   const d = Math.floor(h / 24);
//   if (d < 7) return `${d}d ago`;
//   return new Date(date).toLocaleDateString();
// };

// // ─────────────────────────────────────────────────────────────────────────────

// const Home = () => {
//   const { logout, user, getAccessTokenSilently } = useAuth0();

//   const [posts, setPosts]                       = useState([]);
//   const [filteredPosts, setFilteredPosts]       = useState([]);
//   const [loading, setLoading]                   = useState(true);
//   const [activeCategory, setActiveCategory]     = useState('Recommended');
//   const [activeMenu, setActiveMenu]             = useState('feed');
//   const [searchQuery, setSearchQuery]           = useState('');
//   const [expandedPost, setExpandedPost]         = useState(null);
//   const [likedPosts, setLikedPosts]             = useState(() => loadLS(LS_LIKES));
//   const [bookmarkedPosts, setBookmarkedPosts]   = useState(() => loadLS(LS_BOOKMARKS));
//   const [likeCounts, setLikeCounts] = useState({});


//   // const categories = ['Recommended', 'Tech', 'Events', 'Academic', 'Sports'];


//   const categories = [
//   'Recommended',
//   ...new Set(
//     posts
//       .map(post => post.category)
//       .filter(Boolean)
//   )
// ];
//   const isAdmin    = user && ADMIN_EMAILS.includes(user.email);

//   // ─── fetch ──────────────────────────────────────────────────────────────────
//   const fetchPosts = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_BASE_URL}/api/posts`, {
//       timeout: 15000 // 15 seconds, then throw error
//     });
//       const now = new Date();
//       const ranked = res.data.map((post) => {
//         const h = (now - new Date(post.createdAt)) / 3600000;
//         const e = (post.metrics?.likes?.length || 0) * 3
//                 + (post.metrics?.shares || 0) * 5
//                 + (post.metrics?.views  || 0) * 0.2;
//         return { ...post, decayScore: e / Math.pow(h + 2, 1.5) };
//       });
//       ranked.sort((a, b) => b.decayScore - a.decayScore);
//       setPosts(ranked);
//       const counts = {};
//       ranked.forEach((p) => { counts[p._id] = p.metrics?.likes?.length || 0; });
//       setLikeCounts(counts);
//     } catch (err) {
//       console.error('fetchPosts:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ─── like (sends Auth0 token) ────────────────────────────────────────────────
//   const toggleLike = async (postId, e) => {
//     e?.stopPropagation();
//     const prev      = { ...likedPosts };
//     const wasLiked  = !!prev[postId];
//     const next      = { ...prev, [postId]: !wasLiked };
//     if (wasLiked) delete next[postId];

//     setLikedPosts(next);
//     saveLS(LS_LIKES, next);
//     setLikeCounts((c) => ({ ...c, [postId]: (c[postId] || 0) + (wasLiked ? -1 : 1) }));

//     try {
//       const token = await getAccessTokenSilently({
//         authorizationParams: { 
//           audience: import.meta.env.VITE_AUTH0_AUDIENCE 
//         }  
        
//     });

//     // console.log("TOKEN:", token);
//       await axios.patch(
//         `${API_BASE_URL}/api/posts/${postId}/like`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );


      
//     } catch (err) {
//       // rollback
//       setLikedPosts(prev);
//       saveLS(LS_LIKES, prev);
//       setLikeCounts((c) => ({ ...c, [postId]: (c[postId] || 0) + (wasLiked ? 1 : -1) }));
//       console.error('Like error:', err);
//     }
//   };

//   // ─── bookmark (local only) ───────────────────────────────────────────────────
//   const toggleBookmark = (postId, e) => {
//     e?.stopPropagation();
//     const next = { ...bookmarkedPosts, [postId]: !bookmarkedPosts[postId] };
//     if (!next[postId]) delete next[postId];
//     setBookmarkedPosts(next);
//     saveLS(LS_BOOKMARKS, next);
//   };

//   const fetchComments = async (postId) => {
//   try {
//     setLoadingComments(true);

//     const res = await axios.get(
//       `${API_BASE_URL}/api/posts/${postId}/comments`
//     );

//     setComments(res.data);

//   } catch (err) {
//     console.error('Fetch comments error:', err);
//   } finally {
//     setLoadingComments(false);
//   }
// };



//   // ─── filter ──────────────────────────────────────────────────────────────────
//       useEffect(() => {
//   let r = [...posts];

//   if (activeCategory !== 'Recommended') {
//     r = r.filter((p) =>
//       (p.category || '')
//         .toLowerCase()
//         .trim() ===
//       activeCategory.toLowerCase().trim()
//     );
//   }

//   if (searchQuery.trim()) {
//     const q = searchQuery.toLowerCase();

//     r = r.filter((p) => {
//       const kw = Array.isArray(p.keywords)
//         ? p.keywords.join(' ').toLowerCase()
//         : '';

//       return (
//         p.title?.toLowerCase().includes(q) ||
//         p.category?.toLowerCase().includes(q) ||
//         p.content?.toLowerCase().includes(q) ||
//         kw.includes(q)
//       );
//     });
//   }

//   setFilteredPosts(r);
// }, [posts, activeCategory, searchQuery]);


//   // useEffect(() => {
//   //   let r = [...posts];
//   //   if (activeCategory !== 'Recommended')
//   //     r = r.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
//   //   if (searchQuery.trim()) {
//   //     const q = searchQuery.toLowerCase();
//   //     r = r.filter((p) => {
//   //       const kw = Array.isArray(p.keywords) ? p.keywords.join(' ').toLowerCase() : '';
//   //       return p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
//   //           || p.content?.toLowerCase().includes(q) || kw.includes(q);
//   //     });
//   //   }
//   //   setFilteredPosts(r);
//   // }, [posts, activeCategory, searchQuery]);

//   // useEffect(() => { fetchPosts(); }, []);


//   // ─── increment views when a post is opened ─────────────────────────
// useEffect(() => {
//   if (!expandedPost?._id) return;

//   // prevent duplicate count in same session
//   const viewedPosts = JSON.parse(
//     sessionStorage.getItem('viewed_posts') || '[]'
//   );

//   if (viewedPosts.includes(expandedPost._id)) return;

//   const incrementView = async () => {
//     try {
//       await axios.patch(
//         `${API_BASE_URL}/api/posts/${expandedPost._id}/view`
//       );

//       // update UI instantly
//       setPosts((prev) =>
//         prev.map((post) =>
//           post._id === expandedPost._id
//             ? {
//                 ...post,
//                 metrics: {
//                   ...post.metrics,
//                   views: (post.metrics?.views || 0) + 1
//                 }
//               }
//             : post
//         )
//       );

//       // update expanded post too
//       setExpandedPost((prev) => ({
//         ...prev,
//         metrics: {
//           ...prev.metrics,
//           views: (prev.metrics?.views || 0) + 1
//         }
//       }));

//       sessionStorage.setItem(
//         'viewed_posts',
//         JSON.stringify([...viewedPosts, expandedPost._id])
//       );

//     } catch (err) {
//       console.error('View count error:', err);
//     }
//   };

//   incrementView();

// }, [expandedPost]);

// // socket io 
// useEffect(() => {

//   initializeSocketListeners({
//     fetchPosts,
//     setLikeCounts,
//     setPosts
//   });

//   return () => {
//     removeSocketListeners();
//   };

// }, []);


//   const showHero  = activeCategory === 'Recommended' && !searchQuery && filteredPosts.length > 0;
//   const heroPost  = showHero ? filteredPosts[0] : null;
//   const gridPosts = showHero ? filteredPosts.slice(1) : filteredPosts;

//   // ─── loading ─────────────────────────────────────────────────────────────────
//   if (loading) return (
//     <div className="h-screen bg-slate-100 flex items-center justify-center">
//       <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
//     </div>
//   );

//   // ─── card ────────────────────────────────────────────────────────────────────
//   const NewsCard = ({ post }) => {
//     const isLiked      = !!likedPosts[post._id];
//     const isBookmarked = !!bookmarkedPosts[post._id];
//     const count        = likeCounts[post._id] ?? 0;
//     const excerpt      = stripHtml(post.content).slice(0, 120);

//     return (
//       <article
//         onClick={() => setExpandedPost(post)}
//         className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
//       >
//         {post.image?.url ? (
//           <div className="h-48 overflow-hidden shrink-0">
//             <img src={post.image.url} alt={post.title} loading="lazy"
//               className="w-full h-full object-cover hover:scale-105 transition duration-500" />
//           </div>
//         ) : (
//           <div className="h-48 bg-slate-100 flex items-center justify-center shrink-0">
//             <Layers size={26} className="text-slate-300" />
//           </div>
//         )}

//         <div className="px-5 pt-4 pb-2 flex flex-col gap-2 flex-1">
//           <div className="flex items-center justify-between">
//             <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">{post.category}</span>
//             <span className="text-[10px] text-slate-400">{relTime(post.createdAt)}</span>
//           </div>
//           <h4 className="text-base font-black text-slate-900 leading-snug line-clamp-2">{post.title}</h4>
//           <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
//         </div>

//         <div className="flex items-center justify-between px-5 py-3 mt-2 border-t border-slate-100"
//           onClick={(e) => e.stopPropagation()}>
//           <div className="flex items-center gap-4">
//             <button onClick={(e) => toggleLike(post._id, e)}
//               className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}>
//               <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} /><span>{count}</span>
//             </button>
//             <button onClick={(e) => { e.stopPropagation(); sharePost(post); }}
//               className="text-slate-400 hover:text-blue-700 transition-colors">
//               <Share2 size={15} />
//             </button>
//             <button onClick={(e) => toggleBookmark(post._id, e)}
//               className={`transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
//               <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
//             </button>
//           </div>
//           <button onClick={(e) => { e.stopPropagation(); setExpandedPost(post); }}
//             className="flex items-center gap-1 text-[11px] font-bold text-blue-800 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors">
//             Read more <ArrowRight size={11} />
//           </button>
//         </div>
//       </article>
//     );
//   };

//   // ─── main ─────────────────────────────────────────────────────────────────────
//   return (
//     <div className="bg-slate-100 min-h-screen pb-32 text-slate-900">

//       {isAdmin && (
//         <div className="sticky top-0 z-[80] bg-blue-900 text-white px-6 py-2 text-xs font-bold flex items-center justify-between">
//           <span className="flex items-center gap-2">
//             <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />Admin Session Active
//           </span>
//           <a href="/admin" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition">Dashboard</a>
//         </div>
//       )}

//       {/* HEADER */}
//       <header className={`sticky z-50 bg-white border-b border-slate-200 shadow-sm ${isAdmin ? 'top-[36px]' : 'top-0'}`}>
//         <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
//           <div className="flex items-center gap-3 cursor-pointer shrink-0"
//             onClick={() => { setActiveMenu('feed'); setActiveCategory('Recommended'); setSearchQuery(''); }}>
//             <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow">N</div>
//             <div>
//               <h1 className="text-lg font-black tracking-tight text-blue-900 leading-none">NUESA<span className="text-slate-800">IO</span></h1>
//               <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Campus News Feed</p>
//             </div>
//           </div>

//           <div className="hidden sm:block relative w-full max-w-md">
//             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//             <input type="text" value={searchQuery} placeholder="Search news..."
//               onChange={(e) => { setSearchQuery(e.target.value); setActiveMenu('feed'); }}
//               className="w-full bg-slate-100 rounded-full pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800" />
//             {searchQuery && (
//               <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>
//             )}
//           </div>

//           <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
//             className="p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition shrink-0">
//             <LogOut size={17} />
//           </button>
//         </div>
//       </header>

//       {/* MOBILE SEARCH */}
//       <div className="sm:hidden px-4 pt-3">
//         <div className="relative">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input type="text" value={searchQuery} placeholder="Search news..."
//             onChange={(e) => { setSearchQuery(e.target.value); setActiveMenu('feed'); }}
//             className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none" />
//         </div>
//       </div>

//       {/* ── FEED ────────────────────────────────────────────────────────────── */}
//       {activeMenu === 'feed' && (
//         <>
//           <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-none">
//             {categories.map((cat) => (
//               <button key={cat} onClick={() => setActiveCategory(cat)}
//                 className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
//                   activeCategory === cat
//                     ? 'bg-blue-900 text-white border-blue-900'
//                     : 'bg-white border-slate-200 text-slate-600 hover:border-blue-800 hover:text-blue-800'
//                 }`}>
//                 {cat}
//               </button>
//             ))}
//           </div>

//           <main className="max-w-6xl mx-auto px-4 space-y-6">
//             {/* HERO */}
//             {showHero && heroPost && (
//               <div onClick={() => setExpandedPost(heroPost)}
//                 className="relative rounded-2xl overflow-hidden cursor-pointer group h-90 md:h-105 shadow-md">
//                 <img
//                   src={heroPost.image?.url || 'https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=1400'}
//                   alt={heroPost.title}
//                   className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
//                 <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
//                   <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">
//                     <Flame size={11} /> TRENDING
//                   </div>
//                   <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-2 line-clamp-2">{heroPost.title}</h2>
//                   <div className="flex items-center gap-2 text-xs text-white/60 font-semibold uppercase tracking-wider">
//                     <span>{heroPost.category}</span><span>·</span>
//                     <span>{relTime(heroPost.createdAt)}</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <h3 className="text-base font-black text-slate-800">
//               {searchQuery ? `Results (${filteredPosts.length})` : activeCategory === 'Recommended' ? 'Latest updates' : activeCategory}
//             </h3>

//             {gridPosts.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
//                 {gridPosts.map((post) => <NewsCard key={post._id} post={post} />)}
//               </div>
//             ) : (
//               <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
//                 <Layers size={20} className="text-slate-300 mx-auto mb-3" />
//                 <h3 className="font-black text-base mb-1">No posts found</h3>
//                 <p className="text-sm text-slate-500">Try another search or category.</p>
//               </div>
//             )}
//           </main>
//         </>
//       )}

//       {/* ── EXPLORE ───────────────────────────────────────────────────────── */}
//       {activeMenu === 'explore' && (
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <h2 className="text-2xl font-black mb-6">Explore Categories</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {categories.filter((c) => c !== 'Recommended').map((cat) => (
//               <button key={cat} onClick={() => { setActiveCategory(cat); setActiveMenu('feed'); }}
//                 className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-blue-800 hover:shadow-md transition">
//                 <Compass size={22} className="text-blue-900 mb-3" />
//                 <h3 className="font-black text-slate-800">{cat}</h3>
//                 <p className="text-xs text-slate-400 mt-0.5">
//                   {posts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length} updates
//                 </p>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ── SAVED ─────────────────────────────────────────────────────────── */}
//       {activeMenu === 'saved' && (
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <h2 className="text-2xl font-black mb-6">Saved Posts</h2>
//           {Object.keys(bookmarkedPosts).length === 0 ? (
//             <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
//               <Bookmark size={28} className="text-slate-300 mx-auto mb-3" />
//               <p className="text-sm text-slate-500">No saved posts yet.</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {posts.filter((p) => !!bookmarkedPosts[p._id]).map((post) => (
//                 <div key={post._id} onClick={() => setExpandedPost(post)}
//                   className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition">
//                   <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
//                     <img src={post.image?.url || 'https://picsum.photos/300'} alt="" className="w-full h-full object-cover" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <span className="text-xs uppercase font-black text-blue-800">{post.category}</span>
//                     <h4 className="font-black text-base mt-0.5 line-clamp-2">{post.title}</h4>
//                     <p className="text-xs text-slate-400 mt-1">{relTime(post.createdAt)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

//       {/* ── EXPANDED POST (full-screen panel, no modal) ───────────────────── */}
//       {expandedPost && (
//         <div className="fixed inset-0 z-200 bg-slate-100 overflow-y-auto">

//           {/* TOP BAR */}
//           <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
//             <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
//               <button onClick={() => setExpandedPost(null)}
//                 className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-900 transition">
//                 <X size={18} /> Close
//               </button>
//               <div className="flex items-center gap-3">
//                 <button onClick={(e) => toggleLike(expandedPost._id, e)}
//                   className={`flex items-center gap-1.5 text-sm font-bold transition ${likedPosts[expandedPost._id] ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}>
//                   <Heart size={17} fill={likedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
//                   {likeCounts[expandedPost._id] ?? 0}
//                 </button>
//                 <button onClick={(e) => toggleBookmark(expandedPost._id, e)}
//                   className={`transition ${bookmarkedPosts[expandedPost._id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
//                   <Bookmark size={17} fill={bookmarkedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
//                 </button>
//                 <button onClick={() => sharePost(expandedPost)}
//                   className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-bold px-4 py-1.5 rounded-full hover:bg-blue-950 transition">
//                   <Share2 size={14} /> Share
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* HERO IMAGE */}
//           {expandedPost.image?.url && (
//             <div className="w-full h-[260px] md:h-[400px] overflow-hidden">
//               <img src={expandedPost.image.url} alt={expandedPost.title} className="w-full h-full object-cover" />
//             </div>
//           )}

//           {/* ARTICLE BODY */}
//           <article className="max-w-3xl mx-auto px-4 py-8">
//             <div className="flex items-center gap-3 mb-4">
//               <span className="bg-blue-50 text-blue-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
//                 {expandedPost.category}
//               </span>
//               <span className="text-xs text-slate-400 font-semibold">{relTime(expandedPost.createdAt)}</span>
//             </div>

//             <h1 className="text-2xl md:text-4xl font-black leading-tight text-slate-900 mb-4">
//               {expandedPost.title}
//             </h1>

//             <div className="flex items-center gap-3 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-200">
//               <Eye size={13} /><span>{expandedPost.metrics?.views || 0} views</span>
//               <span>·</span>
//               <Heart size={13} /><span>{likeCounts[expandedPost._id] ?? 0} likes</span>
//             </div>

//             <div
//             className="prose prose-slate prose-base max-w-none
//               break-words overflow-hidden
//               prose-headings:font-black prose-headings:text-slate-900
//               prose-p:text-slate-700 prose-p:leading-relaxed
//               prose-p:break-words
//               prose-a:text-blue-800 prose-a:font-semibold
//               prose-a:break-all
//               prose-strong:text-slate-900
//               prose-img:rounded-xl
//               prose-img:max-w-full
//               prose-img:h-auto
//               prose-pre:overflow-x-auto
//               prose-code:break-words
//               prose-li:text-slate-700"
//             dangerouslySetInnerHTML={{ __html: expandedPost.content }}
//           />
              

//               {/* BOTTOM ACTIONS */}
//               <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
//               <div className="flex items-center gap-3">
//                 <button onClick={(e) => toggleLike(expandedPost._id, e)}
//                   className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${
//                     likedPosts[expandedPost._id] ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'
//                   }`}>
//                   <Heart size={15} fill={likedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
//                   {likedPosts[expandedPost._id] ? 'Liked' : 'Like'} · {likeCounts[expandedPost._id] ?? 0}
//                 </button>
//                 <button onClick={(e) => toggleBookmark(expandedPost._id, e)}
//                   className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${
//                     bookmarkedPosts[expandedPost._id] ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'
//                   }`}>
//                   <Bookmark size={15} fill={bookmarkedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
//                   {bookmarkedPosts[expandedPost._id] ? 'Saved' : 'Save'}
//                 </button>
//               </div>
//               <button onClick={() => sharePost(expandedPost)}
//                 className="flex items-center gap-2 bg-blue-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-blue-950 transition">
//                 <Share2 size={14} /> Share this post
//               </button>
//             </div>
//           </article>

//             <CommentsSection
//               expandedPost={expandedPost}
//               user={user}
//               getAccessTokenSilently={getAccessTokenSilently}
//             />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;


import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Search, LogOut, Heart, Share2, X,
  Bookmark, Compass, Layers, Flame, ArrowRight, Eye
} from 'lucide-react';

import {
  initializeSocketListeners,
  removeSocketListeners
} from '../sockets/socketListeners';

import { ADMIN_EMAILS } from '../utils/adminList';
import BottomNav from '../components/feed/BottomNav';
import CommentsSection from '../components/feed/CommentsSection';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// ─── strip HTML tags + decode entities ────────────────────────────────────────
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

// ─── share: native sheet → copy link fallback ─────────────────────────────────
const sharePost = async (post) => {
  const url  = `${window.location.origin}/post/${post._id}`;
  const data = { title: post.title, text: stripHtml(post.content).slice(0, 120), url };
  if (navigator.share) {
    try { await navigator.share(data); return; } catch (_) {}
  }
  try {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  } catch (_) {
    prompt('Copy this link:', url);
  }
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_LIKES     = 'nuesa_liked_posts';
const LS_BOOKMARKS = 'nuesa_bookmarked_posts';
const loadLS  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const saveLS  = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ─── relative time ────────────────────────────────────────────────────────────
const relTime = (date) => {
  const h = Math.floor((Date.now() - new Date(date)) / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
};

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const { logout, user, getAccessTokenSilently } = useAuth0();

  const [posts, setPosts]                       = useState([]);
  const [filteredPosts, setFilteredPosts]       = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null); // ← NEW: track fetch errors
  const [activeCategory, setActiveCategory]     = useState('Recommended');
  const [activeMenu, setActiveMenu]             = useState('feed');
  const [searchQuery, setSearchQuery]           = useState('');
  const [expandedPost, setExpandedPost]         = useState(null);
  const [likedPosts, setLikedPosts]             = useState(() => loadLS(LS_LIKES));
  const [bookmarkedPosts, setBookmarkedPosts]   = useState(() => loadLS(LS_BOOKMARKS));
  const [likeCounts, setLikeCounts]             = useState({});

  const categories = [
    'Recommended',
    ...new Set(posts.map(post => post.category).filter(Boolean))
  ];

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  // ─── fetch ──────────────────────────────────────────────────────────────────
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/posts`, {
        timeout: 15000
      });
      const now = new Date();
      const ranked = res.data.map((post) => {
        const h = (now - new Date(post.createdAt)) / 3600000;
        const e = (post.metrics?.likes?.length || 0) * 3
                + (post.metrics?.shares || 0) * 5
                + (post.metrics?.views  || 0) * 0.2;
        return { ...post, decayScore: e / Math.pow(h + 2, 1.5) };
      });
      ranked.sort((a, b) => b.decayScore - a.decayScore);
      setPosts(ranked);
      const counts = {};
      ranked.forEach((p) => { counts[p._id] = p.metrics?.likes?.length || 0; });
      setLikeCounts(counts);
    } catch (err) {
      console.error('fetchPosts:', err);
      setError('Could not load posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── FIXED: call fetchPosts on mount ────────────────────────────────────────
  useEffect(() => {
    fetchPosts();
  }, []);

  // ─── like (sends Auth0 token) ────────────────────────────────────────────────
  const toggleLike = async (postId, e) => {
    e?.stopPropagation();
    const prev      = { ...likedPosts };
    const wasLiked  = !!prev[postId];
    const next      = { ...prev, [postId]: !wasLiked };
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
      await axios.patch(
        `${API_BASE_URL}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // rollback
      setLikedPosts(prev);
      saveLS(LS_LIKES, prev);
      setLikeCounts((c) => ({ ...c, [postId]: (c[postId] || 0) + (wasLiked ? 1 : -1) }));
      console.error('Like error:', err);
    }
  };

  // ─── bookmark (local only) ───────────────────────────────────────────────────
  const toggleBookmark = (postId, e) => {
    e?.stopPropagation();
    const next = { ...bookmarkedPosts, [postId]: !bookmarkedPosts[postId] };
    if (!next[postId]) delete next[postId];
    setBookmarkedPosts(next);
    saveLS(LS_BOOKMARKS, next);
  };

  // ─── filter ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let r = [...posts];

    if (activeCategory !== 'Recommended') {
      r = r.filter((p) =>
        (p.category || '').toLowerCase().trim() === activeCategory.toLowerCase().trim()
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

  // ─── increment views when a post is opened ───────────────────────────────────
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

  // ─── socket io ───────────────────────────────────────────────────────────────
  useEffect(() => {
    initializeSocketListeners({ fetchPosts, setLikeCounts, setPosts });
    return () => { removeSocketListeners(); };
  }, []);

  const showHero  = activeCategory === 'Recommended' && !searchQuery && filteredPosts.length > 0;
  const heroPost  = showHero ? filteredPosts[0] : null;
  const gridPosts = showHero ? filteredPosts.slice(1) : filteredPosts;

  // ─── loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-800 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-semibold">Loading news feed…</p>
    </div>
  );

  // ─── FIXED: error state instead of blank screen ──────────────────────────────
  if (error) return (
    <div className="h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Layers size={32} className="text-slate-300" />
      <h2 className="text-lg font-black text-slate-800">Failed to load posts</h2>
      <p className="text-sm text-slate-500">{error}</p>
      <button
        onClick={fetchPosts}
        className="mt-2 bg-blue-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-950 transition"
      >
        Try again
      </button>
    </div>
  );

  // ─── card ────────────────────────────────────────────────────────────────────
  const NewsCard = ({ post }) => {
    const isLiked      = !!likedPosts[post._id];
    const isBookmarked = !!bookmarkedPosts[post._id];
    const count        = likeCounts[post._id] ?? 0;
    const excerpt      = stripHtml(post.content).slice(0, 120);

    return (
      <article
        onClick={() => setExpandedPost(post)}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col h-full"
      >
        {post.image?.url ? (
          <div className="h-48 overflow-hidden shrink-0">
            <img src={post.image.url} alt={post.title} loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition duration-500" />
          </div>
        ) : (
          <div className="h-48 bg-slate-100 flex items-center justify-center shrink-0">
            <Layers size={26} className="text-slate-300" />
          </div>
        )}

        <div className="px-5 pt-4 pb-2 flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">{post.category}</span>
            <span className="text-[10px] text-slate-400">{relTime(post.createdAt)}</span>
          </div>
          <h4 className="text-base font-black text-slate-900 leading-snug line-clamp-2">{post.title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">{excerpt}</p>
        </div>

        <div className="flex items-center justify-between px-5 py-3 mt-2 border-t border-slate-100"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4">
            <button onClick={(e) => toggleLike(post._id, e)}
              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}>
              <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} /><span>{count}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); sharePost(post); }}
              className="text-slate-400 hover:text-blue-700 transition-colors">
              <Share2 size={15} />
            </button>
            <button onClick={(e) => toggleBookmark(post._id, e)}
              className={`transition-colors ${isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
              <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setExpandedPost(post); }}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-800 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors">
            Read more <ArrowRight size={11} />
          </button>
        </div>
      </article>
    );
  };

  // ─── main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-100 min-h-screen pb-32 text-slate-900">

      {isAdmin && (
        <div className="sticky top-0 z-[80] bg-blue-900 text-white px-6 py-2 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />Admin Session Active
          </span>
          <a href="/admin" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition">Dashboard</a>
        </div>
      )}

      {/* HEADER */}
      <header className={`sticky z-50 bg-white border-b border-slate-200 shadow-sm ${isAdmin ? 'top-[36px]' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => { setActiveMenu('feed'); setActiveCategory('Recommended'); setSearchQuery(''); }}>
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-sm shadow">N</div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-blue-900 leading-none">NUESA<span className="text-slate-800">IO</span></h1>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Campus News Feed</p>
            </div>
          </div>

          <div className="hidden sm:block relative w-full max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} placeholder="Search news..."
              onChange={(e) => { setSearchQuery(e.target.value); setActiveMenu('feed'); }}
              className="w-full bg-slate-100 rounded-full pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-800" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={13} /></button>
            )}
          </div>

          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="p-2 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition shrink-0">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* MOBILE SEARCH */}
      <div className="sm:hidden px-4 pt-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} placeholder="Search news..."
            onChange={(e) => { setSearchQuery(e.target.value); setActiveMenu('feed'); }}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm outline-none" />
        </div>
      </div>

      {/* ── FEED ────────────────────────────────────────────────────────────── */}
      {activeMenu === 'feed' && (
        <>
          <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                  activeCategory === cat
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-800 hover:text-blue-800'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          <main className="max-w-6xl mx-auto px-4 space-y-6">
            {/* HERO */}
            {showHero && heroPost && (
              <div onClick={() => setExpandedPost(heroPost)}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-[360px] md:h-[420px] shadow-md">
                <img
                  src={heroPost.image?.url || 'https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=1400'}
                  alt={heroPost.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-3">
                    <Flame size={11} /> TRENDING
                  </div>
                  <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-2 line-clamp-2">{heroPost.title}</h2>
                  <div classNam e="flex items-center gap-2 text-xs text-white/60 font-semibold uppercase tracking-wider">
                    <span>{heroPost.category}</span><span>·</span>
                    <span>{relTime(heroPost.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-base font-black text-slate-800">
              {searchQuery ? `Results (${filteredPosts.length})` : activeCategory === 'Recommended' ? 'Latest updates' : activeCategory}
            </h3>

            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                {gridPosts.map((post) => <NewsCard key={post._id} post={post} />)}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                <Layers size={20} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-black text-base mb-1">No posts found</h3>
                <p className="text-sm text-slate-500">Try another search or category.</p>
              </div>
            )}
          </main>
        </>
      )}

      {/* ── EXPLORE ───────────────────────────────────────────────────────── */}
      {activeMenu === 'explore' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-black mb-6">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.filter((c) => c !== 'Recommended').map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setActiveMenu('feed'); }}
                className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-blue-800 hover:shadow-md transition">
                <Compass size={22} className="text-blue-900 mb-3" />
                <h3 className="font-black text-slate-800">{cat}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {posts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length} updates
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SAVED ─────────────────────────────────────────────────────────── */}
      {activeMenu === 'saved' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-black mb-6">Saved Posts</h2>
          {Object.keys(bookmarkedPosts).length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <Bookmark size={28} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No saved posts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.filter((p) => !!bookmarkedPosts[p._id]).map((post) => (
                <div key={post._id} onClick={() => setExpandedPost(post)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                    <img src={post.image?.url || 'https://picsum.photos/300'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs uppercase font-black text-blue-800">{post.category}</span>
                    <h4 className="font-black text-base mt-0.5 line-clamp-2">{post.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{relTime(post.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* ── EXPANDED POST ─────────────────────────────────────────────────── */}
      {expandedPost && (
        <div className="fixed inset-0 z-[200] bg-slate-100 overflow-y-auto">

          {/* TOP BAR */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <button onClick={() => setExpandedPost(null)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-900 transition">
                <X size={18} /> Close
              </button>
              <div className="flex items-center gap-3">
                <button onClick={(e) => toggleLike(expandedPost._id, e)}
                  className={`flex items-center gap-1.5 text-sm font-bold transition ${likedPosts[expandedPost._id] ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'}`}>
                  <Heart size={17} fill={likedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
                  {likeCounts[expandedPost._id] ?? 0}
                </button>
                <button onClick={(e) => toggleBookmark(expandedPost._id, e)}
                  className={`transition ${bookmarkedPosts[expandedPost._id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
                  <Bookmark size={17} fill={bookmarkedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => sharePost(expandedPost)}
                  className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-bold px-4 py-1.5 rounded-full hover:bg-blue-950 transition">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>

          {/* HERO IMAGE */}
          {expandedPost.image?.url && (
            <div className="w-full h-[260px] md:h-[400px] overflow-hidden">
              <img src={expandedPost.image.url} alt={expandedPost.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* ARTICLE BODY */}
          <article className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-50 text-blue-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                {expandedPost.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{relTime(expandedPost.createdAt)}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black leading-tight text-slate-900 mb-4">
              {expandedPost.title}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-400 mb-6 pb-6 border-b border-slate-200">
              <Eye size={13} /><span>{expandedPost.metrics?.views || 0} views</span>
              <span>·</span>
              <Heart size={13} /><span>{likeCounts[expandedPost._id] ?? 0} likes</span>
            </div>

            <div
              className="prose prose-slate prose-base max-w-none
                break-words overflow-hidden
                prose-headings:font-black prose-headings:text-slate-900
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-p:break-words
                prose-a:text-blue-800 prose-a:font-semibold
                prose-a:break-all
                prose-strong:text-slate-900
                prose-img:rounded-xl
                prose-img:max-w-full
                prose-img:h-auto
                prose-pre:overflow-x-auto
                prose-code:break-words
                prose-li:text-slate-700"
              dangerouslySetInnerHTML={{ __html: expandedPost.content }}
            />

            {/* BOTTOM ACTIONS */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button onClick={(e) => toggleLike(expandedPost._id, e)}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${
                    likedPosts[expandedPost._id] ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-500'
                  }`}>
                  <Heart size={15} fill={likedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
                  {likedPosts[expandedPost._id] ? 'Liked' : 'Like'} · {likeCounts[expandedPost._id] ?? 0}
                </button>
                <button onClick={(e) => toggleBookmark(expandedPost._id, e)}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition ${
                    bookmarkedPosts[expandedPost._id] ? 'text-amber-500 border-amber-200 bg-amber-50' : 'text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-500'
                  }`}>
                  <Bookmark size={15} fill={bookmarkedPosts[expandedPost._id] ? 'currentColor' : 'none'} />
                  {bookmarkedPosts[expandedPost._id] ? 'Saved' : 'Save'}
                </button>
              </div>
              <button onClick={() => sharePost(expandedPost)}
                className="flex items-center gap-2 bg-blue-900 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-blue-950 transition">
                <Share2 size={14} /> Share this post
              </button>
            </div>
          </article>

          <CommentsSection
            expandedPost={expandedPost}
            user={user}
            getAccessTokenSilently={getAccessTokenSilently}
          />
        </div>
      )}
    </div>
  );
};

export default Home;