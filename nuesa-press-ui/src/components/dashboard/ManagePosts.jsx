import { useState } from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';

const ManagePosts = ({ onEdit, onDelete, posts = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-slate-800">Live Articles</h3>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />

          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="p-6">Content</th>
              <th className="p-6">stats</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredPosts.map((post) => (
              <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="font-bold text-slate-900 leading-tight">
                    {post.title}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {post.category}
                  </p>
                </td>

                <td className="p-6">
                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                    {/* <span className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'/> */}
                    {post?.metrics?.views || 0} views 
                  </p>
                </td>

                <td className="p-6">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Published
                  </span>
                </td>

                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() => onEdit(post)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors inline-block"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    onClick={() => onDelete(post._id)}
                    className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors inline-block"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePosts;