// import React from 'react';

// const BreakingNews = ({ topPost }) => {
//   if (!topPost) {
//     return (
//       <div className="h-64 w-full bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
//         No active stories on the wire...
//       </div>
//     );
//   }

//   return (
//     <div className="relative h-64 w-full rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer border border-slate-100">
//       <img 
//         src={topPost.image?.url || "https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070"} 
//         className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" 
//         alt="Hot Spotlight" 
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
//       <div className="absolute bottom-6 left-6 right-6">
//         <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black flex items-center w-fit gap-1 mb-2">
//           <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> ALGORITHM SPOTLIGHT
//         </span>
//         <h4 className="text-white text-xl font-black leading-tight mb-2 line-clamp-2">
//           {topPost.title}
//         </h4>
//         <div className="flex items-center gap-3 text-slate-300 text-xs font-semibold">
//           <span className="text-blue-400 font-bold uppercase">{topPost.category}</span>
//           <span>•</span>
//           <span>{new Date(topPost.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BreakingNews;


import React from 'react';

const formatTime = (date) => {
  const now = new Date();
  const postDate = new Date(date);

  const diffMs = now - postDate;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Just now';
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return postDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const BreakingNews = ({ topPost, onExpand }) => {

  if (!topPost) {
    return (
      <div className="h-72 bg-white rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
        No active stories available...
      </div>
    );
  }

  return (
    <div
      onClick={() => onExpand(topPost)}
      className="relative h-[420px] w-full rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl group"
    >

      <img
        src={
          topPost.image?.url ||
          "https://images.unsplash.com/photo-1504711432869-efd597cdd047?q=80&w=2070"
        }
        alt={topPost.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-7">

        <div className="flex items-center gap-2 mb-3">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            Breaking
          </span>

          <span className="text-white/80 text-xs font-semibold">
            {formatTime(topPost.createdAt)}
          </span>
        </div>

        <h2 className="text-white text-2xl md:text-3xl font-black leading-tight mb-4 line-clamp-2">
          {topPost.title}
        </h2>

        <div className="flex items-center gap-3">
          <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs text-white font-bold uppercase">
            {topPost.category}
          </span>

          <span className="text-white/70 text-xs">
            by {topPost.authorName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BreakingNews;