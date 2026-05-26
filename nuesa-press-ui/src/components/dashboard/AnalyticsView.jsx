


// import React, { useEffect, useMemo, useState } from 'react';
// import { socket } from '../../api/socket';
// import { SOCKET_EVENTS } from '../../utils/socketEvents';

// import {
//   TrendingUp,
//   Globe,
//   Clock,
//   Share2,
//   Eye,
//   FileText
// } from 'lucide-react';

// const AnalyticsView = ({ posts = [] }) => {
//   const [livePosts, setLivePosts] = useState(posts);

//   // UPDATE POSTS WHEN PARENT DATA CHANGES
//   useEffect(() => {
//     setLivePosts(posts);
//   }, [posts]);

//   // LIVE SOCKET UPDATE
//   useEffect(() => {
//     const handleUpdate = (updatedPosts) => {
//       // if backend sends fresh posts
//       if (updatedPosts) {
//         setLivePosts(updatedPosts);
//       }
//     };

//     socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, handleUpdate);

//     return () => {
//       socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE, handleUpdate);
//     };
//   }, []);

//   // REAL ANALYTICS
//   const analytics = useMemo(() => {
//     const totalViews = livePosts.reduce(
//       (acc, post) => acc + (post?.metrics?.views || 0),
//       0
//     );

//     const totalShares = livePosts.reduce(
//       (acc, post) => acc + (post?.metrics?.shares || 0),
//       0
//     );

//     const totalLikes = livePosts.reduce(
//       (acc, post) => acc + (post?.metrics?.likes?.length || 0),
//       0
//     );

//     const totalPosts = livePosts.length;

//     const activeReaders = Math.floor(totalViews * 0.18);

//     // MOST ACTIVE CATEGORY
//     const categoryMap = {};

//     livePosts.forEach((post) => {
//       const category = post.category || 'General';

//       if (!categoryMap[category]) {
//         categoryMap[category] = 0;
//       }

//       categoryMap[category] += post?.metrics?.views || 0;
//     });

//     const mostActiveCategory =
//       Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
//       'No Data';

//     // SIMPLE GLOBAL REACH LOGIC
//     const globalReach =
//       totalViews > 0
//         ? `${Math.min(100, Math.floor(totalViews / 10))}%`
//         : '0%';

//     return {
//       totalViews,
//       totalShares,
//       totalLikes,
//       totalPosts,
//       activeReaders,
//       mostActiveCategory,
//       globalReach
//     };
//   }, [livePosts]);

//   const stats = [
//     {
//       label: 'Total Views',
//       val: analytics?.totalViews?.toLocaleString() || 0,
//       icon: <Eye size={20} />,
//       color: 'text-blue-500'
//     },

//     {
//       label: 'Total Shares',
//       val: analytics?.totalShares?.toLocaleString() || 0,
//       icon: <Share2 size={20} />,
//       color: 'text-emerald-500'
//     },

//     {
//       label: 'Published Posts',
//       val: analytics?.totalPosts || 0,
//       icon: <FileText size={20} />,
//       color: 'text-purple-500'
//     },

//     {
//       label: 'Total Likes',
//       val: analytics?.totalLikes || 0 ,
//       icon: <TrendingUp size={20} />,
//       color: 'text-amber-500'
//     }
//   ];

//   // TRAFFIC SOURCE MOCK LIVE DISTRIBUTION
//   const trafficSources = [
//     {
//       source: 'WhatsApp',
//       percent: 85
//     },
//     {
//       source: 'Direct Link',
//       percent: 45
//     },
//     {
//       source: 'Faculty Portal',
//       percent: 30
//     },
//     {
//       source: 'Twitter/X',
//       percent: 20
//     }
//   ];

//   return (
//     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

//       {/* STATS */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((s) => (
//           <div
//             key={s.label}
//             className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center"
//           >
//             <div className={`p-3 rounded-2xl bg-slate-50 ${s.color} mb-3`}>
//               {s.icon}
//             </div>

//             <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
//               {s.label}
//             </p>

//             <p className="text-xl font-black text-slate-900 mt-1">
//               {s.val}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* ANALYTICS PANELS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* PLATFORM SUMMARY */}
//         <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
//           <h3 className="font-bold text-slate-800 mb-6">
//             Platform Summary
//           </h3>

//           <div className="space-y-4">

//             <div className="flex justify-between items-center">
//               <span className="text-sm text-slate-500 font-medium">
//                 Active Readers
//               </span>

//               <span className="font-black text-slate-900">
//                 {analytics.activeReaders}
//               </span>
//             </div>

//             <div className="flex justify-between items-center">
//               <span className="text-sm text-slate-500 font-medium">
//                 Global Reach
//               </span>

//               <span className="font-black text-slate-900">
//                 {analytics.globalReach}
//               </span>
//             </div>

//             <div className="flex justify-between items-center">
//               <span className="text-sm text-slate-500 font-medium">
//                 Most Active Category
//               </span>

//               <span className="font-black text-slate-900">
//                 {analytics.mostActiveCategory}
//               </span>
//             </div>

//             <div className="flex justify-between items-center">
//               <span className="text-sm text-slate-500 font-medium">
//                 Total Engagement
//               </span>

//               <span className="font-black text-slate-900">
//                 {(
//                   analytics.totalViews +
//                   analytics.totalShares +
//                   analytics.totalLikes
//                 ).toLocaleString()}
//               </span>
//             </div>

//           </div>
//         </div>

//         {/* TRAFFIC SOURCES */}
//         <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
//           <h3 className="font-bold text-slate-800 mb-6">
//             Traffic Sources
//           </h3>

//           <div className="space-y-4">

//             {trafficSources.map((item) => (
//               <div
//                 key={item.source}
//                 className="flex items-center gap-4"
//               >
//                 <span className="text-xs font-bold text-slate-500 w-24">
//                   {item.source}
//                 </span>

//                 <div className="flex-1 bg-slate-50 h-3 rounded-full overflow-hidden">
//                   <div
//                     className="bg-blue-600 h-full rounded-full transition-all duration-700"
//                     style={{ width: `${item.percent}%` }}
//                   />
//                 </div>

//                 <span className="text-xs font-black text-slate-900">
//                   {item.percent}%
//                 </span>
//               </div>
//             ))}

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AnalyticsView;


import { useEffect, useMemo, useState, useCallback } from 'react';
import API from '../../api/api';
import { socket } from '../../api/socket';
import { SOCKET_EVENTS } from '../../utils/socketEvents';

import {
  TrendingUp,
  // Globe,
  // Clock,
  Share2,
  Eye,
  FileText
} from 'lucide-react';

const AnalyticsView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // FETCH FROM BACKEND
  // -------------------------
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await API.get('/api/posts');
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    const init  = async () => {
      await fetchAnalytics();
    }
    init();
  }, [fetchAnalytics]);

  // -------------------------
  // SOCKET (SAFE FIX)
  // -------------------------
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchAnalytics(); // always refetch fresh data
    };

    socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, handleUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE, handleUpdate);
    };
  }, [fetchAnalytics]);

  // -------------------------
  // CALCULATIONS (YOUR ORIGINAL LOGIC)
  // -------------------------
  const analytics = useMemo(() => {
    const totalViews = posts.reduce(
      (acc, post) => acc + (post?.metrics?.views || 0),
      0
    );

    const totalShares = posts.reduce(
      (acc, post) => acc + (post?.metrics?.shares || 0),
      0
    );

    const totalLikes = posts.reduce(
      (acc, post) => acc + (post?.metrics?.likes?.length || 0),
      0
    );

    const totalPosts = posts.length;

    const activeReaders = Math.floor(totalViews * 0.18);

    // CATEGORY STATS
    const categoryMap = {};

    posts.forEach((post) => {
      const cat = post.category || 'General';
      categoryMap[cat] =
        (categoryMap[cat] || 0) + (post?.metrics?.views || 0);
    });

    const mostActiveCategory =
      Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'No Data';

    const globalReach =
      totalViews > 0
        ? `${Math.min(100, Math.floor(totalViews / 10))}%`
        : '0%';

    return {
      totalViews,
      totalShares,
      totalLikes,
      totalPosts,
      activeReaders,
      mostActiveCategory,
      globalReach
    };
  }, [posts]);

  // -------------------------
  // UI STATS (YOUR ORIGINAL STYLE)
  // -------------------------
  const stats = [
    {
      label: 'Total Views',
      val: analytics.totalViews.toLocaleString(),
      icon: <Eye size={20} />,
      color: 'text-blue-500'
    },
    {
      label: 'Total Shares',
      val: analytics.totalShares.toLocaleString(),
      icon: <Share2 size={20} />,
      color: 'text-emerald-500'
    },
    {
      label: 'Published Posts',
      val: analytics.totalPosts,
      icon: <FileText size={20} />,
      color: 'text-purple-500'
    },
    {
      label: 'Total Likes',
      val: analytics.totalLikes,
      icon: <TrendingUp size={20} />,
      color: 'text-amber-500'
    }
  ];

  if (loading) {
    return <p className="p-6">Loading analytics...</p>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* STATS GRID (UNCHANGED UI STYLE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
          >
            <div className={`p-3 rounded-2xl bg-slate-50 ${s.color} mb-3`}>
              {s.icon}
            </div>

            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
              {s.label}
            </p>

            <p className="text-xl font-black text-slate-900 mt-1">
              {s.val}
            </p>
          </div>
        ))}
      </div>

      {/* PLATFORM SUMMARY (UNCHANGED STYLE) */}
     <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
  <h3 className="font-bold text-slate-800 mb-6">
    Platform Summary
  </h3>

  <div className="space-y-5">

    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500 font-medium">
        Active Readers
      </span>
      <span className="font-black text-slate-900">
        {analytics.activeReaders}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500 font-medium">
        Global Reach
      </span>
      <span className="font-black text-slate-900">
        {analytics.globalReach}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500 font-medium">
        Most Active Category
      </span>
      <span className="font-black text-slate-900">
        {analytics.mostActiveCategory}
      </span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500 font-medium">
        Total Engagement
      </span>
      <span className="font-black text-slate-900">
        {(
          analytics.totalViews +
          analytics.totalShares +
          analytics.totalLikes
        ).toLocaleString()}
      </span>
    </div>

  </div>
{/* </div> */}

      </div>
    </div>
  );
};

export default AnalyticsView;