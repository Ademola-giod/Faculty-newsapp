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
     <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
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