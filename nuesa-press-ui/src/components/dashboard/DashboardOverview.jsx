

import { useEffect, useState, useCallback} from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { socket } from '../../api/socket';
import { SOCKET_EVENTS } from '../../utils/socketEvents';
import API from '../../api/api';

import {
  BarChart3,
  // ArrowUpRight,
  Users,
  Eye,
  Share2,
  TrendingUp
} from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  // ---------- FETCH DASHBOARD ----------
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await API.get('/api/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err.message);
    }
  }, []);

  // ---------- FETCH CHART ----------
  const fetchChart = useCallback(async () => {
    try {
      const res = await API.get('/api/analytics/daily-posts');

      const data = Array.isArray(res.data) ? res.data : [];

      const formatted = data.map((item, i) => ({
        name: item.date || `Day ${i + 1}`,
        views: item.totalViews || item.totalPosts || 0
      }));

      setChartData(formatted);
    } catch (err) {
      console.error('Chart fetch error:', err.message);
    }
  }, []) ;

  // ---------- INIT ----------
  useEffect(() => {
    const init = async () => {
    fetchDashboard();
    fetchChart();
    };


    init();

    const update = () => {
      fetchDashboard();
      fetchChart();
    };

    socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, update);

    return () => socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE, update);
  }, [fetchDashboard, fetchChart]);

  if (!stats) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ---------- TOP STATS ROW ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total Views
            </p>
            <p className="text-xl font-black text-slate-900">
              {stats?.totalViews?.toLocaleString?.() || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total Users
            </p>
            <p className="text-xl font-black text-slate-900">
              {stats?.totalUsers || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
            <Share2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total Shares
            </p>
            <p className="text-xl font-black text-slate-900">
              {stats?.totalShares || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Total Likes
            </p>
            <p className="text-xl font-black text-slate-900">
              {stats?.totalLikes || 0}
            </p>
          </div>
        </div>

      </div>

      {/* ---------- CHART ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">

          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-slate-800">Engagement Traffic</h3>
              <p className="text-xs text-slate-400 font-medium">
                Weekly views overview
              </p>
            </div>

            <span className="text-emerald-500 text-xs font-black bg-emerald-50 px-3 py-1 rounded-lg">
              Live
            </span>
          </div>

          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------- RIGHT SIDE CARDS ---------- */}
        <div className="space-y-6">

          <div className="bg-slate-900 p-8 rounded-4xl text-white shadow-xl relative overflow-hidden group">
            <BarChart3 className="absolute -right-2.5 -bottom-2.5 text-white/10" size={120} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              NUESA Live Metric
            </p>
            <p className="text-4xl font-black mt-2">
              {stats?.totalViews ? `${(stats.totalViews / 1000).toFixed(1)}k` : '0'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Total Platform Reach
            </p>
          </div>

          <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm flex flex-col justify-between h-48">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                System Status
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-lg font-bold text-slate-800">
                  Server Operational
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Last synced: Just now
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;