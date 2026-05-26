// import React, { useState } from 'react';
// import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

// const NewsCard = ({ post, onExpand }) => {
//   const [liked, setLiked] = useState(false);
//   const textPreview = post.content ? post.content.replace(/<[^>]*>/g, '') : '';

//   return (
//     <div 
//       onClick={() => onExpand(post)}
//       className="bg-white border border-slate-200 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer p-4 md:p-5 flex gap-4 text-left"
//     >
//       {/* Mini Profile/Category Icon Placeholder like X */}
//       <div className="shrink-0">
//         <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-100">
//           {post.category ? post.category[0] : 'N'}
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 min-w-0">
//         {/* Meta Header */}
//         <div className="flex items-center gap-2 text-xs mb-1">
//           <span className="font-black text-slate-900 hover:underline">{post.category || 'Faculty News'}</span>
//           <span className="text-slate-400">•</span>
//           <span className="text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
//         </div>

//         {/* Title & Content Preview */}
//         <h4 className="text-slate-900 font-bold text-base md:text-lg leading-snug mb-2 break-words">
//           {post.title}
//         </h4>
        
//         {post.image?.url && (
//           <div className="my-3 rounded-2xl overflow-hidden border border-slate-100 max-h-72 bg-slate-50">
//             <img src={post.image.url} className="w-full h-full object-cover" alt="Post attachment" />
//           </div>
//         )}

//         <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-3 mb-4 break-words">
//           {textPreview}
//         </p>

//         {/* --- BASELINE X-STYLE ACTIONS --- */}
//         <div className="flex justify-between items-center text-slate-400 max-w-md pt-1" onClick={(e) => e.stopPropagation()}>
//           <button className="flex items-center gap-2 text-xs font-bold hover:text-blue-500 transitiongroup">
//             <div className="p-2 rounded-full group-hover:bg-blue-50 transition"><MessageCircle size={16} /></div>
//             <span>{post.comments?.length || 0}</span>
//           </button>
          
//           <button 
//             onClick={() => setLiked(!liked)} 
//             className={`flex items-center gap-2 text-xs font-bold transition group ${liked ? 'text-rose-600' : 'hover:text-rose-600'}`}
//           >
//             <div className={`p-2 rounded-full group-hover:bg-rose-50 transition`}>
//               <Heart size={16} fill={liked ? "currentColor" : "none"} />
//             </div>
//             <span>{(post.metrics?.likes?.length || 0) + (liked ? 1 : 0)}</span>
//           </button>

//           <button className="flex items-center gap-2 text-xs font-bold hover:text-emerald-500 transition group">
//             <div className="p-2 rounded-full group-hover:bg-emerald-50 transition"><Share2 size={16} /></div>
//           </button>

//           <button className="text-slate-400 hover:text-blue-500 transition group p-2 rounded-full hover:bg-blue-50">
//             <Bookmark size={16} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewsCard;

import React from 'react';
import {
  Heart,
  Share2,
  Bookmark,
  Eye
} from 'lucide-react';

const formatTime = (date) => {
  const now = new Date();
  const postDate = new Date(date);

  const diffMs = now - postDate;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Now';
  }

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return postDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NewsCard = ({
  post,
  onExpand,
  onLike,
  onShare,
  onBookmark,
  isLiked,
  isBookmarked
}) => {

  const textPreview = post.content
    ? post.content.replace(/<[^>]*>/g, '')
    : '';

  return (
    <div
      onClick={() => onExpand(post)}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >

      {/* IMAGE */}
      {post.image?.url && (
        <div className="w-full h-64 overflow-hidden bg-slate-100">
          <img
            src={post.image.url}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition duration-700"
          />
        </div>
      )}

      {/* CONTENT */}
      <div className="p-5">

        {/* TOP META */}
        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <img
              src={
                post.avatar ||
                "https://i.pravatar.cc/100"
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />

            <div>
              <h4 className="text-sm font-black text-slate-800">
                {post.fullName}
              </h4>

              <p className="text-xs text-slate-400">
                {formatTime(post.createdAt)}
              </p>
            </div>
          </div>

          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-black text-slate-900 leading-tight mb-3 line-clamp-2">
          {post.title}
        </h2>

        {/* PREVIEW */}
        <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
          {textPreview}
        </p>

        {/* ACTIONS */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100"
        >

          {/* LIKE */}
          <button
            onClick={() => onLike(post._id)}
            className={`flex items-center gap-2 transition ${
              isLiked
                ? 'text-rose-600'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart
              size={18}
              fill={isLiked ? 'currentColor' : 'none'}
            />

            <span className="text-sm font-bold">
              {post.metrics?.likes?.length || 0}
            </span>
          </button>

          {/* VIEWS */}
          <div className="flex items-center gap-2 text-slate-500">
            <Eye size={18} />

            <span className="text-sm font-bold">
              {post.metrics?.views || 0}
            </span>
          </div>

          {/* SHARE */}
          <button
            onClick={() => onShare(post)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition"
          >
            <Share2 size={18} />

            <span className="text-sm font-bold">
              {post.metrics?.shares || 0}
            </span>
          </button>

          {/* BOOKMARK */}
          <button
            onClick={() => onBookmark(post._id)}
            className={`transition ${
              isBookmarked
                ? 'text-amber-500'
                : 'text-slate-500 hover:text-amber-500'
            }`}
          >
            <Bookmark
              size={18}
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;